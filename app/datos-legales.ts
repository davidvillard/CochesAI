// Rellena estos datos UNA vez: las dos páginas legales los leen de aquí.
// Mientras algún valor empiece por "[", en local verás un aviso en la página.

import { SITE_URL } from "./lib/seo";
import { NOMBRE_WEB } from "./lib/marca";

export const LEGAL = {
    nombreWeb: NOMBRE_WEB,
    // Tu nombre completo, o la razón social si lo haces a través de una empresa
    titular: "David Villar Durán",
    nif: "39468161T",
    // Domicilio completo: calle, número, código postal, ciudad y provincia
    domicilio: "Avenida de Marin, 36940, Cangas, Pontevedra, España",
    email: "davidvillarduran@icloud.com",
    // Se detecta sola: será tu dominio propio cuando lo conectes en Vercel
    web: SITE_URL,
    fecha: "octubre de 2026",
};