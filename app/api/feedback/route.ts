import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { contar } from "../../lib/contadores";
import { slugModelo } from "../../lib/fichas";
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

    const { voto, marca, modelo } = await req.json();
    if (voto !== "si" && voto !== "no") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Solo suma 1 a contadores: el total y, por día, qué coche se acertó o falló.
    // No se guarda foto, resultado ni IP.
    const slug =
      typeof marca === "string" && typeof modelo === "string"
        ? slugModelo(marca.slice(0, 40), modelo.slice(0, 60))
        : null;
    await Promise.all([
      redis.incr(`quecoche:feedback:${voto}`),
      contar(`voto:${voto}`, ...(slug ? [`${voto === "si" ? "acierto" : "fallo"}:${slug}`] : [])),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en feedback:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}