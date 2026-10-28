"use client";

import { useEffect } from "react";

// Registra public/sw.js, que recibe las fotos compartidas desde otras apps
export default function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);
  return null;
}
