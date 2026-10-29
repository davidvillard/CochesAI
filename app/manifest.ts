import type { MetadataRoute } from "next";
import { NOMBRE_CORTO, NOMBRE_WEB } from "./lib/marca";

// Hace la web instalable ("Añadir a pantalla de inicio") y, en Android, la
// añade a la lista de "Compartir": la foto llega a /compartir (public/sw.js)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${NOMBRE_WEB} Identificar coche por foto`,
    short_name: NOMBRE_CORTO,
    description: "Identifica cualquier coche con una foto y consulta su ficha, su precio y su matrícula.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F8FC",
    theme_color: "#F7F8FC",
    lang: "es",
    categories: ["auto", "utilities"],
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icono-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/compartir",
      method: "POST",
      enctype: "multipart/form-data",
      params: { files: [{ name: "foto", accept: ["image/*"] }] },
    },
    shortcuts: [
      { name: "Año y etiqueta por matrícula", short_name: "Matrícula", url: "/matricula" },
      { name: "Calculadora de ITP", short_name: "ITP", url: "/calculadora-itp" },
      { name: "Coches más vendidos", short_name: "Más vendidos", url: "/mas-vendidos" },
    ],
  };
}
