import { redis } from "./redis";

// Un contador por día, en hora de España: "2026-10-05"
export const fechaES = (d = new Date()) =>
  d.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

const claveDia = (fecha: string) => `quecoche:dia:${fecha}`;

// Suma 1 a cada campo del día de hoy. Nunca lanza error:
// si Redis falla, la web sigue funcionando y solo se pierde el dato.
export async function contar(...campos: string[]) {
  if (!redis || campos.length === 0) return;
  try {
    const clave = claveDia(fechaES());
    const pipeline = redis.pipeline();
    for (const campo of campos) pipeline.hincrby(clave, campo, 1);
    pipeline.expire(clave, 60 * 60 * 24 * 90); // se borra solo a los 90 días
    await pipeline.exec();
  } catch (err) {
    console.error("Error al contar:", err);
  }
}

// Las últimas n fechas, de hoy hacia atrás (sin problemas con el cambio de hora)
function ultimosDias(n: number) {
  const hoy = new Date(`${fechaES()}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy);
    d.setUTCDate(d.getUTCDate() - i);
    return d.toISOString().slice(0, 10);
  });
}

function resumir(fecha: string, datos: Record<string, number> | null) {
  const d = datos ?? {};
  const num = (campo: string) => Number(d[campo]) || 0;

  // Campos "prefijo:nombre" agrupados: modelo de Gemini y clics de afiliado
  const grupo = (prefijo: string) => {
    const r: Record<string, number> = {};
    for (const [campo, valor] of Object.entries(d)) {
      if (campo.startsWith(prefijo)) r[campo.slice(prefijo.length)] = Number(valor) || 0;
    }
    return r;
  };

  return {
    fecha,
    analisis: num("analisis"),
    noCoche: num("nocoche"),
    errores: num("errores"),
    rechazadosPorIp: num("rechazados_ip"),
    rechazadosPorTopeDiario: num("rechazados_global"),
    modelos: grupo("modelo:"),
    clicsAfiliado: grupo("afiliado:"),
  };
}

export async function leerDias(n: number) {
  const db = redis;
  if (!db) return [];
  const fechas = ultimosDias(n);
  const filas = await Promise.all(
    fechas.map((f) => db.hgetall<Record<string, number>>(claveDia(f)))
  );
  return fechas.map((fecha, i) => resumir(fecha, filas[i]));
}