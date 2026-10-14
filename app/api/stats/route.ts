import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { leerDias } from "../../lib/contadores";

export const dynamic = "force-dynamic";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Uso: https://tu-dominio/api/stats?clave=TU_STATS_KEY
// Si no defines STATS_KEY en Vercel, esta ruta queda desactivada.
export async function GET(req: Request) {
  const clave = process.env.STATS_KEY;
  const recibida = new URL(req.url).searchParams.get("clave");

  if (!clave || recibida !== clave || !redis) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const [si, no, dias] = await Promise.all([
    redis.get<number>("quecoche:feedback:si"),
    redis.get<number>("quecoche:feedback:no"),
    leerDias(7),
  ]);

  const totalSi = Number(si) || 0;
  const totalNo = Number(no) || 0;
  const total = totalSi + totalNo;

  return NextResponse.json(
    {
      // Votos del botón «¿Ha acertado?»
      si: totalSi,
      no: totalNo,
      total,
      acierto: total ? `${Math.round((totalSi / total) * 100)} %` : "sin votos",
      // Hoy: análisis, errores, rechazos y qué modelo ha respondido
      hoy: dias[0],
      // Hoy y los 6 días anteriores
      ultimos7dias: dias,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}