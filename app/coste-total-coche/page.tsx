import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "../calculadora-itp/itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import CalculadoraCoste from "./CalculadoraCoste";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "¿Eléctrico, híbrido o gasolina? Calculadora de coste total",
  descripcion:
    "Compara lo que te cuesta de verdad un coche eléctrico, híbrido, enchufable, gasolina o diésel en varios años: compra, ayudas del Plan Auto+, combustible o luz, seguro, mantenimiento y reventa.",
  ruta: "/coste-total-coche",
});

const PREGUNTAS = [
  {
    p: "¿Sale más barato un eléctrico que un híbrido?",
    r: "Depende de cuántos kilómetros hagas y de dónde cargues. Un eléctrico suele costar más al comprarlo, pero gasta mucho menos en energía y mantenimiento si cargas sobre todo en casa. Con pocos kilómetros al año o cargando casi siempre en cargadores rápidos, la diferencia de precio tarda mucho en recuperarse o no se recupera.",
  },
  {
    p: "¿Qué ayudas hay para comprar un eléctrico en 2026?",
    r: "El Plan Auto+, que sustituye al MOVES III, da hasta 4.500 € a particulares por un eléctrico y menos por un híbrido enchufable, con precio máximo de 45.000 € antes de impuestos. La cuantía depende del tipo de coche, su precio y dónde se fabrica, y se concede por orden hasta agotar el dinero. Consulta la convocatoria oficial antes de contar con ella.",
  },
  {
    p: "¿Merece la pena un híbrido enchufable?",
    r: "Solo si lo cargas casi todos los días. Si haces la mayoría de los kilómetros en eléctrico es muy barato de usar; si casi nunca lo enchufas, gasta más que un híbrido normal porque carga con el peso de la batería.",
  },
  {
    p: "¿Por qué la calculadora resta la reventa?",
    r: "Porque al final de los años vendes el coche y recuperas parte de lo que pagaste. Lo que de verdad te cuesta la compra es el precio, menos las ayudas, menos lo que te den al venderlo.",
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

export default function CosteTotalCoche() {
  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Coste total
          </span>
          <h1 className={base.h1}>¿Eléctrico, híbrido o gasolina? Lo que cuesta de verdad</h1>
          <p className={base.sub}>
            Compara dos coches durante los años que los vayas a tener: compra, ayudas,
            combustible o luz, seguro, mantenimiento y lo que te den al venderlos.
          </p>
          <CalculadoraCoste />
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Cómo se calcula</h2>
          <ul>
            <li>
              <strong>Compra:</strong> precio menos ayudas, menos lo que vale el coche al
              venderlo. Por defecto pierde un 7 % de valor cada año.
            </li>
            <li>
              <strong>Energía:</strong> kilómetros al año por el consumo real y el precio del
              litro o del kWh. En los eléctricos se suma un 10 % por las pérdidas al cargar.
            </li>
            <li>
              <strong>Seguro, mantenimiento e impuesto de circulación:</strong> valores típicos
              de un compacto. El impuesto lo fija cada ayuntamiento, y muchos rebajan hasta un
              75 % a los eléctricos e híbridos.
            </li>
          </ul>
          <p>
            Todos los valores se pueden cambiar. Si sabes el consumo de tu coche o lo que pagas
            de seguro, ponlo: el resultado será mucho más fiel.
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
            ¿Dudas entre dos modelos concretos?{" "}
            <Link href="/comparar" className={base.notaLink}>
              Compáralos
            </Link>
            , mira su{" "}
            <Link href="/zonas-bajas-emisiones" className={base.notaLink}>
              etiqueta y las zonas de bajas emisiones
            </Link>{" "}
            o calcula{" "}
            <Link href="/tasacion" className={base.notaLink}>
              cuánto vale un usado
            </Link>
            .
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
