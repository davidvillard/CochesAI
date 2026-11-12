import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "./matricula.module.css";
import MarcoPagina from "../components/MarcoPagina";
import { metadatos } from "../lib/seo";
import ConsultaMatricula from "./ConsultaMatricula";
import FuenteDgt from "../components/FuenteDgt";
import { LETRAS_USADAS, PRIMERA_DEL_ANIO, ULTIMO_MES, nombreMes } from "../lib/matricula";

export const metadata: Metadata = metadatos({
  titulo: "¿De qué año es una matrícula? Fecha y etiqueta DGT",
  descripcion:
    "Escribe una matrícula y descubre la fecha de matriculación aproximada del coche y qué etiqueta ambiental de la DGT le corresponde. Gratis.",
  ruta: "/matricula",
});

const PREGUNTAS = [
  {
    p: "¿Cómo se sabe el año de un coche por la matrícula?",
    r: "Desde septiembre de 2000 las matrículas se asignan en orden en toda España: 0000 BBB, 0001 BBB… hasta 9999 ZZZ. Comparando las letras con la primera combinación de cada mes se obtiene la fecha aproximada de matriculación.",
  },
  {
    p: "¿Es exacta la fecha?",
    r: "Es aproximada, con un margen de unas semanas. Además, un coche importado recibe matrícula española al llegar, así que puede ser más antiguo de lo que indica.",
  },
  {
    p: "¿Qué etiqueta ambiental le corresponde?",
    r: "Depende del combustible y de la norma Euro que cumple. Por fecha: gasolina desde 2001 tiene etiqueta B y desde 2006 la C; diésel desde 2006 tiene la B y desde septiembre de 2015 la C. Híbridos y gas tienen ECO, y eléctricos e híbridos enchufables con 40 km de autonomía o más, la 0.",
  },
  {
    p: "¿Dónde consulto la etiqueta oficial?",
    r: "En la sede electrónica de la DGT, gratis y solo con la matrícula. Nuestro cálculo es orientativo: algunos coches cumplían la norma Euro antes de esas fechas y tienen una etiqueta mejor.",
  },
  {
    p: "¿Guardáis la matrícula?",
    r: "No. El cálculo se hace en tu navegador y la matrícula no se envía a ningún servidor.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map(({ p, r }) => ({
    "@type": "Question",
    name: p,
    acceptedAnswer: { "@type": "Answer", text: r },
  })),
};

export default function Matricula() {
  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Gratis y sin registro
          </span>
          <h1 className={base.h1}>¿De qué año es esta matrícula?</h1>
          <p className={base.sub}>
            Descubre la fecha de matriculación aproximada de un coche y la etiqueta
            ambiental de la DGT que le corresponde.
          </p>
          <ConsultaMatricula />
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Tabla de matrículas</span>
          <h2 className={base.secTit}>Primera matrícula de cada año</h2>
          <p className={base.secSub}>
            Si las letras de una matrícula van después de las de un año, el coche se
            matriculó ese año o más tarde. Datos hasta {nombreMes(ULTIMO_MES)}.
          </p>
          <div className={styles.tablaCaja}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Año</th>
                  <th scope="col">Primera matrícula</th>
                </tr>
              </thead>
              <tbody>
                {PRIMERA_DEL_ANIO.map(({ anio, primera }) => (
                  <tr key={anio}>
                    <td>{anio === 2000 ? "2000 (septiembre)" : anio}</td>
                    <td>
                      <Link href={`/matricula/${primera[0].toLowerCase()}`}>0000 {primera}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.otras}>
            Fechas exactas por letra:{" "}
            {LETRAS_USADAS.map((l, i) => (
              <span key={l}>
                {i > 0 && " · "}
                <Link href={`/matricula/${l.toLowerCase()}`}>Matrícula {l}</Link>
              </span>
            ))}
            {" · "}
            <Link href="/matricula/provinciales">Provinciales</Link>
          </p>
          <p className={styles.otras}>
            <FuenteDgt datos="matriculas" /> Antes de 2015, tablas públicas de fechas de matrículas.
          </p>
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Preguntas frecuentes</span>
          <h2 className={base.secTit}>Matrículas y etiquetas</h2>
          <div className={base.faq}>
            {PREGUNTAS.map((q) => (
              <details key={q.p} className={base.faqIt}>
                <summary className={base.faqP}>{q.p}</summary>
                <p className={base.faqR}>{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`${base.cont} ${base.cta}`}>
        <div className={base.ctaP}>
          <h2 className={base.ctaT}>¿No sabes qué coche es?</h2>
          <p className={base.ctaX}>
            Hazle una foto y te decimos el modelo, su ficha y su precio.
          </p>
          <Link href="/" className={`${base.btn} ${base.btnBlanco}`}>
            Identificar por foto
          </Link>
        </div>
      </section>
    </MarcoPagina>
  );
}
