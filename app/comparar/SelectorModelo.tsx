"use client";

import { useState } from "react";
import styles from "./comparar.module.css";

type Opcion = { slug: string; marca: string; modelo: string };

const normal = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Desplegable de modelos agrupado por marca, con un buscador encima que filtra
// las opciones. Sin JavaScript queda el desplegable normal y el formulario funciona igual.
export default function SelectorModelo({
  campo,
  etiqueta,
  opciones,
  actual,
}: {
  campo: string;
  etiqueta: string;
  opciones: Opcion[];
  actual?: string;
}) {
  const [busca, setBusca] = useState("");
  const [valor, setValor] = useState(actual ?? "");
  const q = normal(busca.trim());
  const visibles = q
    ? opciones.filter((o) => o.slug === valor || normal(`${o.marca} ${o.modelo}`).includes(q))
    : opciones;

  const grupos = new Map<string, Opcion[]>();
  for (const o of visibles) grupos.set(o.marca, [...(grupos.get(o.marca) ?? []), o]);

  return (
    <div className={styles.campo}>
      <label className={styles.etiqueta} htmlFor={`sel-${campo}`}>
        {etiqueta}
      </label>
      <input
        type="search"
        className={styles.buscar}
        placeholder="Busca: León, Tucson, MG…"
        aria-label={`Buscar modelo para el ${etiqueta.toLowerCase()}`}
        value={busca}
        onChange={(e) => {
          const texto = e.target.value;
          setBusca(texto);
          // Si la búsqueda deja un solo modelo, se elige solo
          const t = normal(texto.trim());
          const encontrados = t ? opciones.filter((o) => normal(`${o.marca} ${o.modelo}`).includes(t)) : [];
          if (encontrados.length === 1) setValor(encontrados[0].slug);
        }}
      />
      <select
        id={`sel-${campo}`}
        name={campo}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        className={styles.select}
      >
        <option value="" disabled>
          {q && !visibles.length ? "Ningún modelo coincide" : `Elige un modelo (${visibles.length})`}
        </option>
        {[...grupos].map(([marca, lista]) => (
          <optgroup key={marca} label={marca}>
            {lista.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.marca} {m.modelo}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
