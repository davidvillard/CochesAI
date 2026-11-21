// "Adivina el coche": cada día hay un coche secreto, el mismo para todos.
// Con cada intento fallido se compara el coche elegido con el secreto
// (marca, país, carrocería, motor, precio y ventas) y se descubre una pista más.
// Todo se calcula en el servidor para que la respuesta no viaje al navegador.

import { redis } from "./redis";
import { leerFicha, listarModelos, type Ficha } from "./fichas";
import { COMBUSTIBLES, POR_PUESTO, claveDeFicha, modelo as ventasDe, type VentasModelo } from "./ventas";

export const MAX_INTENTOS = 6;
const PRIMER_DIA = "2026-11-21"; // el juego nº 1
const CANDIDATOS = 60; // el coche secreto sale de los 60 más vendidos con ficha
const SIN_REPETIR = 45; // días que tarda en poder repetirse un coche
const CLAVE_DIA = (fecha: string) => `quecoche:adivina:dia:${fecha}`;
const CLAVE_USADOS = "quecoche:adivina:usados";

// ---------- Fecha del juego (hora de Madrid) ----------

export function hoy() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

export function numeroDe(fecha: string) {
  const dias = (Date.parse(`${fecha}T12:00:00Z`) - Date.parse(`${PRIMER_DIA}T12:00:00Z`)) / 86400000;
  return Math.max(Math.round(dias) + 1, 1);
}

// ---------- Datos de cada coche ----------

const PAISES: Record<string, string> = {
  seat: "España", cupra: "España", ebro: "España",
  toyota: "Japón", lexus: "Japón", nissan: "Japón", mazda: "Japón", suzuki: "Japón",
  honda: "Japón", mitsubishi: "Japón", subaru: "Japón",
  dacia: "Rumanía",
  renault: "Francia", peugeot: "Francia", citroen: "Francia", ds: "Francia", alpine: "Francia",
  volkswagen: "Alemania", audi: "Alemania", bmw: "Alemania", "mercedes-benz": "Alemania",
  opel: "Alemania", porsche: "Alemania", smart: "Alemania",
  skoda: "Chequia",
  hyundai: "Corea del Sur", kia: "Corea del Sur", ssangyong: "Corea del Sur", kgm: "Corea del Sur",
  mg: "China", byd: "China", omoda: "China", jaecoo: "China", leapmotor: "China", xpeng: "China",
  chery: "China", baic: "China", dfsk: "China", lynk: "China", zeekr: "China", geely: "China",
  ford: "EE. UU.", tesla: "EE. UU.", jeep: "EE. UU.",
  fiat: "Italia", "alfa-romeo": "Italia", lancia: "Italia", abarth: "Italia", maserati: "Italia",
  volvo: "Suecia", polestar: "Suecia",
  mini: "Reino Unido", "land-rover": "Reino Unido", jaguar: "Reino Unido",
};

function carroceria(f: Ficha) {
  const t = `${f.carroceria} ${f.segmento}`.toLowerCase();
  if (/suv|crossover|todocamino/.test(t)) return "SUV";
  if (/todoterreno|4x4/.test(t)) return "Todoterreno";
  if (/pick-?up/.test(t)) return "Pick-up";
  if (/furgoneta|furg[oó]n|combi/.test(t)) return "Furgoneta";
  if (/monovolumen|mpv/.test(t)) return "Monovolumen";
  if (/familiar|ranchera|break|tourer|touring|estate/.test(t)) return "Familiar";
  if (/coup|descapotable|cabrio|roadster|deportivo/.test(t)) return "Deportivo";
  if (/berlina|sed[aá]n|fastback|liftback/.test(t)) return "Berlina";
  if (/utilitario|urbano|segmento a|segmento b/.test(t)) return "Utilitario";
  if (/compacto|hatchback|segmento c/.test(t)) return "Compacto";
  return "Otro";
}

// "Desde 22.900 €..." -> 22900
function precioDesde(f: Ficha) {
  const m = f.precioNuevoEur.match(/\d{1,3}(?:[.\s]\d{3})+|\d{4,6}/);
  const n = m ? Number(m[0].replace(/[.\s]/g, "")) : 0;
  return n >= 3000 ? n : 0;
}

// Combustibles que se venden de ese modelo, de más a menos, con su porcentaje
function reparto(v: VentasModelo) {
  const total = Object.values(v.combustible).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(v.combustible)
    .map(([c, n]) => ({ c, pct: Math.round((n / total) * 100) }))
    .filter((x) => x.pct >= 5)
    .sort((a, b) => b.pct - a.pct);
}

type Coche = {
  slug: string;
  nombre: string;
  marca: string;
  marcaSlug: string;
  pais: string;
  carroceria: string;
  motor: string; // combustible más vendido
  motores: string[]; // los que pasan del 5 %
  precio: number;
  ventas: VentasModelo;
  ficha: Ficha;
};

async function coche(slug: string): Promise<Coche | null> {
  const clave = claveDeFicha(slug);
  const v = clave ? ventasDe(clave) : undefined;
  if (!clave || !v) return null;
  const f = await leerFicha(slug);
  if (!f || "alias" in f) return null;
  const marcaSlug = clave.split("/")[0];
  const comb = reparto(v);
  return {
    slug,
    nombre: `${f.marca} ${f.modelo}`,
    marca: f.marca,
    marcaSlug,
    pais: PAISES[marcaSlug] ?? "",
    carroceria: carroceria(f),
    motor: comb[0]?.c ?? "",
    motores: comb.map((x) => x.c),
    precio: precioDesde(f),
    ventas: v,
    ficha: f,
  };
}

// ---------- Coches que se pueden escribir ----------

// Fichas de modelos que se venden nuevos en España (una por familia de la DGT)
export async function opciones() {
  const modelos = await listarModelos();
  const nuevos = new Set(POR_PUESTO);
  const porClave = new Map<string, (typeof modelos)[number]>();
  for (const m of modelos) {
    const c = claveDeFicha(m.slug);
    if (!c || !nuevos.has(c)) continue;
    const previo = porClave.get(c);
    if (!previo || m.slug.length < previo.slug.length) porClave.set(c, m);
  }
  return [...porClave.values()]
    .map(({ slug, marca, modelo }) => ({ slug, marca, modelo }))
    .sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`, "es"));
}

// ---------- Coche del día ----------

// Se elige al primer intento del día y se guarda, para que no cambie aunque
// cambien las fichas o el ranking de la DGT a mitad de día
export async function cocheDelDia(fecha = hoy()): Promise<Coche | null> {
  const guardado = redis ? await redis.get<string>(CLAVE_DIA(fecha)) : null;
  if (guardado) {
    const c = await coche(guardado);
    if (c) return c;
  }

  const ops = await opciones();
  const top = new Set(POR_PUESTO.slice(0, CANDIDATOS));
  const usados = redis ? await redis.lrange<string>(CLAVE_USADOS, 0, SIN_REPETIR - 1) : [];
  let pool = ops.filter((o) => top.has(claveDeFicha(o.slug)!) && !usados.includes(o.slug));
  if (!pool.length) pool = ops.filter((o) => top.has(claveDeFicha(o.slug)!));
  if (!pool.length) return null;

  // Sin Redis (en local) el coche sale de la fecha, para que sea estable
  let semilla = 0;
  for (const ch of fecha) semilla = (semilla * 31 + ch.charCodeAt(0)) >>> 0;
  const orden = [...pool.slice(semilla % pool.length), ...pool.slice(0, semilla % pool.length)];

  for (const o of orden) {
    const c = await coche(o.slug);
    if (!c || !c.precio || c.carroceria === "Otro") continue;
    if (redis) {
      // Si otra petición lo eligió a la vez, gana la primera
      const ok = await redis.set(CLAVE_DIA(fecha), c.slug, { nx: true, ex: 60 * 60 * 24 * 3 });
      if (!ok) return cocheDelDia(fecha);
      await redis.lpush(CLAVE_USADOS, c.slug);
      await redis.ltrim(CLAVE_USADOS, 0, 99);
    }
    return c;
  }
  return null;
}

// ---------- Pistas ----------

const fmt = (n: number) => new Intl.NumberFormat("es-ES", { useGrouping: "always" }).format(n);

// Quita del texto la marca y el modelo para no regalar la respuesta
function sinNombre(texto: string, c: Coche) {
  const palabras = [c.ficha.marca, c.ficha.modelo, ...c.ficha.modelo.split(/\s+/)]
    .filter((p) => p.length >= 2)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return palabras.reduce((t, p) => t.replace(new RegExp(`\\b${p}\\b`, "gi"), "…"), texto);
}

// "Es un SUV (segmento C)": el segmento solo si añade algo a la carrocería
function primeraPista(c: Coche) {
  const tipo = c.carroceria === "SUV" ? "SUV" : c.carroceria.toLowerCase();
  const seg = sinNombre(c.ficha.segmento, c).trim();
  const extra = seg && !seg.toLowerCase().includes(tipo.toLowerCase()) ? ` (${seg})` : "";
  const segB = seg.match(/segmento\s+([a-e])/i);
  const corto = segB ? ` del segmento ${segB[1].toUpperCase()}` : extra;
  return `Es un ${tipo}${corto}.`;
}

export function pistas(c: Coche) {
  const motores = reparto(c.ventas)
    .map((x) => `${COMBUSTIBLES[x.c] ?? x.c} ${x.pct} %`)
    .join(", ");
  const fuerte = c.ficha.puntosFuertes.find((p) => p.length > 15) ?? c.ficha.puntosFuertes[0];
  return [
    primeraPista(c),
    `Lo que se vende en España: ${motores}.`,
    `Nuevo cuesta desde unos ${fmt(Math.round(c.precio / 500) * 500)} €.`,
    `Es el nº ${c.ventas.puesto} en ventas de España: ${fmt(c.ventas.total)} matriculados en 12 meses.`,
    fuerte ? `Un punto fuerte: ${sinNombre(fuerte, c)}` : `Su marca es de ${c.pais || "fuera de Europa"}.`,
    `La marca es ${c.marca}.`,
  ];
}

// ---------- Comparación de un intento con el coche del día ----------

export type Estado = "ok" | "cerca" | "no";
export type Celda = { id: string; titulo: string; valor: string; estado: Estado; flecha?: "arriba" | "abajo" };
export type Fila = { slug: string; nombre: string; celdas: Celda[] };

export function comparar(g: Coche, s: Coche): Fila {
  const num = (titulo: string, id: string, a: number, b: number, valor: string, margen: number): Celda => {
    if (!a || !b) return { id, titulo, valor: valor || "—", estado: "no" };
    if (Math.abs(a - b) <= b * margen) return { id, titulo, valor, estado: "ok" };
    return { id, titulo, valor, estado: "no", flecha: b > a ? "arriba" : "abajo" };
  };
  const nombreMotor = (m: string) => COMBUSTIBLES[m] ?? m;
  return {
    slug: g.slug,
    nombre: g.nombre,
    celdas: [
      { id: "marca", titulo: "Marca", valor: g.marca, estado: g.marcaSlug === s.marcaSlug ? "ok" : "no" },
      { id: "pais", titulo: "País", valor: g.pais || "—", estado: g.pais && g.pais === s.pais ? "ok" : "no" },
      { id: "carroceria", titulo: "Carrocería", valor: g.carroceria, estado: g.carroceria === s.carroceria ? "ok" : "no" },
      {
        id: "motor",
        titulo: "Motor más vendido",
        valor: nombreMotor(g.motor),
        estado: g.motor === s.motor ? "ok" : g.motores.some((m) => s.motores.includes(m)) ? "cerca" : "no",
      },
      num("Precio", "precio", g.precio, s.precio, g.precio ? `${fmt(Math.round(g.precio / 1000))} mil €` : "", 0.08),
      num("Ventas al año", "ventas", g.ventas.total, s.ventas.total, g.ventas.total >= 1000 ? `${fmt(Math.round(g.ventas.total / 1000))} mil` : fmt(g.ventas.total), 0.1),
    ],
  };
}

// ---------- Una partida: los intentos que lleva el jugador ----------

export async function jugar(intentos: string[], fecha = hoy()) {
  const secreto = await cocheDelDia(fecha);
  if (!secreto) return null;
  const filas: Fila[] = [];
  let acertado = false;
  for (const slug of intentos.slice(0, MAX_INTENTOS)) {
    if (acertado) break;
    const g = await coche(slug);
    if (!g) continue;
    filas.push(comparar(g, secreto));
    if (claveDeFicha(g.slug) === claveDeFicha(secreto.slug)) acertado = true;
  }
  const fin = acertado || filas.length >= MAX_INTENTOS;
  const todas = pistas(secreto);
  return {
    fecha,
    numero: numeroDe(fecha),
    filas,
    acertado,
    fin,
    pistas: fin ? todas : todas.slice(0, Math.min(filas.length + 1, MAX_INTENTOS)),
    solucion: fin ? { slug: secreto.slug, nombre: secreto.nombre } : null,
  };
}

export type Partida = NonNullable<Awaited<ReturnType<typeof jugar>>>;
