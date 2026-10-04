import { NextResponse } from "next/server";

// Modelos a probar en orden. El primero sale de .env.local; el resto son respaldo.
const MODELS = [
    process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
].filter((m, i, arr) => arr.indexOf(m) === i); // quita duplicados

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
                    thinkingConfig: { thinkingLevel: "low" },
                },
            }),
        }
    );
}

export async function POST(req: Request) {
    try {
        const { image, mimeType } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Falta GEMINI_API_KEY en .env.local" },
                { status: 500 }
            );
        }

        let lastStatus = 0;

        for (const model of MODELS) {
            for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
                const res = await callGemini(
                    model,
                    apiKey,
                    image,
                    mimeType || "image/jpeg"
                );
                lastStatus = res.status;

                if (res.ok) {
                    const data = await res.json();
                    const text: string =
                        data?.candidates?.[0]?.content?.parts
                            ?.map((p: { text?: string }) => p.text ?? "")
                            .join("") ?? "";

                    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
                    return NextResponse.json({ ...parsed, _modelo: model });
                }

                const detail = await res.text();
                console.error(`[${model}] intento ${attempt} -> ${res.status}`, detail);

                // 400 / 401 / 403: problema de petición o clave, no tiene sentido reintentar
                if (res.status === 400 || res.status === 401 || res.status === 403) {
                    return NextResponse.json(
                        {
                            error:
                                res.status === 400
                                    ? "Petición inválida (imagen o parámetros)."
                                    : "API key inválida o sin permisos. Revisa GEMINI_API_KEY.",
                        },
                        { status: res.status }
                    );
                }

                // 404: el modelo no existe para tu cuenta -> pasa al siguiente modelo
                if (res.status === 404) break;

                // 429 / 500 / 503: saturado o límite -> espera y reintenta
                if (attempt < MAX_ATTEMPTS_PER_MODEL) {
                    await sleep(1500 * attempt);
                }
            }
        }

        const msg =
            lastStatus === 429
                ? "Límite gratuito alcanzado. Prueba en un minuto o mañana."
                : "Los servidores de Gemini están saturados. Inténtalo de nuevo en unos segundos.";

        return NextResponse.json({ error: msg }, { status: 503 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "No se pudo analizar la imagen" },
            { status: 500 }
        );
    }
}