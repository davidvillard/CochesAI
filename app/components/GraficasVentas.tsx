import styles from "./Ventas.module.css";
import { COMBUSTIBLES, MESES_CORTOS, pct, unidades } from "../lib/ventas";

// Unidades matriculadas cada mes (12 columnas)
export function PorMes({ mensual, nombre }: { mensual: number[]; nombre: string }) {
  const tope = Math.max(1, ...mensual);
  return (
    <figure style={{ margin: 0 }}>
      <div
        className={styles.columnas}
        role="img"
        aria-label={`${nombre}, matriculaciones por mes: ${mensual.map((v, i) => `${MESES_CORTOS[i]} ${v}`).join(", ")}`}
      >
        {mensual.map((v, i) => (
          <div key={MESES_CORTOS[i]} className={styles.col} title={`${MESES_CORTOS[i]}: ${unidades(v)}`}>
            <span style={{ height: `${(v / tope) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className={styles.ejes} aria-hidden>
        {MESES_CORTOS.map((m) => (
          <span key={m}>{m.split(" ")[0]}</span>
        ))}
      </div>
    </figure>
  );
}

// Lista con barras: [nombre, unidades], con el % sobre el total
export function Barras({ filas, total }: { filas: { nombre: string; unidades: number }[]; total: number }) {
  const tope = Math.max(1, ...filas.map((f) => f.unidades));
  return (
    <ul className={styles.barras}>
      {filas.map((f) => (
        <li key={f.nombre} className={styles.barra} title={`${f.nombre}: ${unidades(f.unidades)}`}>
          <span>{f.nombre}</span>
          <span className={styles.barraV}>{pct(f.unidades, total)}</span>
          <span className={styles.pista}>
            <span style={{ width: `${(f.unidades / tope) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export const nombreCombustible = (id: string) => COMBUSTIBLES[id] ?? id;
