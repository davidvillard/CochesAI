import type { Metadata } from "next";

// Dirección pública de la web (canonical, sitemap, robots, imágenes de
// previsualización y datos estructurados). Se detecta sola según dónde se ejecute:
// - SITE_URL, si se define a mano (para forzar un dominio concreto).
// - Producción en Vercel: su dominio de producción. Vercel elige el dominio propio
//   en cuanto se añade al proyecto, o el .vercel.app si no hay ninguno.
// - Previsualización en Vercel (otras ramas): la URL de esa rama.
// - En local: http://localhost con el puerto del servidor.
// Solo funciona en el servidor: en el navegador se usa window.location.origin.
function urlDelSitio() {
  const env = process.env;
  if (env.SITE_URL) return env.SITE_URL;
  const dominio =
    env.VERCEL_ENV === "production"
      ? env.VERCEL_PROJECT_PRODUCTION_URL
      : env.VERCEL_ENV === "preview"
        ? (env.VERCEL_BRANCH_URL ?? env.VERCEL_URL)
        : undefined;
  return dominio ? `https://${dominio}` : `http://localhost:${env.PORT ?? 3000}`;
}

export const SITE_URL = urlDelSitio().replace(/\/$/, "");

import { NOMBRE_WEB } from "./marca";
export { NOMBRE_WEB };

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
