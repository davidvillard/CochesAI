"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./checklist.module.css";
import { GRUPOS, TOTAL } from "./puntos";

const CLAVE = "cochesai.checklist";

export default function Checklist() {
  const [hechos, setHechos] = useState<Set<string>>(new Set());

  // Recupera lo marcado en este navegador (si el almacenamiento no está disponible, empieza vacío)
  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(guardado)) setHechos(new Set(guardado));
    } catch {
      // sin almacenamiento: no pasa nada
    }
  }, []);

  function cambiar(id: string) {
    const nuevo = new Set(hechos);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setHechos(nuevo);
    try {
      localStorage.setItem(CLAVE, JSON.stringify([...nuevo]));
    } catch {
      // sin almacenamiento: se pierde al recargar
    }
  }

  function vaciar() {
    setHechos(new Set());
    try {
      localStorage.removeItem(CLAVE);
    } catch {}
  }

  return (
    <div className={styles.lista}>
      <div className={styles.barra}>
        <p className={styles.progreso} aria-live="polite">
          <strong>
            {hechos.size} de {TOTAL}
          </strong>{" "}
          revisados
        </p>
        <div className={styles.medidor} aria-hidden="true">
          <span style={{ width: `${(hechos.size / TOTAL) * 100}%` }} />
        </div>
        <div className={styles.acciones}>
          <button type="button" onClick={() => window.print()}>
            Imprimir
          </button>
          <button type="button" onClick={vaciar} disabled={!hechos.size}>
            Empezar de nuevo
          </button>
        </div>
      </div>

      {GRUPOS.map((g) => (
        <section key={g.titulo} className={styles.grupo}>
          <h2 className={styles.grupoT}>{g.titulo}</h2>
          <ul className={styles.puntos}>
            {g.puntos.map((p) => (
              <li key={p.id} className={hechos.has(p.id) ? styles.hecho : undefined}>
                <label className={styles.punto}>
                  <input type="checkbox" checked={hechos.has(p.id)} onChange={() => cambiar(p.id)} />
                  <span>
                    <span className={styles.texto}>{p.texto}</span>
                    {p.ayuda && <span className={styles.ayuda}>{p.ayuda}</span>}
                  </span>
                </label>
                {p.enlace && (
                  <Link href={p.enlace[0]} className={styles.enlace}>
                    {p.enlace[1]} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
