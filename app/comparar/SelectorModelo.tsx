"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./comparar.module.css";

type Opcion = { slug: string; marca: string; modelo: string };

const normal = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const etiquetaDe = (o: Opcion) => `${o.marca} ${o.modelo}`;

// Desplegable con buscador dentro (combobox): escribes y la lista se filtra.
// Envía el slug elegido en un campo oculto con el nombre `campo`, así el formulario
// sigue siendo un GET normal y la URL se puede compartir.
export default function SelectorModelo({
  campo,
  etiqueta,
  opciones,
  actual,
  sinResultados,
}: {
  campo: string;
  etiqueta: string;
  opciones: Opcion[];
  actual?: string;
  sinResultados?: React.ReactNode; // qué ofrecer cuando lo escrito no está en la lista
}) {
  const id = useId();
  const inicial = opciones.find((o) => o.slug === actual);
  const [valor, setValor] = useState(inicial?.slug ?? "");
  const [texto, setTexto] = useState(inicial ? etiquetaDe(inicial) : "");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const elegida = opciones.find((o) => o.slug === valor);
  // Con el modelo ya elegido y el texto sin tocar se enseña la lista entera
  const q = elegida && texto === etiquetaDe(elegida) ? "" : normal(texto.trim());
  const visibles = useMemo(
    () => (q ? opciones.filter((o) => normal(etiquetaDe(o)).includes(q)) : opciones),
    [q, opciones]
  );

  function elegir(o: Opcion) {
    setValor(o.slug);
    setTexto(etiquetaDe(o));
    setAbierto(false);
    input.current?.setCustomValidity("");
  }

  // Sin modelo elegido no se envía el formulario: se avisa como un campo obligatorio
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const alEnviar = (e: SubmitEvent) => {
      if (valor) return;
      e.preventDefault();
      // Que no llegue al envío de React (next/form), que navegaría igualmente
      e.stopPropagation();
      input.current?.setCustomValidity("Elige un modelo de la lista");
      input.current?.reportValidity();
      setAbierto(true);
    };
    form.addEventListener("submit", alEnviar);
    return () => form.removeEventListener("submit", alEnviar);
  }, [valor]);

  // La opción activa siempre a la vista al moverse con el teclado
  useEffect(() => {
    lista.current?.querySelector(`[data-i="${activo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activo]);

  return (
    <div className={styles.campo}>
      <label className={styles.etiqueta} htmlFor={`${id}-input`}>
        {etiqueta}
      </label>
      <div className={styles.combo}>
        <input
          ref={input}
          id={`${id}-input`}
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={abierto && visibles[activo] ? `${id}-${activo}` : undefined}
          autoComplete="off"
          className={styles.select}
          placeholder="Escribe o elige: León, Tucson…"
          value={texto}
          onFocus={(e) => {
            e.target.select();
            setAbierto(true);
            setActivo(Math.max(visibles.findIndex((o) => o.slug === valor), 0));
          }}
          onClick={() => setAbierto(true)}
          onBlur={() => {
            setAbierto(false);
            // Si se deja el texto a medias, vuelve al modelo elegido
            setTexto(elegida ? etiquetaDe(elegida) : "");
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActivo(0);
            if (valor) setValor("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAbierto(true);
              setActivo((i) => Math.min(i + 1, visibles.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && abierto) {
              e.preventDefault();
              if (visibles[activo]) elegir(visibles[activo]);
            } else if (e.key === "Escape") {
              setAbierto(false);
            }
          }}
        />
        <span className={styles.flecha} aria-hidden="true" />
        <input type="hidden" name={campo} value={valor} />
        {abierto && (
          <ul ref={lista} id={`${id}-lista`} role="listbox" className={styles.lista} aria-label={etiqueta}>
            {visibles.length === 0 && (
              // mousedown sin efecto: así el input no pierde el foco y el enlace se puede pulsar
              <li className={styles.vacia} onMouseDown={(e) => e.preventDefault()}>
                Ningún modelo coincide.
                {sinResultados && <span className={styles.vaciaMas}>{sinResultados}</span>}
              </li>
            )}
            {visibles.map((o, i) => (
              <li
                key={o.slug}
                id={`${id}-${i}`}
                data-i={i}
                role="option"
                aria-selected={o.slug === valor}
                className={`${styles.opcion} ${i === activo ? styles.opcionActiva : ""}`}
                // mousedown en vez de click: así se elige antes de que el input pierda el foco
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(o);
                }}
                onMouseEnter={() => setActivo(i)}
              >
                <span className={styles.opcionMarca}>{o.marca}</span> {o.modelo}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
