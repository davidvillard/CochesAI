import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { contar } from "../../lib/contadores";

// Margen para los reintentos con espera (en Vercel evita cortes a los 10 s)
export const maxDuration = 60;

// ---------- Protección ----------

// La imagen llega en base64. Con 768 px y JPEG pesa ~100 KB, así que 600.000
// caracteres (~450 KB) dan margen de sobra y bloquean subidas enormes.
const MAX_IMAGE_CHARS = 600_000;
const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

// Se pueden cambiar con variables de entorno sin tocar el código
const LIMITE_POR_IP = Number(process.env.LIMITE_POR_IP ?? 10); // por hora
const LIMITE_GLOBAL = Number(process.env.LIMITE_DIARIO_GLOBAL ?? 200); // por día

// Si faltan las variables de Upstash (por ejemplo en local) no se limita nada
// Acepta las variables de Upstash o las que crea la integración de Vercel
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn("Sin Upstash configurado: la API NO tiene límite de uso.");
}

const limitePorIp = redis
  ? new Ratelimit({
      redis,
      prefix: "quecoche:ip",
      limiter: Ratelimit.slidingWindow(LIMITE_POR_IP, "1 h"),
    })
  : null;

const limiteGlobal = redis
  ? new Ratelimit({
      redis,
      prefix: "quecoche:global",
      limiter: Ratelimit.slidingWindow(LIMITE_GLOBAL, "1 d"),
    })
  : null;

function getIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anon";
}

// Si Redis falla, dejamos pasar la petición en vez de tumbar la web
async function comprobar(limite: Ratelimit | null, clave: string) {
  if (!limite) return { success: true, reset: 0 };
  try {
    const { success, reset } = await limite.limit(clave);
    return { success, reset };
  } catch (err) {
    console.error("Error en el límite de uso:", err);
    return { success: true, reset: 0 };
  }
}

// ---------- Gemini ----------

// Modelos a probar en orden. Se pueden cambiar con la variable GEMINI_MODELS
// (nombres separados por comas). Si uno se queda sin cuota, pasa al siguiente.
// Flash-Lite va primero porque en el plan gratuito admite muchas más peticiones
// al día que los Flash normales (500 frente a 20).
const MODELS = (
  process.env.GEMINI_MODELS ??
  "gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter((m, i, arr) => m && arr.indexOf(m) === i); // quita vacíos y duplicados

const MAX_ATTEMPTS_PER_MODEL = 2;

const PROMPT = `Eres un experto en automoción. Identifica el coche de la foto.
Responde SOLO con un JSON válido (sin markdown) con esta estructura exacta:
{
  "esCoche": boolean,
  "marca": string,
  "modelo": string,
  "generacion": string,
  "anios": string,
  "carroceria": string,
  "combustibles": string[],
  "potenciaCvRango": string,
  "cambio": string,
  "puertas": number,
  "plazas": number,
  "precioNuevoEurAprox": string,
  "precioSegundaManoEur": { "min": number, "max": number },
  "similares": [ { "marca": string, "modelo": string, "motivo": string } ],
  "confianza": number,
  "notas": string
}
Reglas:
- Sé breve: cada texto lo más corto posible.
- "confianza" va de 0 a 1.
- Precios: estimación para España, en euros.
- "notas": máximo una frase, solo si hay dudas sobre la versión exacta; si no, "".
- "motivo" de cada similar: máximo 8 palabras.
- Si no hay coche, "esCoche": false y el resto vacío.
- Exactamente 2 similares.
- Todo en español.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(
  model: string,
  apiKey: string,
  image: string,
  mimeType: string
) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: image } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          // Los modelos Lite no necesitan (ni siempre admiten) este ajuste
          ...(model.includes("lite")
            ? {}
            : { thinkingConfig: { thinkingLevel: "low" } }),
        },
      }),
    }
  );
}

// ---------- Validación de la respuesta de la IA ----------

// Cada campo se normaliza: si Gemini devuelve un tipo raro, se usa un valor
// por defecto en vez de romper la web.
const texto = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .catch("");
const numero = z.coerce.number().catch(0);

const RespuestaSchema = z.object({
  esCoche: z.boolean().catch(false),
  marca: texto,
  modelo: texto,
  generacion: texto,
  anios: texto,
  carroceria: texto,
  combustibles: z.array(texto).catch([]),
  potenciaCvRango: texto,
  cambio: texto,
  puertas: numero,
  plazas: numero,
  precioNuevoEurAprox: texto,
  precioSegundaManoEur: z
    .object({ min: numero, max: numero })
    .catch({ min: 0, max: 0 }),
  similares: z
    .array(z.object({ marca: texto, modelo: texto, motivo: texto }))
    .catch([]),
  confianza: numero,
  notas: texto,
});

// Devuelve el resultado limpio, o null si la respuesta no sirve
function interpretar(text: string) {
  const limpio = text.replace(/```json|```/g, "").trim();
  const ini = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (ini === -1 || fin <= ini) return null;

  let bruto: unknown;
  try {
    bruto = JSON.parse(limpio.slice(ini, fin + 1));
  } catch {
    return null;
  }

  const parsed = RespuestaSchema.safeParse(bruto);
  if (!parsed.success) return null;
  const d = parsed.data;

  // Sin coche: basta con avisar, el resto de campos no importa
  if (!d.esCoche) return { esCoche: false };

  // Dice que es un coche pero no sabe cuál: respuesta inútil
  if (!d.marca || !d.modelo) return null;

  // La confianza debe ir de 0 a 1 (a veces llega como porcentaje)
  let confianza = d.confianza > 1 ? d.confianza / 100 : d.confianza;
  confianza = Math.min(1, Math.max(0, confianza));

  // Precio: ordena min y max, y lo omite si no hay datos útiles
  let { min, max } = d.precioSegundaManoEur;
  if (min > max) [min, max] = [max, min];
  const precio = max > 0 ? { min: Math.max(0, min), max } : undefined;

  return {
    ...d,
    confianza,
    precioSegundaManoEur: precio,
    similares: d.similares.filter((s) => s.marca && s.modelo).slice(0, 3),
  };
}

const MAX_RESPUESTAS_INVALIDAS = 2;

const minutosHasta = (reset: number) =>
  Math.max(1, Math.ceil((reset - Date.now()) / 60000));

export async function POST(req: Request) {
  try {
    // 1) Descarta cuerpos enormes sin llegar a leerlos
    const tamano = Number(req.headers.get("content-length") ?? 0);
    if (tamano > MAX_IMAGE_CHARS + 2000) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande." },
        { status: 413 }
      );
    }

    // 2) Límite por IP
    const ip = getIp(req);
    const porIp = await comprobar(limitePorIp, ip);
    if (!porIp.success) {
      await contar("rechazados_ip");
      return NextResponse.json(
        {
          error: `Has hecho muchos análisis seguidos. Vuelve a intentarlo en ${minutosHasta(
            porIp.reset
          )} min.`,
        },
        { status: 429 }
      );
    }

    // 3) Valida el contenido
    const { image, mimeType } = await req.json();

    if (typeof image !== "string" || !image) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
    }
    if (image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande." },
        { status: 413 }
      );
    }
    const mime = MIME_PERMITIDOS.includes(mimeType) ? mimeType : "image/jpeg";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en .env.local" },
        { status: 500 }
      );
    }

    // 4) Tope diario global: protege la cuota gratuita de Gemini
    const global = await comprobar(limiteGlobal, "global");
    if (!global.success) {
      await contar("rechazados_global");
      return NextResponse.json(
        { error: "Hoy hemos llegado al límite gratuito de análisis. Vuelve mañana." },
        { status: 429 }
      );
    }

    // 5) Llamada a Gemini con reintentos y modelos de respaldo
    let lastStatus = 0;
    let invalidas = 0;

    for (const model of MODELS) {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
        const res = await callGemini(model, apiKey, image, mime);
        lastStatus = res.status;

        if (res.ok) {
          const data = await res.json();

          // Gemini rechaza la imagen por sus filtros de seguridad
          if (data?.promptFeedback?.blockReason) {
            await contar("errores");
            return NextResponse.json(
              { error: "Esta imagen no se ha podido analizar. Prueba con otra foto." },
              { status: 422 }
            );
          }

          const text: string =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text ?? "")
              .join("") ?? "";

          const resultado = interpretar(text);
          if (resultado) {
            await contar(
              "analisis",
              `modelo:${model}`,
              ...(resultado.esCoche ? [] : ["nocoche"])
            );
            return NextResponse.json(
              process.env.NODE_ENV === "production"
                ? resultado
                : { ...resultado, _modelo: model }
            );
          }

          // Respuesta vacía, cortada o con JSON inválido: reintenta
          console.error(
            `[${model}] respuesta no válida (intento ${attempt}):`,
            text.slice(0, 500)
          );
          invalidas++;
          if (invalidas >= MAX_RESPUESTAS_INVALIDAS) {
            await contar("errores");
            return NextResponse.json(
              {
                error:
                  "No he podido interpretar la respuesta de la IA. Inténtalo de nuevo, con esta foto u otra.",
              },
              { status: 502 }
            );
          }
          continue;
        }

        const detail = await res.text();
        console.error(`[${model}] intento ${attempt} -> ${res.status}`, detail);

        // 401 / 403: la clave no vale, no tiene sentido probar otros modelos
        if (res.status === 401 || res.status === 403) {
          return NextResponse.json(
            { error: "API key inválida o sin permisos. Revisa GEMINI_API_KEY." },
            { status: res.status }
          );
        }

        // 400 (un ajuste que ese modelo no admite), 404 (el modelo no existe) o
        // 429 (sin cuota: reintentar no lo arregla y gasta más peticiones):
        // pasa directamente al siguiente modelo
        if (res.status === 400 || res.status === 404 || res.status === 429) break;

        // 500 / 503: saturado -> espera un poco y reintenta con el mismo modelo
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(1500 * attempt);
        }
      }
    }

    await contar("errores");

    const msg =
      lastStatus === 429
        ? "Límite gratuito alcanzado. Prueba en un minuto o mañana."
        : lastStatus === 400
        ? "No se ha podido procesar esta imagen. Prueba con otra foto."
        : "Los servidores de Gemini están saturados. Inténtalo de nuevo en unos segundos.";

    return NextResponse.json({ error: msg }, { status: 503 });
  } catch (err) {
    console.error(err);
    await contar("errores");
    return NextResponse.json(
      { error: "No se pudo analizar la imagen" },
      { status: 500 }
    );
  }
}