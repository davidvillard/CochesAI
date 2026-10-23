"use client";

import { useEffect } from "react";
import styles from "../page.module.css";

// Las secciones con data-reveal aparecen al hacer scroll. No pinta nada:
// así el contenido de la portada se queda en el servidor.
export default function Revelar() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visto);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
