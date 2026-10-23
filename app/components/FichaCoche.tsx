"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CarLinearIcon,
  WaterdropLinearIcon,
  BoltLinearIcon,
  TransmissionLinearIcon,
  LoginLinearIcon,
  UsersGroupTwoRoundedLinearIcon,
} from "@solar-icons/react";
import styles from "../page.module.css";
import type { Resultado } from "../lib/resultados";
import { eur } from "../lib/formato";

// Anillo de confianza que se dibuja al aparecer
function Anillo({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 36;
  const color =
    pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--aviso)" : "var(--error)";
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      role="img"
      aria-label={`Seguridad ${pct} %`}
    >
      <circle
        cx="44"
        cy="44"
        r="36"
        fill="none"
        stroke="var(--linea)"
        strokeWidth="8"
      />
      <circle
        className={styles.anilloValor}
        cx="44"
        cy="44"
        r="36"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={
          {
            stroke: color,
            strokeDasharray: C,
            strokeDashoffset: C * (1 - pct / 100),
            "--c": C,
          } as React.CSSProperties
        }
      />
      <text x="44" y="50" textAnchor="middle" className={styles.anilloTxt}>
        {pct}%
      </text>
    </svg>
  );
}

// Número que sube de 0 al valor final
function useContar(objetivo: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setV(objetivo);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(objetivo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [objetivo]);
  return v;
}

const delay = (i: number) => ({ "--i": i } as React.CSSProperties);

// Ficha de un coche identificado: la usan la portada y los enlaces compartidos
export default function FichaCoche({
  r,
  tituloRef,
}: {
  r: Resultado;
  tituloRef?: React.Ref<HTMLHeadingElement>;
}) {
  const pct = Math.round((r.confianza ?? 0) * 100);
  const nivel = pct >= 80 ? "alta" : pct >= 50 ? "media" : "baja";
  const min = useContar(r.precioSegundaManoEur?.min ?? 0);
  const max = useContar(r.precioSegundaManoEur?.max ?? 0);

  const filas = (
    [
      [CarLinearIcon, "Carrocería", r.carroceria ?? ""],
      [WaterdropLinearIcon, "Combustible", r.combustibles?.join(", ") ?? ""],
      [BoltLinearIcon, "Potencia", r.potenciaCvRango ?? ""],
      [TransmissionLinearIcon, "Cambio", r.cambio ?? ""],
      [LoginLinearIcon, "Puertas", r.puertas ? String(r.puertas) : ""],
      [UsersGroupTwoRoundedLinearIcon, "Plazas", r.plazas ? String(r.plazas) : ""],
    ] as [React.ElementType, string, string][]
  ).filter(([, , v]) => v);

  return (
    <>
      <div className={`${styles.cabRes} ${styles.entra}`}>
        <div>
          <p className={styles.marcaR}>{r.marca}</p>
          <h2
            className={styles.modeloR}
            ref={tituloRef}
            tabIndex={-1}
            aria-label={`${r.marca} ${r.modelo}`}
          >
            {r.modelo}
          </h2>
          <p className={styles.genR}>
            {[r.generacion, r.anios].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className={styles.seg}>
          <Anillo pct={pct} />
          <span>Seguridad {nivel}</span>
        </div>
      </div>

      {r.ficha && (
        <p className={`${styles.verFicha} ${styles.entra}`} style={delay(1)}>
          <Link href={r.ficha} className={styles.notaLink}>
            Ver la ficha completa del {r.marca} {r.modelo}: generaciones, motores y
            qué revisar antes de comprarlo
          </Link>
        </p>
      )}

      {r.notas && (
        <p className={`${styles.notaR} ${styles.entra}`} style={delay(1)}>
          {r.notas}
        </p>
      )}

      <div className={styles.specs}>
        {filas.map(([Icono, et, v], k) => (
          <div
            key={et}
            className={`${styles.spec} ${styles.entra}`}
            style={delay(k + 2)}
          >
            <span className={styles.specIc}>
              <Icono size={20} />
            </span>
            <div>
              <span className={styles.specEt}>{et}</span>
              <strong className={styles.specV}>{v}</strong>
            </div>
          </div>
        ))}
      </div>

      {r.precioSegundaManoEur && (
        <div className={`${styles.precio} ${styles.entra}`} style={delay(8)}>
          <p className={styles.precioEt}>Segunda mano en España</p>
          <p className={styles.precioN}>
            {eur(min)} a {eur(max)}
          </p>
          <p className={styles.precioX}>
            {r.precioNuevoEurAprox ? `Nuevo: ${r.precioNuevoEurAprox}. ` : ""}
            Estimación de la IA, no es una tasación.
          </p>
        </div>
      )}

      {r.similares?.length > 0 && (
        <>
          <h3 className={styles.subT}>Coches parecidos</h3>
          <div className={styles.similares}>
            {r.similares.map((s, i) => (
              <div
                key={i}
                className={`${styles.sim} ${styles.entra}`}
                style={delay(9 + i)}
              >
                <span className={styles.simIni}>
                  <CarLinearIcon size={22} />
                </span>
                <div>
                  <p className={styles.simN}>
                    {s.marca} {s.modelo}
                  </p>
                  <p className={styles.simM}>{s.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
