"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { enviar } from "../lib/medir";

// La primera página que se ve en esta pestaña es la de entrada
let primera = true;

// Cuenta cada página vista, también de quien rechaza las cookies de Analytics:
// no usa cookies ni guarda nada, solo avisa de la ruta (ver app/api/m/route.ts)
export default function Visitas() {
  const ruta = usePathname();

  useEffect(() => {
    const entrada = primera;
    primera = false;
    // Las direcciones que no existen se cuentan aparte (Medir404)
    if (document.querySelector("[data-pagina-404]")) return;
    enviar({
      vista: entrada
        ? {
            ruta,
            entrada,
            ref: document.referrer,
            utm: new URLSearchParams(location.search).get("utm_source") ?? undefined,
          }
        : { ruta, entrada },
    });
  }, [ruta]);

  return null;
}
