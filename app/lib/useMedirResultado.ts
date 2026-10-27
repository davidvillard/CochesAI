"use client";

import { useEffect, useRef } from "react";
import { medir } from "./medir";

// Para las calculadoras que dan el resultado mientras escribes: avisa cuando el
// resultado lleva 3 s quieto, y cada combinación una sola vez por página.
export function useMedirResultado(pares: [string, string][] | null) {
  const enviados = useRef(new Set<string>());
  const clave = pares ? JSON.stringify(pares) : "";

  useEffect(() => {
    if (!clave || enviados.current.has(clave) || enviados.current.size >= 5) return;
    const t = setTimeout(() => {
      enviados.current.add(clave);
      medir(...(JSON.parse(clave) as [string, string][]));
    }, 3000);
    return () => clearTimeout(t);
  }, [clave]);
}
