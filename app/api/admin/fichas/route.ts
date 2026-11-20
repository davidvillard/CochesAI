import { NextResponse } from "next/server";
import { redis } from "../../../lib/redis";
import { leerFicha, registrarModelo } from "../../../lib/fichas";
import { POR_PUESTO, marcaYModelo, modelo } from "../../../lib/ventas";

// Crea por adelantado la ficha del siguiente coche más vendido que aún no tiene.
// Uso: POST /api/admin/fichas?clave=TU_STATS_KEY&hasta=150 (o &solo=marca/modelo para una concreta)
// Cada llamada crea una ficha (tarda unos segundos): se llama en bucle.
// Sin la clave responde 404, como si no existiera.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const clave = process.env.STATS_KEY;
  if (!clave || url.searchParams.get("clave") !== clave || !redis) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const hasta = Math.min(Math.max(Number(url.searchParams.get("hasta")) || 150, 1), 400);

  // Los que faltan: sin ficha y sin un intento fallido hoy
  // solo=a/b: crea solo esa ficha (por ejemplo, una que el lote saltó), aunque esté fuera del "hasta"
  const solo = url.searchParams.get("solo");
  const candidatos = solo ? POR_PUESTO.filter((c) => c === solo) : POR_PUESTO.slice(0, hasta);
  const fichas = await redis.mget<unknown[]>(...candidatos.map((c) => `quecoche:ficha:${c}`));
  const intentos = await redis.mget<unknown[]>(...candidatos.map((c) => `quecoche:ficha-intento:${c}`));
  // saltar=a/b,c/d: modelos que la IA no conoce y no merece la pena reintentar
  const saltar = new Set((url.searchParams.get("saltar") ?? "").split(",").filter(Boolean));
  const pendientes = candidatos.filter((c, i) => !fichas[i] && !intentos[i] && !saltar.has(c));
  const siguiente = pendientes[0];
  if (!siguiente) {
    return NextResponse.json({ hecho: true, pendientes: 0, conIntentoHoy: intentos.filter(Boolean).length });
  }

  const { marca, modelo: nombreModelo } = marcaYModelo(siguiente);
  const ficha = await registrarModelo(marca, nombreModelo, { slug: siguiente, contar: false, lote: true });
  // Si se ha guardado como alias de otra ficha (ya existía el modelo base), también vale
  const creada = Boolean(ficha) || Boolean(await leerFicha(siguiente));
  // Un fallo aquí suele ser Gemini saturado: se quita el bloqueo de 24 h que
  // pone registrarModelo, para poder reintentarlo en la siguiente llamada
  if (!creada) await redis.del(`quecoche:ficha-intento:${siguiente}`);
  return NextResponse.json({
    clave: siguiente,
    nombre: modelo(siguiente).nombre,
    puesto: modelo(siguiente).puesto,
    creada,
    ficha,
    pendientes: pendientes.length - 1,
  });
}
