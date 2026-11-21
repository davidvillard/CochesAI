"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./adivina.module.css";
import SelectorModelo from "../comparar/SelectorModelo";
import { medir } from "../lib/medir";
import type { Celda, Partida } from "../lib/adivina";

type Opcion = { slug: string; marca: string; modelo: string };

const MAX = 6;
const CLAVE = (fecha: string) => `adivina:${fecha}`;

// La partida en curso se guarda en este navegador para poder seguir luego.
// Si el almacenamiento no está disponible, se juega igual sin guardar.
function leerGuardado(fecha: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE(fecha)) ?? "[]");
    return Array.isArray(v) ? v.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function guardar(fecha: string, intentos: string[]) {
  try {
    localStorage.setItem(CLAVE(fecha), JSON.stringify(intentos));
  } catch {
    // Sin almacenamiento: la partida no se recuerda, pero se puede jugar
  }
}

const emoji = (c: Celda) =>
  c.estado === "ok" ? "🟩" : c.estado === "cerca" ? "🟨" : c.flecha === "arriba" ? "⬆️" : c.flecha === "abajo" ? "⬇️" : "🟥";

function textoCompartir(p: Partida) {
  const filas = p.filas.map((f) => f.celdas.map(emoji).join("")).join("\n");
  return `¿Qué coche es? Adivina #${p.numero} ${p.acertado ? p.filas.length : "X"}/${MAX}\n${filas}\nquecochees.es/adivina`;
}

export default function Juego({ inicial, opciones }: { inicial: Partida; opciones: Opcion[] }) {
  const [p, setP] = useState(inicial);
  const [intentos, setIntentos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function enviar(lista: string[], nuevo = true) {
    setCargando(true);
    setError("");
    try {
      const r = await fetch("/api/adivina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentos: lista, fecha: inicial.fecha }),
      });
      if (!r.ok) throw new Error();
      const nueva: Partida = await r.json();
      setP(nueva);
      setIntentos(lista);
      guardar(nueva.fecha, lista);
      if (nueva.fin && nuevo) {
        medir(["adivina", nueva.acertado ? `${nueva.filas.length}-de-6` : "fallado"]);
      }
    } catch {
      setError("No se ha podido comprobar. Inténtalo otra vez.");
    } finally {
      setCargando(false);
    }
  }

  // Al volver a la página se recupera la partida de hoy
  useEffect(() => {
    const previos = leerGuardado(inicial.fecha);
    // Solo al cargar: lo guardado en el navegador no se puede leer en el servidor
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (previos.length) void enviar(previos, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function intentar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const slug = String(new FormData(e.currentTarget).get("coche") ?? "");
    if (!slug || intentos.includes(slug) || p.fin || cargando) return;
    void enviar([...intentos, slug]);
  }

  async function compartir() {
    const texto = textoCompartir(p);
    try {
      if (navigator.share) {
        await navigator.share({ text: texto });
      } else {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
      medir(["compartir", "adivina"]);
    } catch {
      // Cancelado por el usuario
    }
  }

  const libres = opciones.filter((o) => !intentos.includes(o.slug));
  const quedan = MAX - p.filas.length;

  return (
    <div className={styles.juego}>
      <ol className={styles.pistas}>
        {p.pistas.map((t, i) => (
          <li key={i} className={i === p.pistas.length - 1 && !p.fin ? styles.nueva : undefined}>
            <span className={styles.pistaN}>Pista {i + 1}</span>
            {t}
          </li>
        ))}
      </ol>

      {!p.fin && (
        <form className={styles.form} onSubmit={intentar}>
          <SelectorModelo
            key={intentos.length}
            campo="coche"
            etiqueta={`¿Qué coche es? Te quedan ${quedan} ${quedan === 1 ? "intento" : "intentos"}`}
            opciones={libres}
          />
          <button className={styles.boton} disabled={cargando}>
            {cargando ? "Comprobando…" : "Probar"}
          </button>
        </form>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {p.fin && p.solucion && (
        <div className={`${styles.final} ${p.acertado ? styles.ganado : ""}`}>
          <p className={styles.finalTit}>
            {p.acertado
              ? `¡Acertado en ${p.filas.length} ${p.filas.length === 1 ? "intento" : "intentos"}!`
              : "Esta vez no ha podido ser"}
          </p>
          <p className={styles.finalTxt}>
            El coche de hoy era el{" "}
            <Link href={`/coches/${p.solucion.slug}`}>{p.solucion.nombre}</Link>. Mañana, otro.
          </p>
          <div className={styles.acciones}>
            <button type="button" className={styles.boton} onClick={compartir}>
              {copiado ? "Copiado ✓" : "Compartir resultado"}
            </button>
            <a
              className={styles.botonSec}
              href={`https://wa.me/?text=${encodeURIComponent(textoCompartir(p))}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => medir(["compartir", "adivina-whatsapp"])}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}

      {p.filas.length > 0 && (
        <div className={styles.tablaCaja}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Tu intento</th>
                {p.filas[0].celdas.map((c) => (
                  <th key={c.id} scope="col">
                    {c.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.filas.map((f) => (
                <tr key={f.slug}>
                  <th scope="row">{f.nombre}</th>
                  {f.celdas.map((c) => (
                    <td key={c.id} className={styles[c.estado]}>
                      {c.valor}
                      {c.flecha && (
                        <span
                          className={styles.flecha}
                          aria-label={c.flecha === "arriba" ? "el de hoy es más alto" : "el de hoy es más bajo"}
                        >
                          {c.flecha === "arriba" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className={styles.leyenda}>
        <span className={`${styles.muestra} ${styles.ok}`} /> coincide ·{" "}
        <span className={`${styles.muestra} ${styles.cerca}`} /> también se vende con ese motor · ↑ ↓
        el de hoy es más caro o más vendido, o menos
      </p>
    </div>
  );
}
