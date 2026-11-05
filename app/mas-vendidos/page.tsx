import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../components/Ventas.module.css";
import MarcoPagina from "../components/MarcoPagina";
import TablaRanking from "../components/TablaRanking";
import { Barras } from "../components/GraficasVentas";
import { listarModelos } from "../lib/fichas";
import { SITE_URL, metadatos } from "../lib/seo";
import { fechaLarga } from "../lib/formato";
import {
  ACTUALIZADO,
  COMBUSTIBLE_ESPANA,
  FUENTE_DGT,
  HASTA,
  LISTA_PROVINCIAS,
  MARCAS,
  PERIODO,
  PERIODO_ISO,
  RANKING,
  RANKING_IMPORTADOS,
  RANKING_ULTIMO_MES,
  TOTAL,
  fichasPorClave,
  modelo,
  pct,
  repartoCombustible,
  unidades,
} from "../lib/ventas";

// Lee las fichas de Redis para enlazar los modelos que la tienen
export const dynamic = "force-dynamic";

const primero = modelo(RANKING[0]);
const anio = HASTA.slice(-4);

export const metadata: Metadata = metadatos({
  titulo: `Coches más vendidos en España ${anio}: ranking DGT`,
  descripcion: `Los 50 coches más vendidos en España ${PERIODO} según los datos oficiales de la DGT. El nº 1 es el ${primero?.nombre}. Ranking por provincia, por combustible y de usados importados.`,
  ruta: "/mas-vendidos",
});

export default async function MasVendidos() {
  const fichas = fichasPorClave((await listarModelos()).map((m) => m.slug));
  const electrificados =
    (COMBUSTIBLE_ESPANA.electrico ?? 0) + (COMBUSTIBLE_ESPANA.enchufable ?? 0) + (COMBUSTIBLE_ESPANA.hibrido ?? 0);
  const totalMarcas = Object.values(MARCAS).reduce((a, b) => a + b, 0);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Coches más vendidos en España (${PERIODO})`,
      itemListElement: RANKING.slice(0, 10).map((k, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: modelo(k)?.nombre,
        ...(fichas.get(k) ? { url: `${SITE_URL}/coches/${fichas.get(k)}` } : {}),
      })),
    },
    // Los datos como conjunto de datos: así buscadores e IAs los reconocen como fuente
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Turismos matriculados en España por modelo, provincia y combustible",
      description: `Turismos y todoterrenos matriculados en España ${PERIODO}, agrupados por modelo, provincia, combustible y marca, a partir de los microdatos oficiales de la DGT. Incluye coches nuevos y usados importados. Se actualiza cada mes.`,
      url: `${SITE_URL}/mas-vendidos`,
      isBasedOn: FUENTE_DGT,
      creator: { "@id": `${SITE_URL}/#organizacion` },
      temporalCoverage: PERIODO_ISO,
      spatialCoverage: { "@type": "Place", name: "España" },
      dateModified: ACTUALIZADO,
      inLanguage: "es-ES",
      variableMeasured: ["Unidades matriculadas", "Combustible", "Provincia", "Marca", "Nuevo o usado importado"],
      keywords: ["coches más vendidos", "matriculaciones", "DGT", "ventas de coches en España"],
    },
  ];

  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Datos oficiales de la DGT
          </span>
          <h1 className={base.h1}>Coches más vendidos en España</h1>
          <p className={base.sub}>
            Ranking de turismos nuevos matriculados {PERIODO}. El más vendido es el {primero?.nombre}, con{" "}
            {unidades(primero?.nuevos ?? 0)} unidades.
          </p>
        </div>
      </section>

      <section className={base.sec} style={{ paddingTop: 0 }}>
        <div className={base.cont}>
          <div className={styles.cifras}>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{unidades(TOTAL)}</p>
              <p className={styles.cifraEt}>turismos matriculados en 12 meses</p>
            </div>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{pct(electrificados, TOTAL)}</p>
              <p className={styles.cifraEt}>son híbridos o eléctricos</p>
            </div>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{pct(COMBUSTIBLE_ESPANA.diesel ?? 0, TOTAL)}</p>
              <p className={styles.cifraEt}>son diésel</p>
            </div>
          </div>

          <div className={styles.bloque}>
            <h2 className={styles.h2}>Los 50 coches nuevos más vendidos</h2>
            <p className={styles.intro}>Unidades nuevas matriculadas {PERIODO}. Pulsa un modelo para ver su ficha.</p>
            <TablaRanking filas={RANKING.map((k) => [k, modelo(k).nuevos])} fichas={fichas} columna="Unidades" />
          </div>

          <div className={styles.dos} style={{ marginTop: 40 }}>
            <div>
              <h2 className={styles.h2}>Más vendidos en {HASTA}</h2>
              <p className={styles.intro}>Solo el último mes publicado.</p>
              <TablaRanking filas={RANKING_ULTIMO_MES.slice(0, 20)} fichas={fichas} columna="Unidades" />
            </div>
            <div>
              <h2 className={styles.h2}>Usados que más se importan</h2>
              <p className={styles.intro}>
                Coches de segunda mano traídos de otros países y matriculados en España por primera vez.
              </p>
              <TablaRanking
                filas={RANKING_IMPORTADOS.slice(0, 20).map((k) => [k, modelo(k).usados])}
                fichas={fichas}
                columna="Unidades"
              />
            </div>
          </div>

          <div className={styles.dos} style={{ marginTop: 40 }}>
            <div>
              <h2 className={styles.h2}>Por combustible</h2>
              <p className={styles.intro}>Todos los turismos matriculados, nuevos y usados importados.</p>
              <Barras filas={repartoCombustible(COMBUSTIBLE_ESPANA)} total={TOTAL} />
            </div>
            <div>
              <h2 className={styles.h2}>Marcas más vendidas</h2>
              <p className={styles.intro}>Cuota entre las 30 marcas con más coches nuevos.</p>
              <Barras
                filas={Object.entries(MARCAS)
                  .slice(0, 15)
                  .map(([nombre, n]) => ({ nombre, unidades: n }))}
                total={totalMarcas}
              />
            </div>
          </div>

          <div className={styles.bloque}>
            <h2 className={styles.h2}>Coches más vendidos por provincia</h2>
            <ul className={styles.provincias}>
              {LISTA_PROVINCIAS.map((p) => (
                <li key={p.codigo}>
                  <Link href={`/mas-vendidos/${p.slug}`}>{p.nombre}</Link>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.fuente}>
            Fuente:{" "}
            <a href={FUENTE_DGT} target="_blank" rel="noopener noreferrer">
              microdatos de matriculaciones de la DGT
            </a>{" "}
            (turismos y todoterrenos, matriculación ordinaria). Cada modelo agrupa todas sus versiones. Se
            actualiza cada mes; última actualización: {fechaLarga(ACTUALIZADO)}.{" "}
            <Link href="/metodologia">Cómo elaboramos estos datos</Link>.
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
