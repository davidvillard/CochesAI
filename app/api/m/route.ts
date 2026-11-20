import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { contar } from "../../lib/contadores";
import { redis } from "../../lib/redis";

// Analítica propia, sin cookies ni identificadores. El navegador avisa de
// "se ha visto esta página" o "se ha usado esta herramienta" y aquí solo se
// suma 1 a contadores del día (lib/contadores.ts). No se guarda la IP (solo se
// usa un minuto para el límite anti-abuso), ni el navegador, ni nada que
// permita reconocer a una persona.

// Eventos que acepta, para que nadie llene la base de datos de basura
const EVENTOS = new Set([
  "matricula", // primera letra consultada (B, C... o "provincial")
  "etiqueta", // etiqueta resultante en la consulta de matrícula
  "prediccion", // año elegido en "¿qué matrícula le toca?"
  "itp", // comunidad en la calculadora de ITP
  "transferencia", // comunidad en el coste de transferencia
  "precio", // tramo de precio en ITP / transferencia
  "antiguedad", // tramo de años del coche en ITP / ITV
  "itv", // tipo de vehículo en la calculadora de ITV
  "vin", // fabricante del bastidor
  "vin-pais",
  "foto", // cómo se sube la foto: camara, galeria, arrastrar, pegar
  "compartir", // whatsapp o copiar
  "imprimir", // checklist o contrato
  "404", // página que no existe
]);

// Primer tramo de las rutas de la web: el resto no se cuenta como visita
const SECCIONES = new Set([
  "", "matricula", "ultima-matricula", "bastidor", "coches", "comparar",
  "calculadora-itp", "coste-transferencia", "itv", "checklist-compra-coche",
  "contrato-compraventa-coche", "herramientas", "mas-vendidos", "metodologia", "r", "privacidad", "aviso-legal",
  "vender-coche", "glosario", "zonas-bajas-emisiones", "prensa",
]);

// Texto libre -> valor corto y seguro: "Comunidad de Madrid" -> "comunidad-de-madrid"
function limpio(v: unknown, largo = 80) {
  if (typeof v !== "string") return null;
  const s = v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/|.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, largo);
  return s || null;
}

// "/r/abc123" -> "/r/*" (cada resultado compartido es una URL distinta)
function ruta(v: unknown) {
  if (typeof v !== "string" || !v.startsWith("/")) return null;
  const partes = v.split(/[?#]/)[0].toLowerCase().split("/").filter(Boolean);
  if (!SECCIONES.has(partes[0] ?? "")) return null;
  if (partes[0] === "r") return "/r/*";
  const r = "/" + partes.map((p) => limpio(p, 40) ?? "").join("/");
  return r.length <= 90 ? r : null;
}

// De dónde viene la visita, agrupando dominios del mismo buscador o red
function origen(referente: unknown, propio: string) {
  if (typeof referente !== "string" || !referente) return "directo";
  let host: string;
  try {
    host = new URL(referente).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host === propio) return null;
  if (/googlequicksearchbox|^google\./.test(host)) return "google";
  const redes: [RegExp, string][] = [
    [/bing\./, "bing"],
    [/duckduckgo/, "duckduckgo"],
    [/yahoo\./, "yahoo"],
    [/ecosia/, "ecosia"],
    [/chatgpt\.com|openai/, "chatgpt"],
    [/perplexity/, "perplexity"],
    [/gemini\.google|bard\.google/, "gemini"],
    [/facebook|fb\.com/, "facebook"],
    [/instagram/, "instagram"],
    [/^t\.co$|twitter|x\.com/, "x"],
    [/reddit/, "reddit"],
    [/whatsapp/, "whatsapp"],
    [/telegram|t\.me/, "telegram"],
    [/tiktok/, "tiktok"],
    [/youtube/, "youtube"],
    [/forocoches/, "forocoches"],
  ];
  for (const [re, nombre] of redes) if (re.test(host)) return nombre;
  return limpio(host, 60);
}

function dispositivo(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "movil";
  return "ordenador";
}

// Robots que ejecutan JavaScript (Google, Bing, Lighthouse...). No son visitas
// de personas: se cuentan aparte para saber qué rastrean.
function robot(ua: string) {
  if (/googlebot|google-inspectiontool|adsbot-google/i.test(ua)) return "googlebot";
  if (/bingbot/i.test(ua)) return "bingbot";
  if (/lighthouse|pagespeed|gtmetrix/i.test(ua)) return "lighthouse";
  if (/bot|crawl|spider|slurp|headless|preview/i.test(ua)) return "otro";
  return null;
}

const horaES = () =>
  new Date().toLocaleString("es-ES", { hour: "2-digit", hour12: false, timeZone: "Europe/Madrid" });

const limite = redis
  ? new Ratelimit({
      redis,
      prefix: "quecoche:m",
      limiter: Ratelimit.fixedWindow(60, "1 m"),
      ephemeralCache: new Map(),
    })
  : null;

type Cuerpo = { vista?: { ruta?: unknown; ref?: unknown; utm?: unknown; entrada?: unknown }; ev?: unknown };

export async function POST(req: Request) {
  const nada = new NextResponse(null, { status: 204 });
  if (!redis || Number(req.headers.get("content-length") ?? 0) > 2000) return nada;

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
    if (limite && !(await limite.limit(ip)).success) return nada;

    const cuerpo = (await req.json()) as Cuerpo;
    const ua = req.headers.get("user-agent") ?? "";
    const campos: string[] = [];
    const bot = robot(ua);

    const v = cuerpo.vista;
    if (v) {
      const r = ruta(v.ruta);
      if (r && bot) {
        campos.push(`bot:${bot}`);
        if (bot === "googlebot") campos.push(`rastreo:${r}`);
      } else if (r) {
        campos.push(`vista:${r}`, `disp:${dispositivo(ua)}`, `hora:${horaES()}`);
        // Solo la primera página de la visita dice de dónde viene
        if (v.entrada === true) {
          const o = limpio(v.utm, 40) ?? origen(v.ref, new URL(req.url).hostname.replace(/^www\./, ""));
          campos.push(`entrada:${r}`);
          if (o) campos.push(`origen:${o}`);
        }
      }
    }

    // Los robots no usan las herramientas: sus eventos no se cuentan
    if (!bot && Array.isArray(cuerpo.ev)) {
      for (const par of cuerpo.ev.slice(0, 5)) {
        if (!Array.isArray(par) || !EVENTOS.has(par[0])) continue;
        const valor = par[0] === "404" ? limpio(String(par[1]).split(/[?#]/)[0], 80) : limpio(par[1]);
        if (valor) campos.push(`ev:${par[0]}:${valor}`);
      }
    }

    await contar(...campos);
  } catch {
    // Un aviso mal formado no importa: no se cuenta y ya está
  }
  return nada;
}

