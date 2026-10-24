"use client";

import { useMemo, useState } from "react";
import styles from "./itp.module.css";
import Afiliados from "../components/Afiliados";
import { eur, eurExacto } from "../lib/formato";
import { COMUNIDADES, TASA_TRANSFERENCIA, calcularItp, type Distintivo } from "../lib/itp";

const BOE_TABLAS = "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-26357";

// Años completos entre un mes "AAAA-MM" y hoy
function aniosDesde(mes: string) {
  const [a, m] = mes.split("-").map(Number);
  if (!a || !m) return null;
  const hoy = new Date();
  const meses = (hoy.getFullYear() - a) * 12 + (hoy.getMonth() + 1 - m);
  return meses < 0 ? null : Math.floor(meses / 12);
}

const num = (v: string) => Math.max(0, Number(v.replace(",", ".")) || 0);

// comunidadInicial: en las páginas de cada comunidad ya viene elegida.
// transferencia: calcula el coste total del cambio de nombre (ITP + tasa DGT + gestoría)
export default function CalculadoraItp({
  comunidadInicial = "",
  transferencia = false,
}: {
  comunidadInicial?: string;
  transferencia?: boolean;
}) {
  const [comunidad, setComunidad] = useState(comunidadInicial);
  const [ciclomotor, setCiclomotor] = useState(false);
  const [gestoria, setGestoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [matriculacion, setMatriculacion] = useState("");
  const [valorNuevo, setValorNuevo] = useState("");
  const [cc, setCc] = useState("");
  const [cv, setCv] = useState("");
  const [distintivo, setDistintivo] = useState<Distintivo>("normal");

  const anios = aniosDesde(matriculacion);
  const tasa = ciclomotor ? TASA_TRANSFERENCIA.ciclomotor : TASA_TRANSFERENCIA.general;
  const resultado = useMemo(
    () =>
      comunidad && precio && anios !== null
        ? calcularItp({
            comunidad,
            precio: num(precio),
            valorNuevo: num(valorNuevo) || undefined,
            anios,
            cc: num(cc),
            cvFiscales: num(cv),
            distintivo,
          })
        : null,
    [comunidad, precio, valorNuevo, anios, cc, cv, distintivo]
  );

  return (
    <div className={styles.caja}>
      <div className={styles.form}>
        <label className={styles.campo}>
          <span className={styles.et}>Comunidad del comprador</span>
          <select className={styles.input} value={comunidad} onChange={(e) => setComunidad(e.target.value)}>
            <option value="">Elige una</option>
            {COMUNIDADES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.campo}>
          <span className={styles.et}>Precio de compra (€)</span>
          <input className={styles.input} inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="8000" />
        </label>

        <label className={styles.campo}>
          <span className={styles.et}>Primera matriculación</span>
          <input className={styles.input} type="month" value={matriculacion} onChange={(e) => setMatriculacion(e.target.value)} />
        </label>

        <label className={styles.campo}>
          <span className={styles.et}>Cilindrada (cc)</span>
          <input className={styles.input} inputMode="numeric" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="1598" />
        </label>

        <label className={styles.campo}>
          <span className={styles.et}>Potencia fiscal (CV fiscales)</span>
          <input className={styles.input} inputMode="decimal" value={cv} onChange={(e) => setCv(e.target.value)} placeholder="11,5" />
        </label>

        <label className={styles.campo}>
          <span className={styles.et}>Etiqueta ambiental</span>
          <select className={styles.input} value={distintivo} onChange={(e) => setDistintivo(e.target.value as Distintivo)}>
            <option value="normal">B, C o sin etiqueta</option>
            <option value="eco">ECO</option>
            <option value="cero">0 emisiones</option>
          </select>
        </label>

        {transferencia && (
          <>
            <label className={styles.campo}>
              <span className={styles.et}>Tipo de vehículo</span>
              <select
                className={styles.input}
                value={ciclomotor ? "ciclomotor" : "general"}
                onChange={(e) => setCiclomotor(e.target.value === "ciclomotor")}
              >
                <option value="general">Coche, furgoneta o moto</option>
                <option value="ciclomotor">Ciclomotor (hasta 50 cc)</option>
              </select>
            </label>
            <label className={styles.campo}>
              <span className={styles.et}>Gestoría (€, opcional)</span>
              <input className={styles.input} inputMode="decimal" value={gestoria} onChange={(e) => setGestoria(e.target.value)} placeholder="0 si lo haces tú" />
            </label>
          </>
        )}

        <label className={`${styles.campo} ${styles.ancho}`}>
          <span className={styles.et}>
            Valor de nuevo según Hacienda (€, opcional){" "}
            <a href={BOE_TABLAS} target="_blank" rel="noopener noreferrer">
              ver tablas
            </a>
          </span>
          <input className={styles.input} inputMode="decimal" value={valorNuevo} onChange={(e) => setValorNuevo(e.target.value)} placeholder="Precio medio de tu modelo en las tablas del BOE" />
        </label>
      </div>

      <div aria-live="polite">
        {matriculacion && anios === null && (
          <p className={styles.nota}>La fecha de matriculación no puede ser futura.</p>
        )}
        {resultado && transferencia && (
          <div className={styles.resultado}>
            <p className={styles.resEt}>Coste total aproximado del cambio de nombre</p>
            <p className={styles.resN}>{eurExacto(resultado.cuota + tasa + num(gestoria))}</p>
            <ul className={styles.detalle}>
              <li>
                ITP: <strong>{eurExacto(resultado.cuota)}</strong>. {resultado.explicacion}
              </li>
              <li>
                Tasa de la DGT por el cambio de titularidad: <strong>{eurExacto(tasa)}</strong>.
              </li>
              {num(gestoria) > 0 && (
                <li>
                  Gestoría: <strong>{eurExacto(num(gestoria))}</strong>.
                </li>
              )}
              <li>
                Lo paga normalmente el comprador, salvo que pactéis otra cosa en el contrato.
              </li>
              <li>Plazo del ITP: {resultado.plazo} desde la compra.</li>
            </ul>
            <p className={styles.nota}>
              Cálculo orientativo con los tipos y la tasa de 2026. Confírmalo en tu
              hacienda autonómica y en la DGT antes de pagar.
            </p>
          </div>
        )}
        {resultado && !transferencia && (
          <div className={styles.resultado}>
            <p className={styles.resEt}>ITP aproximado</p>
            <p className={styles.resN}>{eur(resultado.cuota)}</p>
            <p className={styles.resX}>{resultado.explicacion}</p>
            <ul className={styles.detalle}>
              <li>
                Base imponible: <strong>{eur(resultado.base)}</strong>
                {resultado.valorTablas !== undefined
                  ? ` (el mayor entre el precio y el valor de tablas, ${eur(resultado.valorTablas)})`
                  : " (el precio de compra; añade el valor de Hacienda para afinar)"}
              </li>
              <li>Antigüedad: {anios} {anios === 1 ? "año" : "años"}</li>
              <li>Plazo para pagarlo: {resultado.plazo} desde la compra (modelo 620 o el de tu comunidad).</li>
            </ul>
            <p className={styles.nota}>
              Cálculo orientativo con los tipos de 2026. Confírmalo en la hacienda de tu
              comunidad antes de pagar.
            </p>
          </div>
        )}
      </div>

      {resultado && <Afiliados titulo="¿Ya tienes el coche elegido?" />}
    </div>
  );
}
