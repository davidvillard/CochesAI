import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import base from "../../page.module.css";
import styles from "../../components/Ventas.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import TablaRanking from "../../components/TablaRanking";
import { Barras } from "../../components/GraficasVentas";
import FuenteDgt from "../../components/FuenteDgt";
import { listarModelos } from "../../lib/fichas";
import { SITE_URL, metadatos } from "../../lib/seo";
import {
  COMBUSTIBLE_ESPANA,
  HASTA,
  LISTA_PROVINCIAS,
  PERIODO,
  TOTAL,
  fichasPorClave,
  modelo,
  pct,
  provinciaPorSlug,
  repartoCombustible,
  unidades,
} from "../../lib/ventas";

type Props = { params: Promise<{ provincia: string }> };

// Lee las fichas de Redis para enlazar los modelos que la tienen
export const dynamic = "force-dynamic";

const anio = HASTA.slice(-4);

async function datos(params: Props["params"]) {
  const p = provinciaPorSlug((await params).provincia);
  if (!p || !p.ranking.length) notFound();
  return p;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await datos(params);
  const primero = modelo(p.ranking[0][0])?.nombre;
  return metadatos({
    titulo: `Coches más vendidos en ${p.nombre} ${anio}`,
    descripcion: `Ranking de los coches nuevos más vendidos en ${p.nombre} ${PERIODO}, elaborado con los datos abiertos de matriculaciones de la DGT. El nº 1 es el ${primero}. Además, qué porcentaje son híbridos, eléctricos o diésel.`,
    ruta: `/mas-vendidos/${p.slug}`,
  });
}

export default async function MasVendidosProvincia({ params }: Props) {
  const p = await datos(params);
  const fichas = fichasPorClave((await listarModelos()).map((m) => m.slug));
  const electrificados = (c: Record<string, number>) => (c.electrico ?? 0) + (c.enchufable ?? 0) + (c.hibrido ?? 0);
  const primero = modelo(p.ranking[0][0]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Más vendidos", item: `${SITE_URL}/mas-vendidos` },
      { "@type": "ListItem", position: 2, name: p.nombre, item: `${SITE_URL}/mas-vendidos/${p.slug}` },
    ],
  };

  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Con datos abiertos de la DGT
          </span>
          <h1 className={base.h1}>Coches más vendidos en {p.nombre}</h1>
          <p className={base.sub}>
            Turismos nuevos matriculados en {p.nombre} {PERIODO}. El más vendido es el {primero?.nombre}.
          </p>
        </div>
      </section>

      <section className={base.sec} style={{ paddingTop: 0 }}>
        <div className={base.cont}>
          <div className={styles.cifras}>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{unidades(p.total)}</p>
              <p className={styles.cifraEt}>turismos matriculados en 12 meses</p>
            </div>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{pct(electrificados(p.combustible), p.total)}</p>
              <p className={styles.cifraEt}>
                híbridos o eléctricos (España: {pct(electrificados(COMBUSTIBLE_ESPANA), TOTAL)})
              </p>
            </div>
            <div className={styles.cifra}>
              <p className={styles.cifraN}>{pct(p.combustible.diesel ?? 0, p.total)}</p>
              <p className={styles.cifraEt}>diésel (España: {pct(COMBUSTIBLE_ESPANA.diesel ?? 0, TOTAL)})</p>
            </div>
          </div>

          <div className={styles.dos}>
            <div>
              <h2 className={styles.h2}>Ranking en {p.nombre}</h2>
              <p className={styles.intro}>Coches nuevos según el domicilio del vehículo.</p>
              <TablaRanking filas={p.ranking} fichas={fichas} columna="Unidades" />
            </div>
            <div>
              <h2 className={styles.h2}>Por combustible</h2>
              <p className={styles.intro}>Todos los turismos matriculados en la provincia.</p>
              <Barras filas={repartoCombustible(p.combustible)} total={p.total} />
            </div>
          </div>

          <div className={styles.bloque}>
            <h2 className={styles.h2}>Otras provincias</h2>
            <ul className={styles.provincias}>
              <li>
                <Link href="/mas-vendidos">Toda España</Link>
              </li>
              {LISTA_PROVINCIAS.filter((x) => x.codigo !== p.codigo).map((x) => (
                <li key={x.codigo}>
                  <Link href={`/mas-vendidos/${x.slug}`}>{x.nombre}</Link>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.fuente}>
            Los coches de empresas de alquiler y renting cuentan en la provincia donde están domiciliados, por eso
            Madrid suele salir muy alta. <FuenteDgt datos="ventas" />{" "}
            <Link href="/metodologia">Cómo elaboramos estos datos</Link>.
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
