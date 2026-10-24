import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../calculadora-itp/itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import DecodificadorVin from "./DecodificadorVin";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Identificar coche por bastidor (VIN): decodificador gratis",
  descripcion:
    "Escribe el número de bastidor (VIN) de un coche y descubre su fabricante, su país de fabricación y, en muchas marcas, su año de modelo. Gratis y sin registro.",
  ruta: "/bastidor",
});

const PREGUNTAS = [
  {
    p: "¿Dónde está el número de bastidor de mi coche?",
    r: "En la ficha técnica (tarjeta ITV), en el permiso de circulación (campo E), grabado en el chasis bajo el capó y, en muchos coches, en una placa visible a través del parabrisas o en el marco de la puerta del conductor.",
  },
  {
    p: "¿Qué información da el bastidor?",
    r: "Los tres primeros caracteres indican el fabricante y el país. Los siguientes describen el modelo según cada marca, y en muchas marcas el décimo indica el año de modelo. El resto es la planta y el número de serie.",
  },
  {
    p: "¿Se puede saber el año de un coche por el bastidor?",
    r: "En muchas marcas sí, con el décimo carácter (por ejemplo en el grupo Volkswagen, Hyundai, Kia o los coches norteamericanos). Otras marcas europeas no lo usan: en ese caso, mira la fecha de matriculación.",
  },
  {
    p: "¿Se puede saber la matrícula por el bastidor?",
    r: "No con datos públicos. La relación entre bastidor y matrícula solo aparece en el informe del vehículo de la DGT o en informes de historial de pago.",
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

export default function Bastidor() {
  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Gratis y sin registro
          </span>
          <h1 className={base.h1}>Decodificador de bastidor (VIN)</h1>
          <p className={base.sub}>
            Escribe el número de bastidor y te decimos qué fabricante lo hizo, en qué
            país y, si la marca lo indica, de qué año es.
          </p>
          <DecodificadorVin />
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Preguntas frecuentes</h2>
          <div className={base.faq} style={{ marginTop: 12 }}>
            {PREGUNTAS.map((q) => (
              <details key={q.p} className={base.faqIt}>
                <summary className={base.faqP}>{q.p}</summary>
                <p className={base.faqR}>{q.r}</p>
              </details>
            ))}
          </div>
          <p className={styles.nota}>
            El bastidor no sale de tu navegador. ¿No lo tienes a mano?{" "}
            <Link href="/" className={base.notaLink}>
              Identifica el coche con una foto
            </Link>{" "}
            o{" "}
            <Link href="/matricula" className={base.notaLink}>
              mira su año por la matrícula
            </Link>
            .
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
