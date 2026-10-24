import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "./comparar.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Afiliados from "../components/Afiliados";
import { eur } from "../lib/formato";
import { leerFicha, listaFallos, listarModelos, urlFicha, type Ficha } from "../lib/fichas";
import { metadatos } from "../lib/seo";

type Props = { searchParams: Promise<{ a?: string; b?: string }> };

// Lee la ficha de un slug ("seat/leon"), siguiendo los alias
async function ficha(slug?: string): Promise<Ficha | null> {
  if (!slug) return null;
  const f = await leerFicha(slug);
  if (!f) return null;
  return "alias" in f ? ficha(f.alias) : f;
}

const nombre = (f: Ficha) => `${f.marca} ${f.modelo}`;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await searchParams;
  const [fa, fb] = await Promise.all([ficha(a), ficha(b)]);
  if (fa && fb) {
    // Cada combinación es una página distinta: se puede compartir, pero no se indexa
    return metadatos({
      titulo: `${nombre(fa)} o ${nombre(fb)}: comparativa`,
      descripcion: `Comparativa de ${nombre(fa)} y ${nombre(fb)}: precio de segunda mano, motores, etiqueta, puntos fuertes y débiles.`,
      ruta: `/comparar?a=${fa.slug}&b=${fb.slug}`,
      indexar: false,
    });
  }
  return metadatos({
    titulo: "Comparar coches de segunda mano",
    descripcion:
      "Compara dos coches lado a lado: precio de segunda mano en España, motores, etiqueta ambiental, puntos fuertes y débiles.",
    ruta: "/comparar",
  });
}

const rango = (f: Ficha) =>
  f.precioSegundaManoEur.max > 0
    ? `${eur(f.precioSegundaManoEur.min)} a ${eur(f.precioSegundaManoEur.max)}`
    : "—";

const potencias = (f: Ficha) => {
  const cv = f.motores
    .map((m) => parseInt(m.potenciaCv, 10))
    .filter((n) => n > 0)
    .sort((x, y) => x - y);
  if (!cv.length) return "—";
  return cv[0] === cv.at(-1) ? `${cv[0]} CV` : `${cv[0]} a ${cv.at(-1)} CV`;
};

const FILAS: [string, (f: Ficha) => React.ReactNode][] = [
  ["Segunda mano", rango],
  ["Nuevo", (f) => f.precioNuevoEur || "—"],
  ["Carrocería", (f) => f.carroceria || "—"],
  ["Segmento", (f) => f.segmento || "—"],
  ["Potencias", potencias],
  ["Combustibles", (f) => [...new Set(f.motores.map((m) => m.combustible))].join(", ") || "—"],
  ["Etiqueta DGT", (f) => f.etiquetaDgt || "—"],
  ["Generación actual", (f) => (f.generaciones[0] ? `${f.generaciones[0].nombre} (${f.generaciones[0].anios})` : "—")],
];

function Lista({ items }: { items: string[] }) {
  return items.length ? (
    <ul className={styles.lista}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  ) : (
    <>—</>
  );
}

export default async function Comparar({ searchParams }: Props) {
  const { a, b } = await searchParams;
  const [modelos, fa, fb] = await Promise.all([listarModelos(), ficha(a), ficha(b)]);
  const ordenados = [...modelos].sort((x, y) =>
    `${x.marca} ${x.modelo}`.localeCompare(`${y.marca} ${y.modelo}`, "es")
  );

  const selector = (campo: "a" | "b", actual?: string) => (
    <label className={styles.campo}>
      <span className={styles.etiqueta}>{campo === "a" ? "Primer coche" : "Segundo coche"}</span>
      <select name={campo} defaultValue={actual ?? ""} required className={styles.select}>
        <option value="" disabled>
          Elige un modelo
        </option>
        {ordenados.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.marca} {m.modelo}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Comparador
          </span>
          <h1 className={base.h1}>
            {fa && fb ? `${nombre(fa)} o ${nombre(fb)}` : "Compara dos coches"}
          </h1>
          <p className={base.sub}>
            Precio de segunda mano, motores, etiqueta y puntos fuertes y débiles, lado a
            lado.
          </p>

          {modelos.length < 2 ? (
            <p className={styles.vacio}>
              Todavía no hay suficientes fichas para comparar.{" "}
              <Link href="/" className={base.notaLink}>
                Identifica un coche con una foto
              </Link>{" "}
              y aparecerá aquí.
            </p>
          ) : (
            // Formulario normal (GET): funciona sin JavaScript y la URL se puede compartir
            <form action="/comparar" className={styles.form}>
              {selector("a", fa?.slug)}
              {selector("b", fb?.slug)}
              <button type="submit" className={`${base.btn} ${base.btnP}`}>
                Comparar
              </button>
            </form>
          )}

          <p className={styles.crece}>
            <strong>
              {modelos.length === 1 ? "1 modelo disponible" : `${modelos.length} modelos disponibles`}{" "}
              y creciendo.
            </strong>{" "}
            Cada vez que alguien identifica con una foto un coche que aún no estaba, se
            crea su ficha y se añade al comparador.{" "}
            <Link href="/" className={base.notaLink}>
              ¿Falta el tuyo? Haz una foto
            </Link>
          </p>
        </div>
      </section>

      {fa && fb && (
        <div className={`${base.cont} ${styles.resultado}`}>
          <div className={styles.tablaCaja}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <td />
                  {[fa, fb].map((f) => (
                    <th key={f.slug} scope="col">
                      <Link href={urlFicha(f.slug)}>{nombre(f)}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FILAS.map(([et, valor]) => (
                  <tr key={et}>
                    <th scope="row">{et}</th>
                    <td>{valor(fa)}</td>
                    <td>{valor(fb)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">Puntos fuertes</th>
                  <td><Lista items={fa.puntosFuertes} /></td>
                  <td><Lista items={fb.puntosFuertes} /></td>
                </tr>
                <tr>
                  <th scope="row">Puntos débiles</th>
                  <td><Lista items={fa.puntosDebiles} /></td>
                  <td><Lista items={fb.puntosDebiles} /></td>
                </tr>
                <tr>
                  <th scope="row">Fallos comunes</th>
                  <td><Lista items={listaFallos(fa).map((x) => x.titulo)} /></td>
                  <td><Lista items={listaFallos(fb).map((x) => x.titulo)} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className={styles.nota}>
            Datos orientativos elaborados con inteligencia artificial. Consulta la ficha
            completa de{" "}
            <Link href={urlFicha(fa.slug)} className={base.notaLink}>
              {nombre(fa)}
            </Link>{" "}
            y de{" "}
            <Link href={urlFicha(fb.slug)} className={base.notaLink}>
              {nombre(fb)}
            </Link>
            .
          </p>
          <Afiliados titulo="¿Ya te has decidido?" />
        </div>
      )}
    </MarcoPagina>
  );
}
