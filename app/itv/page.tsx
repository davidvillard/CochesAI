import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../calculadora-itp/itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import CalculadoraItv from "./CalculadoraItv";
import { TIPOS_ITV } from "../lib/itv";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "¿Cuándo toca pasar la ITV? Calculadora por fecha de matriculación",
  descripcion:
    "Calcula cuándo le toca la ITV a tu coche, moto o furgoneta según su fecha de matriculación y la última inspección. Plazos de 2026: cada 2 años hasta los 10 y luego cada año.",
  ruta: "/itv",
});

const PREGUNTAS = [
  {
    p: "¿Cuándo pasa la primera ITV un coche nuevo?",
    r: "A los 4 años de su primera matriculación. Las furgonetas ligeras la pasan antes, a los 2 años.",
  },
  {
    p: "¿Cada cuánto se pasa la ITV un coche de más de 10 años?",
    r: "Cada año. Entre los 4 y los 10 años de antigüedad se pasa cada 2 años.",
  },
  {
    p: "¿Puedo pasar la ITV antes de que caduque?",
    r: "Sí. Puedes adelantarla hasta 30 días sin que cambie la fecha de la siguiente inspección.",
  },
  {
    p: "¿Dónde veo cuándo caduca la ITV de mi coche?",
    r: "En la tarjeta ITV (ficha técnica), en la pegatina del parabrisas y en la app miDGT. También en el informe del vehículo de la DGT.",
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

export default function Itv() {
  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Plazos de 2026
          </span>
          <h1 className={base.h1}>¿Cuándo le toca la ITV a tu coche?</h1>
          <p className={base.sub}>
            Pon la fecha de matriculación y, si la sabes, la de la última inspección.
          </p>
          <CalculadoraItv />
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Cada cuánto se pasa la ITV</h2>
          <ul>
            {TIPOS_ITV.map((t) => (
              <li key={t.id}>
                <strong>{t.nombre}:</strong> {t.texto}
              </li>
            ))}
          </ul>
          <p className={styles.nota}>
            Plazos para uso particular según el Real Decreto 920/2017. Taxis, ambulancias,
            autoescuelas y vehículos de alquiler tienen plazos más cortos.
          </p>

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
            ¿Vas a comprar un coche usado? Comprueba que la ITV está en vigor, repasa la{" "}
            <Link href="/checklist-compra-coche" className={base.notaLink}>
              checklist de compra
            </Link>{" "}
            y calcula el{" "}
            <Link href="/coste-transferencia" className={base.notaLink}>
              coste del cambio de nombre
            </Link>
            .
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
