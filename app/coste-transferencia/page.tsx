import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../calculadora-itp/itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import CalculadoraItp from "../calculadora-itp/CalculadoraItp";
import { eurExacto } from "../lib/formato";
import { TASA_TRANSFERENCIA } from "../lib/itp";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Cuánto cuesta cambiar de nombre un coche en 2026",
  descripcion: `Calcula el coste de la transferencia de un coche entre particulares: ITP de tu comunidad, tasa de la DGT (${eurExacto(TASA_TRANSFERENCIA.general)}) y gestoría. Pasos y documentos necesarios.`,
  ruta: "/coste-transferencia",
});

const PREGUNTAS = [
  {
    p: "¿Cuánto cuesta cambiar de nombre un coche?",
    r: `La suma del ITP de tu comunidad (normalmente entre el 3 % y el 6 % del valor del coche, o una cuota fija si es antiguo), la tasa de la DGT de ${eurExacto(TASA_TRANSFERENCIA.general)} (${eurExacto(TASA_TRANSFERENCIA.ciclomotor)} en ciclomotores) y, si la usas, la gestoría.`,
  },
  {
    p: "¿Quién paga la transferencia?",
    r: "Normalmente el comprador, que es quien debe pagar el ITP y pedir el cambio de titular. Vendedor y comprador pueden pactar otra cosa en el contrato.",
  },
  {
    p: "¿Qué plazo hay para hacerla?",
    r: "El comprador debe pedir el cambio de titular en la DGT en los 30 días siguientes a la compra. El ITP tiene su propio plazo, que depende de la comunidad (30 días hábiles o un mes en la mayoría).",
  },
  {
    p: "¿Puedo hacerla yo sin gestoría?",
    r: "Sí. Se puede hacer en la sede electrónica de la DGT con certificado digital o Cl@ve, o en una jefatura de Tráfico con cita previa. La gestoría es opcional y te ahorra el papeleo.",
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

export default function CosteTransferencia() {
  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Tasas de 2026
          </span>
          <h1 className={base.h1}>¿Cuánto cuesta cambiar de nombre un coche?</h1>
          <p className={base.sub}>
            Calcula el coste de la transferencia entre particulares: ITP, tasa de la DGT y
            gestoría.
          </p>
          <CalculadoraItp transferencia />
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Pasos para hacer la transferencia</h2>
          <ol>
            <li>
              Firmad un{" "}
              <Link href="/contrato-compraventa-coche" className={base.notaLink}>
                contrato de compraventa
              </Link>{" "}
              con los datos de los dos, del coche, el precio y la fecha.
            </li>
            <li>
              El comprador paga el ITP en la hacienda de su comunidad con el modelo 620 o el
              que indique.{" "}
              <Link href="/calculadora-itp" className={base.notaLink}>
                Calcula el ITP
              </Link>
              .
            </li>
            <li>
              Paga la tasa de la DGT ({eurExacto(TASA_TRANSFERENCIA.general)}) y pide el
              cambio de titular en su sede electrónica o en Tráfico, en los 30 días
              siguientes a la compra.
            </li>
            <li>
              Lleva el DNI de los dos, el contrato, el justificante del ITP, el permiso de
              circulación y la ficha técnica con la ITV en vigor.
            </li>
          </ol>

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
            Antes de comprar, revisa el coche con nuestra{" "}
            <Link href="/checklist-compra-coche" className={base.notaLink}>
              checklist de compra
            </Link>{" "}
            y mira si su{" "}
            <Link href="/itv" className={base.notaLink}>
              ITV
            </Link>{" "}
            está en vigor.
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
