import type { MetadataRoute } from "next";
import { agruparPorMarca, listarModelos, urlFicha } from "./lib/fichas";
import { SITE_URL } from "./lib/seo";

// Se genera en cada petición para incluir las fichas nuevas
// (Upstash no deja cachear sus lecturas en el build)
export const dynamic = "force-dynamic";

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

  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/coches`, lastModified: fecha(ultima), priority: 0.8 },
    { url: `${SITE_URL}/matricula`, priority: 0.8 },
    ...agruparPorMarca(modelos).map((g) => ({
      url: `${SITE_URL}/coches/${g.slug}`,
      lastModified: fecha(g.modelos.map((m) => m.actualizada).filter(Boolean).sort().at(-1)),
      priority: 0.6,
    })),
    ...modelos.map((m) => ({
      url: `${SITE_URL}${urlFicha(m.slug)}`,
      lastModified: fecha(m.actualizada),
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacidad`, priority: 0.2 },
    { url: `${SITE_URL}/aviso-legal`, priority: 0.2 },
  ];
}
