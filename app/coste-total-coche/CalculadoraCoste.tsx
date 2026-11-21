"use client";

import { useMemo, useState } from "react";
import base from "../calculadora-itp/itp.module.css";
import styles from "./coste.module.css";
import { eur } from "../lib/formato";
import { tramo } from "../lib/medir";
import { useMedirResultado } from "../lib/useMedirResultado";
import {
  POR_TIPO,
  TIPOS,
  USO_INICIAL,
  cocheInicial,
  cruce,
  desglose,
  usaKwh,
  usaLitros,
  type Coche,
  type Tipo,
  type Uso,
} from "../lib/coste-total";

// Los campos se guardan como texto para poder escribir "1,5" o dejarlos vacíos
type Textos<T> = { [K in keyof T]: string };
const aTexto = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v).replace(".", ",")])) as Textos<T>;
const num = (v: string) => Math.max(0, Number(v.replace(/\./g, "").replace(",", ".")) || 0);
const decimal = (v: string) => Math.max(0, Number(v.replace(",", ".")) || 0);

type CocheTexto = Omit<Textos<Coche>, "tipo"> & { tipo: Tipo; nombre: string };

const nuevo = (tipo: Tipo, precio: number, nombre: string): CocheTexto => ({
  ...aTexto(cocheInicial(tipo, precio)),
  tipo,
  nombre,
});

const leerCoche = (c: CocheTexto): Coche => ({
  tipo: c.tipo,
  precio: num(c.precio),
  ayudas: num(c.ayudas),
  litros: decimal(c.litros),
  kwh: decimal(c.kwh),
  seguro: num(c.seguro),
  mantenimiento: num(c.mantenimiento),
  impuesto: num(c.impuesto),
  depreciacion: Math.min(decimal(c.depreciacion), 50),
});

const leerUso = (u: Textos<Uso>): Uso => ({
  km: num(u.km),
  anios: Math.min(Math.max(Math.round(num(u.anios)), 1), 20),
  gasolina: decimal(u.gasolina),
  diesel: decimal(u.diesel),
  luzCasa: decimal(u.luzCasa),
  luzFuera: decimal(u.luzFuera),
  enCasa: Math.min(decimal(u.enCasa), 100),
  electricoPhev: Math.min(decimal(u.electricoPhev), 100),
});

const PARTES = [
  { id: "compra", nombre: "Compra menos reventa", clase: styles.p1 },
  { id: "energia", nombre: "Combustible o luz", clase: styles.p2 },
  { id: "seguro", nombre: "Seguro", clase: styles.p3 },
  { id: "mantenimiento", nombre: "Mantenimiento", clase: styles.p4 },
  { id: "impuesto", nombre: "Impuesto de circulación", clase: styles.p5 },
] as const;

const primera = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function plazo(meses: number) {
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const ta = a ? `${a} ${a === 1 ? "año" : "años"}` : "";
  const tm = m ? `${m} ${m === 1 ? "mes" : "meses"}` : "";
  return [ta, tm].filter(Boolean).join(" y ");
}

function Campo({
  et,
  valor,
  cambiar,
  sufijo,
  ayuda,
}: {
  et: string;
  valor: string;
  cambiar: (v: string) => void;
  sufijo: string;
  ayuda?: string;
}) {
  return (
    <label className={base.campo}>
      <span className={base.et}>{et}</span>
      <span className={styles.conSufijo}>
        <input
          className={base.input}
          inputMode="decimal"
          value={valor}
          onChange={(e) => cambiar(e.target.value)}
        />
        <span className={styles.sufijo}>{sufijo}</span>
      </span>
      {ayuda && <span className={styles.ayuda}>{ayuda}</span>}
    </label>
  );
}

function FormCoche({
  letra,
  c,
  poner,
}: {
  letra: string;
  c: CocheTexto;
  poner: (c: CocheTexto) => void;
}) {
  const set = (k: keyof CocheTexto) => (v: string) => poner({ ...c, [k]: v });
  // Al cambiar de tipo se cargan sus consumos y gastos típicos; el precio se queda
  const cambiarTipo = (tipo: Tipo) =>
    poner({ ...nuevo(tipo, num(c.precio), c.nombre), ayudas: c.ayudas, depreciacion: c.depreciacion });

  return (
    <fieldset className={styles.coche}>
      <legend className={styles.leyenda}>Coche {letra}</legend>
      <label className={base.campo}>
        <span className={base.et}>Nombre (opcional)</span>
        <input
          className={base.input}
          value={c.nombre}
          maxLength={40}
          placeholder={letra === "A" ? "Ej.: Corolla híbrido" : "Ej.: MG4"}
          onChange={(e) => poner({ ...c, nombre: e.target.value })}
        />
      </label>
      <label className={base.campo}>
        <span className={base.et}>Motor</span>
        <select
          className={base.input}
          value={c.tipo}
          onChange={(e) => cambiarTipo(e.target.value as Tipo)}
        >
          {TIPOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </label>
      <Campo et="Precio de compra" valor={c.precio} cambiar={set("precio")} sufijo="€" />
      <Campo
        et="Ayudas y descuentos"
        valor={c.ayudas}
        cambiar={set("ayudas")}
        sufijo="€"
        ayuda={c.tipo === "electrico" || c.tipo === "enchufable" ? "Plan Auto+ y ayudas de tu comunidad" : undefined}
      />
      {usaLitros(c.tipo) && (
        <Campo
          et={c.tipo === "enchufable" ? "Gasto con la batería vacía" : "Consumo real"}
          valor={c.litros}
          cambiar={set("litros")}
          sufijo="l/100 km"
        />
      )}
      {usaKwh(c.tipo) && (
        <Campo et="Consumo eléctrico real" valor={c.kwh} cambiar={set("kwh")} sufijo="kWh/100 km" />
      )}
      <details className={styles.mas}>
        <summary>Seguro, mantenimiento y reventa</summary>
        <div className={styles.masCampos}>
          <Campo et="Seguro" valor={c.seguro} cambiar={set("seguro")} sufijo="€/año" />
          <Campo et="Mantenimiento" valor={c.mantenimiento} cambiar={set("mantenimiento")} sufijo="€/año" />
          <Campo
            et="Impuesto de circulación"
            valor={c.impuesto}
            cambiar={set("impuesto")}
            sufijo="€/año"
            ayuda="Depende de tu ayuntamiento"
          />
          <Campo
            et="Pierde de valor"
            valor={c.depreciacion}
            cambiar={set("depreciacion")}
            sufijo="% al año"
          />
        </div>
      </details>
    </fieldset>
  );
}

export default function CalculadoraCoste() {
  const [a, setA] = useState(() => nuevo("hibrido", 27000, ""));
  const [b, setB] = useState(() => nuevo("electrico", 33000, ""));
  const [uso, setUso] = useState(() => aTexto(USO_INICIAL));
  const setU = (k: keyof Uso) => (v: string) => setUso({ ...uso, [k]: v });

  const hayGasolina = [a, b].some((c) => usaLitros(c.tipo) && c.tipo !== "diesel");
  const hayDiesel = [a, b].some((c) => c.tipo === "diesel");
  const hayLuz = [a, b].some((c) => usaKwh(c.tipo));
  const hayPhev = [a, b].some((c) => c.tipo === "enchufable");

  const r = useMemo(() => {
    const u = leerUso(uso);
    const ca = leerCoche(a);
    const cb = leerCoche(b);
    if (!ca.precio || !cb.precio || !u.km) return null;
    const da = desglose(ca, u);
    const db = desglose(cb, u);
    const m = cruce(ca, cb, u);
    // Qué coche cuesta más al principio (el que luego se amortiza)
    const netoA = ca.precio - ca.ayudas;
    const netoB = cb.precio - cb.ayudas;
    const caroAlInicio = netoA > netoB ? "A" : "B";
    return { u, da, db, m, caroAlInicio, difCompra: Math.abs(netoA - netoB) };
  }, [a, b, uso]);

  useMedirResultado(
    r
      ? [
          ["coste", `${a.tipo}-vs-${b.tipo}`],
          ["km-anio", tramo(r.u.km, [8000, 12000, 16000, 20000, 30000], "-km")],
        ]
      : null
  );

  const nombre = (c: CocheTexto, l: string) =>
    c.nombre.trim() || `el ${TIPOS.find((t) => t.id === c.tipo)!.nombre.split(" (")[0].toLowerCase()} (${l})`;

  let titular = "";
  if (r) {
    const dif = r.da.total - r.db.total;
    if (Math.abs(dif) < 300) titular = `En ${r.u.anios} años os salen prácticamente igual.`;
    else {
      const [barato, l] = dif > 0 ? [b, "B"] : [a, "A"];
      titular = `En ${r.u.anios} años, ${nombre(barato, l)} te sale ${eur(Math.abs(dif))} más barato.`;
    }
  }
  const max = r ? Math.max(r.da.total, r.db.total, 1) : 1;
  const caro = r?.caroAlInicio === "A" ? a : b;

  return (
    <div className={`${base.caja} ${styles.caja}`}>
      <div className={styles.coches}>
        <FormCoche letra="A" c={a} poner={setA} />
        <FormCoche letra="B" c={b} poner={setB} />
      </div>

      <fieldset className={styles.uso}>
        <legend className={styles.leyenda}>Tu uso</legend>
        <div className={styles.usoCampos}>
          <Campo et="Kilómetros al año" valor={uso.km} cambiar={setU("km")} sufijo="km" />
          <Campo et="Años que lo tendrás" valor={uso.anios} cambiar={setU("anios")} sufijo="años" />
          {hayGasolina && <Campo et="Gasolina" valor={uso.gasolina} cambiar={setU("gasolina")} sufijo="€/l" />}
          {hayDiesel && <Campo et="Diésel" valor={uso.diesel} cambiar={setU("diesel")} sufijo="€/l" />}
          {hayLuz && (
            <>
              <Campo et="Luz en casa" valor={uso.luzCasa} cambiar={setU("luzCasa")} sufijo="€/kWh" />
              <Campo et="Cargadores públicos" valor={uso.luzFuera} cambiar={setU("luzFuera")} sufijo="€/kWh" />
              <Campo et="Carga hecha en casa" valor={uso.enCasa} cambiar={setU("enCasa")} sufijo="%" />
            </>
          )}
          {hayPhev && (
            <Campo
              et="Km en eléctrico (enchufable)"
              valor={uso.electricoPhev}
              cambiar={setU("electricoPhev")}
              sufijo="%"
              ayuda="Si cargas a diario, 60–80 %; si casi nunca, 10 %"
            />
          )}
        </div>
      </fieldset>

      {r && (
        <div className={styles.resultado} aria-live="polite">
          <p className={styles.titular}>{titular}</p>
          {r.difCompra >= 100 && (
            <p className={styles.cruce}>
              {primera(nombre(caro, r.caroAlInicio))} cuesta {eur(r.difCompra)} más al
              comprarlo.{" "}
              {r.m === null ? (
                "Lo que ahorra al usarlo no llega a compensarlo."
              ) : r.m <= r.u.anios * 12 ? (
                <>
                  Con lo que ahorra al usarlo, lo recupera en <strong>{plazo(r.m)}</strong>.
                </>
              ) : (
                <>
                  Con lo que ahorra al usarlo, lo recuperaría en {plazo(r.m)}: más de los{" "}
                  {r.u.anios} años que lo vas a tener.
                </>
              )}
              {(r.m === null || r.m > r.u.anios * 12) &&
                (r.caroAlInicio === "A" ? r.da.total < r.db.total : r.db.total < r.da.total) &&
                " Aun así sale más barato en total, porque al venderlo te dan más."}
            </p>
          )}

          <div className={styles.cols}>
            {[
              { l: "A", c: a, d: r.da },
              { l: "B", c: b, d: r.db },
            ].map(({ l, c, d }) => (
              <div key={l} className={styles.col}>
                <p className={styles.colNombre}>
                  Coche {l}
                  {c.nombre.trim() && `: ${c.nombre.trim()}`}
                </p>
                <p className={styles.total}>{eur(d.total)}</p>
                <p className={styles.porKm}>
                  {d.porKm.toFixed(2).replace(".", ",")} € por km · {eur(d.total / r.u.anios / 12)} al mes
                </p>
                <div
                  className={styles.barra}
                  style={{ width: `${(d.total / max) * 100}%` }}
                  role="img"
                  aria-label={`Reparto del coste del coche ${l}`}
                >
                  {PARTES.map((p) => {
                    const v = Math.max(d.partes[p.id], 0);
                    return v > 0 ? (
                      <span key={p.id} className={p.clase} style={{ flexGrow: v }} title={`${p.nombre}: ${eur(v)}`} />
                    ) : null;
                  })}
                </div>
                <ul className={styles.lista}>
                  {PARTES.map((p) => (
                    <li key={p.id}>
                      <span className={`${styles.punto} ${p.clase}`} />
                      <span>{p.nombre}</span>
                      <span className={styles.cifra}>{eur(d.partes[p.id])}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.reventa}>
                  Lo vendes por unos {eur(d.reventa)} al cabo de {r.u.anios} años.
                </p>
              </div>
            ))}
          </div>
          <p className={styles.notaRes}>
            Cálculo orientativo con los datos de arriba. Los consumos por defecto son reales
            de un compacto ({POR_TIPO.hibrido.litros.toString().replace(".", ",")} l/100 km un
            híbrido, {POR_TIPO.electrico.kwh} kWh/100 km un eléctrico), no los homologados.
          </p>
        </div>
      )}
    </div>
  );
}
