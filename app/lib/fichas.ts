import { z } from "zod";
import { redis } from "./redis";
import { MODELS, extraerJson, llamarGemini, numero, texto, textoDe } from "./gemini";

// Fichas de modelo (/coches/<marca>/<modelo>). Se crean con Gemini la primera vez
// que alguien identifica ese coche con buena seguridad y se guardan para siempre.
// Solo existen páginas de modelos que la web ya ha identificado: así nadie puede
// gastar cuota de Gemini pidiendo URLs inventadas.

const CLAVE_MODELOS = "quecoche:modelos"; // ranking: slug -> nº de identificaciones
const CLAVE_NOMBRES = "quecoche:modelos:nombres"; // slug -> { marca, modelo, actualizada }
const claveFicha = (slug: string) => `quecoche:ficha:${slug}`;
// Evita generar dos veces a la vez y, si falla, no reintenta hasta el día siguiente
const claveIntento = (slug: string) => `quecoche:ficha-intento:${slug}`;

// Por debajo de esta seguridad la marca o el modelo pueden estar mal
export const CONFIANZA_MINIMA = 0.7;

// "Mercedes-Benz", "Clase C" -> "mercedes-benz/clase-c"
const trozo = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function slugModelo(marca: string, modelo: string) {
  const m = trozo(marca);
  const n = trozo(modelo);
  return m && n ? `${m}/${n}` : null;
}

export const urlFicha = (slug: string) => `/coches/${slug}`;
// Página de la marca a partir del slug del modelo ("seat/leon" -> "/coches/seat")
export const urlMarca = (slug: string) => `/coches/${slug.split("/")[0]}`;

// ---------- Contenido de la ficha ----------

const lista = z.array(texto).catch([]).transform((l) => l.filter(Boolean));

const FichaSchema = z.object({
  existe: z.boolean().catch(false),
  marca: texto,
  modelo: texto,
  resumen: texto,
  carroceria: texto,
  segmento: texto,
  generaciones: z
    .array(z.object({ nombre: texto, anios: texto, cambios: texto }))
    .catch([]),
  motores: z
    .array(z.object({ nombre: texto, combustible: texto, potenciaCv: texto }))
    .catch([]),
  precioNuevoEur: texto,
  precioSegundaManoEur: z
    .object({ min: numero, max: numero })
    .catch({ min: 0, max: 0 }),
  etiquetaDgt: texto,
  puntosFuertes: lista,
  puntosDebiles: lista,
  // Formato nuevo: fallos con detalle y a qué versiones afectan
  fallos: z
    .array(z.object({ titulo: texto, afecta: texto, detalle: texto }))
    .catch([])
    .transform((l) => l.filter((f) => f.titulo)),
  // Formato antiguo (solo títulos): lo tienen las fichas creadas antes
  fallosConocidos: lista,
  similares: z
    .array(z.object({ marca: texto, modelo: texto, motivo: texto }))
    .catch([]),
  preguntas: z.array(z.object({ p: texto, r: texto })).catch([]),
});

type Datos = Omit<z.infer<typeof FichaSchema>, "existe">;
export type Fallo = Datos["fallos"][number];

// Las fichas antiguas pueden no tener "fallos": por eso es opcional al leerlas
export type Ficha = Omit<Datos, "fallos"> & {
  fallos?: Fallo[];
  slug: string;
  actualizada: string; // fecha ISO
};

const prompt = (marca: string, modelo: string) => `Eres un periodista experto en automoción en España.
Escribe la ficha del coche "${marca} ${modelo}" para alguien que piensa comprarlo de segunda mano.
Responde SOLO con un JSON válido (sin markdown) con esta estructura exacta:
{
  "existe": boolean,
  "marca": string,
  "modelo": string,
  "resumen": string,
  "carroceria": string,
  "segmento": string,
  "generaciones": [ { "nombre": string, "anios": string, "cambios": string } ],
  "motores": [ { "nombre": string, "combustible": string, "potenciaCv": string } ],
  "precioNuevoEur": string,
  "precioSegundaManoEur": { "min": number, "max": number },
  "etiquetaDgt": string,
  "puntosFuertes": string[],
  "puntosDebiles": string[],
  "fallos": [ { "titulo": string, "afecta": string, "detalle": string } ],
  "similares": [ { "marca": string, "modelo": string, "motivo": string } ],
  "preguntas": [ { "p": string, "r": string } ]
}
Reglas:
- "existe": false si ese modelo no existe o no lo reconoces; entonces el resto vacío.
- "marca" y "modelo": nombre comercial correcto (por ejemplo "SEAT" y "León").
- "modelo" es el modelo base, sin versión, motor ni acabado: "Golf" y no "Golf GTI",
  "Serie 3" y no "320d". Excepción: si es un modelo distinto con su propio nombre
  (por ejemplo "Cupra Formentor" o "Mercedes-AMG GT"), usa ese nombre.
- La ficha describe el modelo base con todas sus versiones.
- "resumen": 3 o 4 frases, informativo y sin frases publicitarias.
- "generaciones": las vendidas en España, de la más reciente a la más antigua; "cambios": una frase.
- "motores": los más habituales en España, máximo 8; "potenciaCv": por ejemplo "110 CV".
- Precios en euros para España; segunda mano: rango habitual de anuncios actuales.
- "etiquetaDgt": qué etiquetas ambientales tienen sus versiones, en una frase.
- Puntos fuertes y débiles: 3 a 5 cada uno, frases cortas.
- "fallos": los fallos comunes y averías conocidas de este modelo, de 4 a 8, los más
  frecuentes primero. Solo problemas reales y documentados (foros, revisiones, llamadas a
  revisión); no inventes. "titulo": el fallo en pocas palabras (por ejemplo "Válvula EGR
  obstruida"). "afecta": motor, generación y años concretos (por ejemplo "1.6 TDI 105 CV,
  León III, 2012-2016"). "detalle": 1 o 2 frases con el síntoma, la causa y cómo
  detectarlo o qué revisar antes de comprar.
- Exactamente 3 similares; "motivo": máximo 8 palabras.
- 4 preguntas frecuentes que haría un comprador, con respuestas de 1 o 2 frases. Al menos
  dos sobre fiabilidad: qué motor da menos problemas y qué revisar antes de comprarlo.
- No inventes datos: si dudas de una cifra, da un rango.
- Todo en español.`;

async function generar(marca: string, modelo: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (const model of MODELS) {
    const res = await llamarGemini(model, apiKey, [{ text: prompt(marca, modelo) }]);
    if (!res.ok) {
      console.error(`[ficha ${model}] ${res.status}`, await res.text());
      // Sin cuota, modelo inexistente o saturado: prueba el siguiente
      if (res.status === 401 || res.status === 403) return null;
      continue;
    }
    const parsed = FichaSchema.safeParse(extraerJson(textoDe(await res.json())));
    if (!parsed.success) continue;

    const { existe, ...ficha } = parsed.data;
    if (!existe || !ficha.marca || !ficha.modelo || !ficha.resumen) return null;
    return ficha;
  }
  return null;
}

// ---------- Registro ----------

// Se llama tras cada identificación (con after(), sin hacer esperar al usuario).
// Si el modelo ya tiene ficha, suma una visita; si no, intenta crearla.
export async function registrarModelo(marca: string, modelo: string) {
  const slug = slugModelo(marca, modelo);
  if (!redis || !slug) return;
  try {
    const existente = await leerFicha(slug);
    if (existente) {
      const real = "alias" in existente ? existente.alias : slug;
      await redis.zincrby(CLAVE_MODELOS, 1, real);
      return;
    }
    // Solo un intento al día por modelo
    const libre = await redis.set(claveIntento(slug), 1, { nx: true, ex: 60 * 60 * 24 });
    if (!libre) return;

    const datos = await generar(marca, modelo);
    if (!datos) return;

    // El nombre corregido por la IA puede dar otro slug ("VW Golf GTI" ->
    // "volkswagen/golf"): la ficha se guarda con el bueno y el original queda
    // como alias, para que no haya dos fichas del mismo coche
    const slugFinal = slugModelo(datos.marca, datos.modelo) ?? slug;
    if (slugFinal !== slug) await redis.set(claveFicha(slug), { alias: slugFinal });
    // Si el modelo base ya tenía ficha, no se sobrescribe: solo se cuenta
    if (!(await redis.exists(claveFicha(slugFinal)))) {
      const actualizada = new Date().toISOString();
      const ficha: Ficha = { ...datos, slug: slugFinal, actualizada };
      await redis.set(claveFicha(slugFinal), ficha);
      await redis.hset(CLAVE_NOMBRES, {
        [slugFinal]: { marca: ficha.marca, modelo: ficha.modelo, actualizada },
      });
    }
    await redis.zincrby(CLAVE_MODELOS, 1, slugFinal);
  } catch (err) {
    console.error("Error al registrar el modelo:", err);
  }
}

// ---------- Lectura ----------

type Guardado = Ficha | { alias: string };

// Devuelve la ficha, o { alias } si ese nombre redirige a otra ficha
export async function leerFicha(slug: string) {
  if (!redis || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await redis.get<Guardado>(claveFicha(slug));
  } catch (err) {
    console.error("Error al leer la ficha:", err);
    return null;
  }
}

// URL de la ficha de ese coche, si existe (siguiendo el alias)
export async function buscarFicha(marca: string, modelo: string) {
  const slug = slugModelo(marca, modelo);
  if (!slug) return undefined;
  const f = await leerFicha(slug);
  if (!f) return undefined;
  return urlFicha("alias" in f ? f.alias : slug);
}

export type ModeloListado = {
  slug: string;
  marca: string;
  modelo: string;
  veces: number;
  actualizada?: string;
};

// Todos los modelos con ficha, del más identificado al menos
export async function listarModelos(): Promise<ModeloListado[]> {
  if (!redis) return [];
  try {
    const ranking = await redis.zrange<(string | number)[]>(CLAVE_MODELOS, 0, -1, {
      rev: true,
      withScores: true,
    });
    if (!ranking.length) return [];
    const nombres =
      (await redis.hgetall<
        Record<string, { marca: string; modelo: string; actualizada?: string }>
      >(
        CLAVE_NOMBRES
      )) ?? {};
    const lista: ModeloListado[] = [];
    for (let i = 0; i < ranking.length; i += 2) {
      const slug = String(ranking[i]);
      const n = nombres[slug];
      if (n) lista.push({ slug, ...n, veces: Number(ranking[i + 1]) });
    }
    return lista;
  } catch (err) {
    console.error("Error al listar modelos:", err);
    return [];
  }
}

// De una lista de coches, la URL de los que ya tienen ficha
export async function urlsDeFichas(coches: { marca: string; modelo: string }[]) {
  const slugs = coches.map((c) => slugModelo(c.marca, c.modelo));
  const validos = slugs.filter((s): s is string => !!s);
  if (!redis || !validos.length) return slugs.map(() => undefined);
  try {
    const nombres = await redis.hmget(CLAVE_NOMBRES, ...validos);
    return slugs.map((s) => (s && nombres?.[s] ? urlFicha(s) : undefined));
  } catch (err) {
    console.error("Error al buscar fichas:", err);
    return slugs.map(() => undefined);
  }
}

// Agrupa los modelos por marca: [{ slug: "seat", marca: "SEAT", modelos }]
export function agruparPorMarca(modelos: ModeloListado[]) {
  const grupos = new Map<string, { slug: string; marca: string; modelos: ModeloListado[] }>();
  const ordenados = [...modelos].sort((a, b) =>
    `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`, "es")
  );
  for (const m of ordenados) {
    const slug = m.slug.split("/")[0];
    const g = grupos.get(slug) ?? { slug, marca: m.marca, modelos: [] };
    g.modelos.push(m);
    grupos.set(slug, g);
  }
  return [...grupos.values()];
}

// Para el resultado recién identificado: la ficha se crea con after() unos
// segundos después de responder, así que el navegador pregunta hasta que aparece.
// "pendiente" es true mientras se está generando (hay intento pero aún no ficha).
export async function estadoFicha(marca: string, modelo: string) {
  const ficha = await buscarFicha(marca, modelo);
  if (ficha) return { ficha, pendiente: false };
  const slug = slugModelo(marca, modelo);
  if (!redis || !slug) return { pendiente: false };
  try {
    return { pendiente: Boolean(await redis.exists(claveIntento(slug))) };
  } catch {
    return { pendiente: false };
  }
}

// Fallos de una ficha en el formato nuevo, aunque sea antigua (solo títulos)
export function listaFallos(f: Ficha): Fallo[] {
  return f.fallos?.length
    ? f.fallos
    : f.fallosConocidos.map((titulo) => ({ titulo, afecta: "", detalle: "" }));
}
