import { MAX_INTENTOS, hoy, jugar } from "../../lib/adivina";

// Recibe todos los intentos de la partida y devuelve la comparación de cada uno
// y las pistas descubiertas. El coche del día solo se revela al terminar.
export async function POST(req: Request) {
  let intentos: string[] = [];
  let fecha = hoy();
  try {
    const cuerpo = await req.json();
    if (Array.isArray(cuerpo?.intentos)) {
      intentos = cuerpo.intentos
        .filter((s: unknown): s is string => typeof s === "string" && /^[a-z0-9-]+\/[a-z0-9-]+$/.test(s))
        .slice(0, MAX_INTENTOS);
    }
    // Se acepta la fecha de la partida empezada solo si es hoy o ayer (cambio de día a medianoche)
    const ayer = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(
      new Date(Date.now() - 86400000)
    );
    if (cuerpo?.fecha === ayer) fecha = ayer;
  } catch {
    return Response.json({ error: "Petición no válida" }, { status: 400 });
  }

  const partida = await jugar(intentos, fecha);
  if (!partida) return Response.json({ error: "Hoy no hay juego" }, { status: 503 });
  return Response.json(partida, { headers: { "Cache-Control": "no-store" } });
}
