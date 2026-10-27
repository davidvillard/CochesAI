"use client";

import { useState } from "react";
import styles from "../calculadora-itp/itp.module.css";
import { estimarMatricula } from "../lib/matricula";
import { useMedirResultado } from "../lib/useMedirResultado";

// ¿Qué matrícula le tocará a un coche que se matricula en una fecha concreta?
export default function Predictor() {
  const [fecha, setFecha] = useState("");
  const matricula = fecha ? estimarMatricula(new Date(`${fecha}T12:00:00`)) : null;

  useMedirResultado(fecha ? [["prediccion", fecha.slice(0, 4)]] : null);

  return (
    <div className={styles.caja}>
      <label className={styles.campo}>
        <span className={styles.et}>Fecha de matriculación (pasada o futura)</span>
        <input className={styles.input} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>
      <div aria-live="polite">
        {fecha && (
          <div className={styles.resultado}>
            <p className={styles.resEt}>Matrícula aproximada</p>
            <p className={styles.resN}>{matricula ?? "Fuera de rango"}</p>
            <p className={styles.resX}>
              {matricula
                ? "Estimación con un margen de unos días. En fechas futuras, cuanto más lejos, más margen."
                : "Las matrículas actuales empezaron en septiembre de 2000."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
