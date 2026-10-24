import type { Metadata } from "next";
import Link from "next/link";
import base from "../../page.module.css";
import styles from "../matricula.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import ConsultaMatricula from "../ConsultaMatricula";
import { CODIGOS_PROVINCIALES, LETRAS_USADAS } from "../../lib/matricula";
import { metadatos } from "../../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Matrículas provinciales: tabla de códigos por provincia",
  descripcion:
    "Tabla de las letras de cada provincia en las matrículas antiguas (antes de septiembre de 2000): M de Madrid, B de Barcelona, PO de Pontevedra… y cómo saber de qué año es un coche.",
  ruta: "/matricula/provinciales",
});

export default function MatriculasProvinciales() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Antes de septiembre de 2000
          </span>
          <h1 className={base.h1}>Matrículas provinciales</h1>
          <p className={base.sub}>
            Hasta septiembre de 2000 las matrículas llevaban las letras de la provincia
            (por ejemplo M-1234-AB, de Madrid). Desde entonces son nacionales: 4 números y
            3 letras.
          </p>
          <ConsultaMatricula />
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Tabla de códigos</span>
          <h2 className={base.secTit}>Letras de cada provincia</h2>
          <p className={base.secSub}>
            Algunas provincias cambiaron de código: Girona pasó de GE a GI, Ourense de OR a
            OU e Illes Balears de PM a IB.
          </p>
          <div className={styles.tablaCaja}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Provincia</th>
                  <th scope="col">Código</th>
                </tr>
              </thead>
              <tbody>
                {CODIGOS_PROVINCIALES.map(([codigo, provincia]) => (
                  <tr key={codigo}>
                    <td>{provincia}</td>
                    <td>{codigo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.otras}>
            En las provinciales, las letras finales avanzaban por separado en cada
            provincia, así que no sirven para calcular el año con precisión: solo sabemos
            que el coche es anterior a septiembre de 2000.
          </p>
          <p className={styles.otras}>
            Matrículas actuales por letra:{" "}
            {LETRAS_USADAS.map((l, i) => (
              <span key={l}>
                {i > 0 && " · "}
                <Link href={`/matricula/${l.toLowerCase()}`}>{l}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
