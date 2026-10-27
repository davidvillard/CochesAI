import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../calculadora-itp/itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Predictor from "./Predictor";
import {
  FECHA_ULTIMA_OFICIAL,
  FUENTE_DGT,
  PRIMERA_DEL_ANIO,
  RITMO_DIARIO,
  estimarMatricula,
  nombreMes,
} from "../lib/matricula";
import { metadatos } from "../lib/seo";

// Se vuelve a calcular cada hora para que "hoy" esté al día (no lee ninguna base de datos)
export const revalidate = 3600;

const fechaLarga = (d: Date) =>
  d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

export function generateMetadata(): Metadata {
  const hoy = estimarMatricula(new Date());
  return metadatos({
    titulo: `Última matrícula de España hoy (${hoy?.slice(5) ?? ""})`,
    descripcion: `La última matrícula asignada en España hoy es aproximadamente la ${hoy}. Se matriculan unos ${Math.round(RITMO_DIARIO / 100) * 100} vehículos al día. Calcula también qué matrícula le tocará a un coche nuevo.`,
    ruta: "/ultima-matricula",
  });
}

export default function UltimaMatricula() {
  const ahora = new Date();
  const hoy = estimarMatricula(ahora);
  const anioActual = PRIMERA_DEL_ANIO[PRIMERA_DEL_ANIO.length - 1];

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> {fechaLarga(ahora)}
          </span>
          <h1 className={base.h1}>Última matrícula de España hoy</h1>
          <p className={base.sub}>
            Estimación de la matrícula que se está asignando ahora mismo, a partir de los
            datos oficiales de la DGT.
          </p>

          <div className={styles.caja}>
            <div className={styles.resultado} style={{ marginTop: 0 }}>
              <p className={styles.resEt}>Matrícula aproximada de hoy</p>
              <p className={styles.resN}>{hoy}</p>
              <ul className={styles.detalle}>
                <li>
                  Se matriculan unos {Math.round(RITMO_DIARIO / 100) * 100} vehículos al día
                  (media de los últimos 3 meses).
                </li>
                <li>
                  Último dato oficial: {fechaLarga(FECHA_ULTIMA_OFICIAL)}, de los{" "}
                  <a href={FUENTE_DGT} target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>
                    microdatos de matriculaciones de la DGT
                  </a>
                  . Desde entonces es una estimación con un margen de unos días.
                </li>
                <li>
                  En {anioActual.anio} la serie empezó por la {anioActual.primera}.{" "}
                  <Link href={`/matricula/${hoy?.slice(5, 6).toLowerCase() ?? ""}`}>
                    Ver las fechas de todas las matrículas que empiezan por {hoy?.slice(5, 6)}
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Para un coche nuevo o una fecha concreta</span>
          <h2 className={base.secTit}>¿Qué matrícula le toca a mi coche?</h2>
          <p className={base.secSub}>
            Elige el día en que se matricula (o se matriculó) y te decimos la matrícula
            aproximada que le corresponde.
          </p>
          <Predictor />
          <p className={styles.nota} style={{ textAlign: "center" }}>
            ¿Tienes ya la matrícula y quieres saber su año y su etiqueta?{" "}
            <Link href="/matricula" className={base.notaLink}>
              Consúltalo aquí
            </Link>
            . Fechas aproximadas desde {nombreMes(PRIMERA_DEL_ANIO[0])}.
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
