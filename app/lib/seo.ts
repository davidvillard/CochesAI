import type { Metadata } from "next";

// Dirección pública de la web. Al pasar a dominio propio basta con definir
// NEXT_PUBLIC_SITE_URL en Vercel (canonical, sitemap, robots y datos estructurados).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cochesai.vercel.app"
).replace(/\/$/, "");

export const NOMBRE_WEB = "Coches AI";

// Corta un texto sin partir palabras, para meta descripciones (~155 caracteres)
export function recortar(texto: string, max = 155) {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max - 1);
  return `${corte.slice(0, corte.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

// Metadatos completos de una página. Hace falta repetir openGraph y twitter en
// cada página: si no, heredan los de la portada (incluida su URL). Y al definirlos
// se pierde la imagen general, así que se vuelve a poner. Las páginas con su
// propio opengraph-image (como /r/[id]) pasan imagenPropia para no taparlo.
const IMAGEN = "/opengraph-image";

export function metadatos({
  titulo,
  descripcion,
  ruta,
  indexar = true,
  imagenPropia = false,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  indexar?: boolean;
  imagenPropia?: boolean;
}): Metadata {
  const description = recortar(descripcion);
  // La clave no debe existir: incluso images: undefined tapa la imagen propia
  const imagen = imagenPropia ? {} : { images: [IMAGEN] };
  return {
    title: titulo,
    description,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: NOMBRE_WEB,
      url: ruta,
      title: titulo,
      description,
      ...imagen,
    },
    twitter: { card: "summary_large_image", title: titulo, description, ...imagen },
    ...(indexar ? {} : { robots: { index: false, follow: true } }),
  };
}
