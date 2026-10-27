"use client";

import { useState } from "react";
import styles from "../calculadora-itp/itp.module.css";
import propios from "./bastidor.module.css";
import Afiliados from "../components/Afiliados";
import { leerVin, type LecturaVin } from "../lib/vin";
import { medir } from "../lib/medir";

export default function DecodificadorVin() {
  const [texto, setTexto] = useState("");
  const [lectura, setLectura] = useState<LecturaVin | null>(null);

  return (
    <div className={styles.caja}>
      <form
        className={propios.form}
        onSubmit={(e) => {
          e.preventDefault();
          const l = leerVin(texto);
          setLectura(l);
          medir(
            ["vin", l.valido ? (l.fabricante ?? "desconocido") : "invalido"],
            ...(l.valido && l.pais ? [["vin-pais", l.pais] as [string, string]] : [])
          );
        }}
      >
        <label className={styles.campo}>
          <span className={styles.et}>Número de bastidor (VIN), 17 caracteres</span>
          <input
            className={`${styles.input} ${propios.vin}`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="VSSZZZ5FZJR000000"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={21}
            required
          />
        </label>
        <button type="submit" className={propios.boton}>
          Decodificar
        </button>
      </form>

      <div aria-live="polite">
        {lectura && !lectura.valido && <p className={propios.error}>{lectura.motivo}</p>}
        {lectura?.valido && (
          <>
            <div className={styles.resultado}>
              <p className={styles.resEt}>Fabricante</p>
              <p className={styles.resN}>{lectura.fabricante ?? "No identificado"}</p>
              <ul className={styles.detalle}>
                <li>País de fabricación: {lectura.pais ?? "no identificado"}.</li>
                <li>
                  Año de modelo:{" "}
                  {lectura.anios.length
                    ? `${lectura.anios[0]}${lectura.anios[1] ? ` (o ${lectura.anios[1]})` : ""}`
                    : "esta marca no lo indica en el bastidor; míralo en la ficha técnica"}
                  .
                </li>
                {lectura.control !== "no aplica" && (
                  <li>
                    Dígito de control:{" "}
                    {lectura.control === "correcto"
                      ? "correcto"
                      : "no cuadra: revisa que esté bien copiado"}
                    .
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.tablaCaja} style={{ marginTop: 16 }}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Parte</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Qué indica</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1 a 3", lectura.partes.wmi, "Fabricante y país (WMI)"],
                    ["4 a 8", lectura.partes.vds, "Modelo, carrocería y motor, según la marca"],
                    ["9", lectura.partes.control, "Dígito de control (obligatorio en Norteamérica)"],
                    ["10", lectura.partes.anio, "Año de modelo (si la marca lo usa)"],
                    ["11", lectura.partes.planta, "Planta de montaje"],
                    ["12 a 17", lectura.partes.serie, "Número de serie"],
                  ].map(([pos, valor, que]) => (
                    <tr key={pos}>
                      <td>{pos}</td>
                      <td className={propios.mono}>{valor}</td>
                      <td>{que}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Afiliados titulo="¿Quieres su historial completo?" />
          </>
        )}
      </div>
    </div>
  );
}
