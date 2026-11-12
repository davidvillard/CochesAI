import { HERRAMIENTAS } from "../lib/herramientas";
import { listarModelos, urlFicha } from "../lib/fichas";
import { NOMBRE_WEB } from "../lib/marca";
import { SITE_URL } from "../lib/seo";
import { FUENTE_DGT, HASTA, PERIODO, RANKING, fichasPorClave, modelo } from "../lib/ventas";

// /llms.txt: resumen de la web para asistentes de IA (formato de llmstxt.org).
// Se genera con los datos de la web, así siempre está al día.
// Lee las fichas de Redis: por eso se genera en cada petición.
export const dynamic = "force-dynamic";

export async function GET() {
  const modelos = await listarModelos();
  const fichas = fichasPorClave(modelos.map((m) => m.slug));
  const enlace = (texto: string, ruta: string, detalle?: string) =>
    `- [${texto}](${SITE_URL}${ruta})${detalle ? `: ${detalle}` : ""}`;

  const masVendidos = RANKING.slice(0, 30)
    .filter((k) => fichas.has(k))
    .map((k, i) => enlace(`${i + 1}. ${modelo(k).nombre}`, urlFicha(fichas.get(k)!)));

  const texto = [
    `# ${NOMBRE_WEB}`,
    "",
    `> ${NOMBRE_WEB} (${SITE_URL.replace(/^https?:\/\//, "")}) es una web española gratuita para identificar un coche por foto desde el navegador, sin instalar apps, y para informarse antes de comprar un coche: fichas con fallos comunes y precios de segunda mano, ventas de coches con datos abiertos de la DGT, año y etiqueta por matrícula, ITP, ITV y transferencia.`,
    "",
    "Datos clave:",
    `- Ventas de coches: elaboración propia a partir de los microdatos de matriculaciones de la Dirección General de Tráfico (DGT), ${PERIODO}, actualizados cada mes. La DGT no participa en este análisis ni lo respalda. Origen de los datos: ${FUENTE_DGT}`,
    "- Fecha de matriculación por letras de la matrícula: datos abiertos de la DGT (desde 2015) y tablas públicas (2000-2014).",
    "- ITP: tipos de cada comunidad autónoma y tablas de Hacienda (Orden HAC/1501/2025).",
    "- Fichas de modelos: elaboradas con IA a partir de información pública; pueden contener errores y se indica en cada ficha.",
    `- Cómo se elaboran los datos: ${SITE_URL}/metodologia`,
    "",
    "## Herramientas",
    enlace("Identificar un coche por foto", "/", "marca, modelo, generación, ficha y precio de segunda mano a partir de una foto"),
    ...HERRAMIENTAS.map((h) => enlace(h.texto, h.href, h.detalle)),
    "",
    "## Ventas de coches en España (DGT)",
    enlace("Coches más vendidos en España", "/mas-vendidos", `ranking de turismos nuevos, último mes (${HASTA}), usados importados, combustibles y marcas`),
    enlace("Coches más vendidos por provincia", "/mas-vendidos", "ranking de las 52 provincias, enlazado desde la página principal del ranking"),
    "",
    "## Fichas de los coches más vendidos",
    ...masVendidos,
    enlace("Todas las fichas de coches", "/coches", `${modelos.length} modelos con fallos comunes, motores, generaciones y precio`),
    "",
    "## Opcional",
    enlace("Metodología y fuentes", "/metodologia"),
    enlace("Aviso legal", "/aviso-legal"),
    enlace("Privacidad", "/privacidad"),
    "",
  ].join("\n");

  return new Response(texto, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
