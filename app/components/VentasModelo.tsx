import Link from "next/link";
import styles from "./Ventas.module.css";
import { Barras, PorMes } from "./GraficasVentas";
import FuenteDgt from "./FuenteDgt";
import {
  PERIODO,
  pct,
  provinciaPorCodigo,
  repartoCombustible,
  unidades,
  ventasDeFicha,
} from "../lib/ventas";

// Bloque de la ficha con las matriculaciones reales en España (datos de la DGT)
export default function VentasModelo({ slug, nombre }: { slug: string; nombre: string }) {
  const v = ventasDeFicha(slug);
  if (!v) return null;

  const provincias = Object.entries(v.provincias).map(([cod, n]) => ({
    cod,
    nombre: provinciaPorCodigo(cod)?.nombre ?? cod,
    slug: provinciaPorCodigo(cod)?.slug,
    unidades: n,
  }));

  return (
    <section className={styles.bloque} aria-labelledby="ventas-titulo">
      <h2 id="ventas-titulo" className={styles.h2}>
        ¿Cuántos {nombre} se venden en España?
      </h2>
      <p className={styles.intro}>
        Turismos de la familia {v.nombre} matriculados {PERIODO}, según nuestro análisis de los datos abiertos de la DGT.
      </p>

      <div className={styles.cifras}>
        <div className={styles.cifra}>
          <p className={styles.cifraN}>{unidades(v.total)}</p>
          <p className={styles.cifraEt}>
            matriculados en 12 meses ({unidades(v.nuevos)} nuevos y {unidades(v.usados)} usados importados)
          </p>
        </div>
        <div className={styles.cifra}>
          <p className={styles.cifraN}>{v.nuevos ? `${v.puesto}º` : "—"}</p>
          <p className={styles.cifraEt}>
            en ventas de coches nuevos (<Link href="/mas-vendidos">ver ranking</Link>)
          </p>
        </div>
        <div className={styles.cifra}>
          <p className={styles.cifraN}>{pct(v.usados, v.total)}</p>
          <p className={styles.cifraEt}>son usados importados</p>
        </div>
      </div>

      <div className={styles.dos}>
        <div>
          <h3 className={styles.subtit}>Por mes</h3>
          <PorMes mensual={v.mensual} nombre={v.nombre} />
        </div>
        <div>
          <h3 className={styles.subtit}>Por combustible</h3>
          <Barras filas={repartoCombustible(v.combustible)} total={v.total} />
        </div>
        {provincias.length > 0 && (
          <div>
            <h3 className={styles.subtit}>Dónde se matriculan más</h3>
            <ul className={styles.barras}>
              {provincias.map((p) => (
                <li key={p.cod} className={styles.barra}>
                  <span>
                    {p.slug ? <Link href={`/mas-vendidos/${p.slug}`}>{p.nombre}</Link> : p.nombre}
                  </span>
                  <span className={styles.barraV}>{unidades(p.unidades)}</span>
                  <span className={styles.pista}>
                    <span style={{ width: `${(p.unidades / provincias[0].unidades) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className={styles.fuente}>
        Incluye todas las versiones y carrocerías del modelo, nuevos y usados importados.{" "}
        <FuenteDgt datos="ventas" />
      </p>
    </section>
  );
}
