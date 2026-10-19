import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../lib/redis";

// Máximo 20 votos por hora y por IP, para que nadie infle los números
const limite = redis
  ? new Ratelimit({
      redis,
      prefix: "quecoche:fb",
      limiter: Ratelimit.slidingWindow(20, "1 h"),
    })
  : null;

function getIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anon";
}

export async function POST(req: Request) {
  try {
    // Sin Redis (por ejemplo en local) no hace nada, pero no da error
    if (!redis) return NextResponse.json({ ok: true });

    if (limite) {
      const { success } = await limite.limit(getIp(req));
      if (!success) return NextResponse.json({ ok: false }, { status: 429 });
    }

    const { voto } = await req.json();
    if (voto !== "si" && voto !== "no") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Solo suma 1 a un contador: no se guarda foto, resultado ni IP
    await redis.incr(`quecoche:feedback:${voto}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en feedback:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}