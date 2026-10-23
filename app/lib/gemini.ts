import { z } from "zod";

// Modelos a probar en orden. Se pueden cambiar con la variable GEMINI_MODELS
// (nombres separados por comas). Si uno se queda sin cuota, pasa al siguiente.
// Flash-Lite va primero porque en el plan gratuito admite muchas más peticiones
// al día que los Flash normales (500 frente a 20).
export const MODELS = (
  process.env.GEMINI_MODELS ??
  "gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter((m, i, arr) => m && arr.indexOf(m) === i); // quita vacíos y duplicados

type Parte =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

// Una llamada a Gemini pidiendo respuesta en JSON. Devuelve el Response tal cual
// para que cada uso decida cómo reintentar según el código de estado.
export function llamarGemini(model: string, apiKey: string, parts: Parte[]) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
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

// El texto de la respuesta, juntando todas sus partes
export function textoDe(data: unknown): string {
  const d = data as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return d?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

// Extrae el objeto JSON de un texto, aunque venga envuelto en ```json
export function extraerJson(text: string): unknown {
  const limpio = text.replace(/```json|```/g, "").trim();
  const ini = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (ini === -1 || fin <= ini) return null;
  try {
    return JSON.parse(limpio.slice(ini, fin + 1));
  } catch {
    return null;
  }
}

// Normalizadores para validar respuestas: si Gemini devuelve un tipo raro,
// se usa un valor por defecto en vez de romper la web.
export const texto = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .catch("");
export const numero = z.coerce.number().catch(0);
