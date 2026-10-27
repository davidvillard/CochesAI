"use client";

import { useState } from "react";
import base from "../page.module.css";
import Afiliados from "../components/Afiliados";
import styles from "./matricula.module.css";
import {
  COMBUSTIBLES,
  ETIQUETAS,
  ULTIMO_MES,
  antiguedad,
  etiqueta,
  leerMatricula,
  nombreMes,
  type Combustible,
  type Lectura,
} from "../lib/matricula";
import { medir } from "../lib/medir";

const DGT_DISTINTIVO =
  "https://sede.dgt.gob.es/es/vehiculos/informacion-de-vehiculos/distintivo-ambiental";

// Las matrículas provinciales acaban en septiembre de 2000: se usa como fecha máxima
const FIN_PROVINCIAL = { anio: 2000, mes: 8 };

const anios = (n: number) => (n === 1 ? "1 año" : `${n} años`);

export default function ConsultaMatricula() {
  const [texto, setTexto] = useState("");
  const [combustible, setCombustible] = useState<Combustible | "">("");
  const [lectura, setLectura] = useState<Lectura | null>(null);

  function consultar(e: React.FormEvent) {
    e.preventDefault();
    const l = leerMatricula(texto);
    setLectura(l);
    // Qué años consulta la gente (solo la primera letra, nunca la matrícula)
    const f = l.tipo === "actual" ? l.desde : l.tipo === "provincial" ? FIN_PROVINCIAL : null;
    medir(
      ["matricula", l.tipo === "actual" ? l.texto.slice(5, 6) : l.tipo],
      ...(f && combustible ? [["etiqueta", etiqueta(combustible, f)] as [string, string]] : [])
    );
  }

  const fecha =
    lectura?.tipo === "actual"
      ? lectura.desde
      : lectura?.tipo === "provincial"
        ? FIN_PROVINCIAL
        : null;
  const et = fecha && combustible ? etiqueta(combustible, fecha) : null;

  return (
    <div className={styles.caja}>
      <form className={styles.form} onSubmit={consultar}>
        <label className={styles.campo}>
          <span className={styles.etiquetaCampo}>Matrícula</span>
          <span className={styles.placa}>
            <span className={styles.placaE} aria-hidden="true">E</span>
            <input
              className={styles.placaInput}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="1234 BCD"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              required
            />
          </span>
        </label>

        <label className={styles.campo}>
          <span className={styles.etiquetaCampo}>Combustible (para la etiqueta)</span>
          <select
            className={styles.select}
            value={combustible}
            onChange={(e) => setCombustible(e.target.value as Combustible | "")}
          >
            <option value="">Elige uno</option>
            {COMBUSTIBLES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className={`${base.btn} ${base.btnP}`}>
          Consultar
        </button>
      </form>

      <div aria-live="polite">
        {lectura?.tipo === "invalida" && (
          <div className={`${base.aviso} ${base.avisoN} ${styles.resultado}`} role="alert">
            <div>
              <p className={base.avisoT}>Matrícula no válida</p>
              <p className={base.avisoX}>{lectura.motivo}</p>
            </div>
          </div>
        )}

        {fecha && lectura && lectura.tipo !== "invalida" && (
          <div className={styles.resultado}>
            <div className={styles.dato}>
              <span className={styles.datoEt}>Fecha de matriculación aproximada</span>
              {lectura.tipo === "actual" ? (
                <>
                  <strong className={styles.datoV}>
                    {lectura.posterior
                      ? `${nombreMes(ULTIMO_MES)} o después`
                      : nombreMes(lectura.desde)}
                  </strong>
                  <span className={styles.datoX}>
                    {lectura.texto} · unos {anios(antiguedad(lectura.desde))} de
                    antigüedad
                    {lectura.posterior &&
                      ". Es una matrícula muy reciente o que todavía no se ha asignado."}
                  </span>
                </>
              ) : (
                <>
                  <strong className={styles.datoV}>Antes de septiembre de 2000</strong>
                  <span className={styles.datoX}>
                    {lectura.texto} · matrícula provincial de {lectura.provincia}, con
                    más de {anios(antiguedad(FIN_PROVINCIAL))}
                  </span>
                </>
              )}
            </div>

            <div className={styles.dato}>
              <span className={styles.datoEt}>Etiqueta ambiental probable</span>
              {et ? (
                <div className={styles.etiqueta}>
                  <span className={`${styles.disco} ${styles[`disco${et}`]}`} aria-hidden="true">
                    {et === "SIN" ? "–" : et}
                  </span>
                  <div>
                    <strong className={styles.datoV}>{ETIQUETAS[et].nombre}</strong>
                    <span className={styles.datoX}>{ETIQUETAS[et].texto}</span>
                  </div>
                </div>
              ) : (
                <span className={styles.datoX}>
                  Elige el combustible para calcularla.
                </span>
              )}
            </div>

            <p className={styles.letraPeq}>
              Es una estimación a partir de la fecha. La etiqueta real depende de la
              norma Euro de tu coche y puede ser mejor.{" "}
              <a href={DGT_DISTINTIVO} target="_blank" rel="noopener noreferrer">
                Compruébala gratis en la DGT
              </a>
              .
            </p>
            <Afiliados titulo="¿Vas a comprar este coche?" />
          </div>
        )}
      </div>
    </div>
  );
}
