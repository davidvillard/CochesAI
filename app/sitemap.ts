import type { MetadataRoute } from "next";
import { agruparPorMarca, listarModelos, urlFicha, type ModeloListado } from "./lib/fichas";
import { SITE_URL } from "./lib/seo";
import { LETRAS_USADAS } from "./lib/matricula";
import { COMUNIDADES } from "./lib/itp";
import { HERRAMIENTAS } from "./lib/herramientas";
import { LISTA_PROVINCIAS, ventasDeFicha } from "./lib/ventas";

// Se genera en cada petición para incluir las fichas nuevas
// (Upstash no deja cachear sus lecturas en el build)
export const dynamic = "force-dynamic";

// Fichas que se ofrecen a Google: las que alguien ha identificado con una foto
// o las de modelos con ventas de verdad. Las que crea la tasación de modelos
// raros siguen accesibles, pero no se empujan para no diluir el sitio.
const MIN_MATRICULAS_SITEMAP = 300;
const enSitemap = (m: ModeloListado) =>
  m.veces > 0 || (ventasDeFicha(m.slug)?.total ?? 0) >= MIN_MATRICULAS_SITEMAP;

// Solo se pone lastModified cuando se conoce de verdad: si siempre es "hoy",
// Google deja de hacerle caso
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelos = await listarModelos();
  const fecha = (iso?: string) => (iso ? new Date(iso) : undefined);
  const ultima = modelos
    .map((m) => m.actualizada)
    .filter(Boolean)
    .sort()
    .at(-1);

  const urls: MetadataRoute.Sitemap = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/herramientas`, priority: 0.7 },
    ...HERRAMIENTAS.map((h) => ({ url: `${SITE_URL}${h.href}`, priority: 0.8 })),
    { url: `${SITE_URL}/coches`, lastModified: fecha(ultima), priority: 0.8 },
    ...LETRAS_USADAS.map((l) => ({ url: `${SITE_URL}/matricula/${l.toLowerCase()}`, priority: 0.7 })),
    { url: `${SITE_URL}/matricula/provinciales`, priority: 0.6 },
    ...LISTA_PROVINCIAS.map((p) => ({ url: `${SITE_URL}/mas-vendidos/${p.slug}`, priority: 0.6 })),
    ...COMUNIDADES.map((c) => ({ url: `${SITE_URL}/calculadora-itp/${c.id}`, priority: 0.7 })),
    ...agruparPorMarca(modelos).map((g) => ({
      url: `${SITE_URL}/coches/${g.slug}`,
      lastModified: fecha(g.modelos.map((m) => m.actualizada).filter(Boolean).sort().at(-1)),
      priority: 0.6,
    })),
    ...modelos.filter(enSitemap).map((m) => ({
      url: `${SITE_URL}${urlFicha(m.slug)}`,
      lastModified: fecha(m.actualizada),
      priority: 0.7,
    })),
    { url: `${SITE_URL}/glosario`, priority: 0.5 },
    { url: `${SITE_URL}/prensa`, priority: 0.5 },
    { url: `${SITE_URL}/metodologia`, priority: 0.4 },
    { url: `${SITE_URL}/privacidad`, priority: 0.2 },
    { url: `${SITE_URL}/aviso-legal`, priority: 0.2 },
  ];
  // Sin URLs repetidas (se queda la primera aparición)
  return urls.filter((u, i) => urls.findIndex((x) => x.url === u.url) === i);
}
