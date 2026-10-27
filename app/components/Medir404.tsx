"use client";

import { useEffect } from "react";
import { medir } from "../lib/medir";

// Apunta qué direcciones no existen: enlaces rotos o fichas que la gente busca
export default function Medir404() {
  useEffect(() => medir(["404", location.pathname]), []);
  // Marca para que Visitas no la cuente como página vista
  return <span data-pagina-404 hidden />;
}
