import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "./coches.module.css";
import MarcoPagina from "../components/MarcoPagina";
import { metadatos } from "../lib/seo";
import { agruparPorMarca, listarModelos, urlFicha } from "../lib/fichas";

export const metadata: Metadata = metadatos({
  titulo: "Fichas de coches de segunda mano: precios y motores",
  descripcion:
    "Fichas de coches con su precio de segunda mano en España, generaciones, motores, puntos fuertes y débiles, y qué revisar antes de comprar.",
  ruta: "/coches",
});

// Se lee en cada visita: las fichas nuevas aparecen al momento
export const dynamic = "force-dynamic";

export default async function Fichas() {
  const modelos = await listarModelos();
  const populares = modelos.slice(0, 8);

  const marcas = agruparPorMarca(modelos);

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} />{" "}
            {modelos.length === 1 ? "1 ficha" : `${modelos.length} fichas`}
          </span>
          <h1 className={base.h1}>Fichas de coches</h1>
          <p className={base.sub}>
            Precio de segunda mano, generaciones, motores y qué revisar antes de
            comprar. Se crean a partir de los coches que identificáis con fotos.
          </p>
        </div>
      </section>

      <div className={`${base.cont} ${styles.indice}`}>
        {modelos.length === 0 ? (
          <p className={styles.vacio}>
            Todavía no hay fichas.{" "}
            <Link href="/" className={base.notaLink}>
              Identifica un coche con una foto
            </Link>{" "}
            y aparecerá aquí.
          </p>
        ) : (
          <>
            <section className={styles.bloque}>
              <h2 className={styles.h2}>Los más consultados</h2>
              <div className={styles.populares}>
                {populares.map((m) => (
                  <Link key={m.slug} href={urlFicha(m.slug)} className={styles.popular}>
                    <span className={styles.popMarca}>{m.marca}</span>
                    <strong>{m.modelo}</strong>
                  </Link>
                ))}
              </div>
            </section>

            <section className={styles.bloque}>
              <h2 className={styles.h2}>Todas las marcas</h2>
              <div className={styles.marcas}>
                {marcas.map((g) => (
                  <div key={g.slug} className={styles.caja}>
                    <h3 className={styles.h3}>
                      <Link href={`/coches/${g.slug}`} className={styles.marcaLink}>
                        {g.marca}
                      </Link>
                    </h3>
                    <ul className={styles.modelos}>
                      {g.modelos.map((m) => (
                        <li key={m.slug}>
                          <Link href={urlFicha(m.slug)}>{m.modelo}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </MarcoPagina>
  );
}
