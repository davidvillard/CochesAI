"use client";

import { useMemo, useState } from "react";
import styles from "../calculadora-itp/itp.module.css";
import { TIPOS_ITV, proximaItv, type TipoItv } from "../lib/itv";
import { tramo } from "../lib/medir";
import { useMedirResultado } from "../lib/useMedirResultado";

const fechaLarga = (d: Date) =>
  d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

const leerFecha = (v: string) => (v ? new Date(`${v}T12:00:00`) : undefined);

export default function CalculadoraItv() {
  const [tipo, setTipo] = useState<TipoItv>("turismo");
  const [matriculacion, setMatriculacion] = useState("");
  const [ultima, setUltima] = useState("");

  const resultado = useMemo(() => {
    const m = leerFecha(matriculacion);
    if (!m || m > new Date()) return null;
    return proximaItv(tipo, m, leerFecha(ultima));
  }, [tipo, matriculacion, ultima]);

  // Años del coche, en tramos, para la analítica propia
  const anios = useMemo(() => {
    const m = leerFecha(matriculacion);
    return m ? (new Date().getTime() - m.getTime()) / 31_557_600_000 : null;
  }, [matriculacion]);
  useMedirResultado(
    resultado && anios !== null
      ? [
          ["itv", tipo],
          ["antiguedad", tramo(anios, [3, 5, 8, 12, 15], "-anios")],
        ]
      : null
  );

  return (
    <div className={styles.caja}>
      <div className={styles.form}>
        <label className={styles.campo}>
          <span className={styles.et}>Tipo de vehículo</span>
          <select className={styles.input} value={tipo} onChange={(e) => setTipo(e.target.value as TipoItv)}>
            {TIPOS_ITV.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.campo}>
          <span className={styles.et}>Fecha de primera matriculación</span>
          <input className={styles.input} type="date" value={matriculacion} onChange={(e) => setMatriculacion(e.target.value)} />
        </label>
        <label className={styles.campo}>
          <span className={styles.et}>Última ITV pasada (opcional)</span>
          <input className={styles.input} type="date" value={ultima} onChange={(e) => setUltima(e.target.value)} />
        </label>
      </div>

      <div aria-live="polite">
        {resultado && (
          <div className={styles.resultado}>
            <p className={styles.resEt}>
              {resultado.primera ? "Primera ITV" : "Próxima ITV"}
              {resultado.porFecha ? " (aproximada)" : ""}
            </p>
            <p className={styles.resN}>{fechaLarga(resultado.proxima)}</p>
            <p className={styles.resX}>
              {resultado.dias < 0
                ? `Caducó hace ${-resultado.dias} días: pásala cuanto antes, circular con la ITV caducada se puede multar.`
                : resultado.dias === 0
                  ? "Caduca hoy."
                  : `Faltan ${resultado.dias} días.`}
            </p>
            <ul className={styles.detalle}>
              <li>A partir de entonces le tocará {resultado.periodicidad}.</li>
              <li>Puedes pasarla hasta 30 días antes sin que cambie la fecha de la siguiente.</li>
              {resultado.porFecha && (
                <li>
                  Calculada suponiendo que siempre la ha pasado en su fecha. Pon la de la
                  última ITV (está en la tarjeta ITV o en la pegatina) para afinar.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
