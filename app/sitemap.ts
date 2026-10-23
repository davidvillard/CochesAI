import type { MetadataRoute } from "next";
import { listarModelos, urlFicha } from "./lib/fichas";

const baseUrl = "https://cochesai.vercel.app";

// Se genera en cada petición para incluir las fichas nuevas
// (Upstash no deja cachear sus lecturas en el build)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelos = await listarModelos();
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/coches`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/matricula`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...modelos.map((m) => ({
      url: `${baseUrl}${urlFicha(m.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/aviso-legal`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
