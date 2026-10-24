import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "./itp.module.css";
import MarcoPagina from "../components/MarcoPagina";
import CalculadoraItp from "./CalculadoraItp";
import { COMUNIDADES, especialidades, pct } from "../lib/itp";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Calculadora de ITP de coches usados 2026 por comunidad",
  descripcion:
    "Calcula cuánto pagarás de Impuesto de Transmisiones al comprar un coche de segunda mano en tu comunidad autónoma, con los tipos y las tablas de Hacienda de 2026.",
  ruta: "/calculadora-itp",
});

const PREGUNTAS = [
  {
    p: "¿Quién paga el ITP al comprar un coche usado?",
    r: "El comprador, cuando compra a un particular. Si compras a un concesionario o a un profesional, normalmente no se paga ITP porque la venta lleva IVA o REBU.",
  },
  {
    p: "¿Sobre qué cantidad se calcula?",
    r: "Sobre el mayor de dos valores: el precio que pagas o el valor de Hacienda, que es el precio medio del modelo nuevo en las tablas del BOE multiplicado por un porcentaje según su antigüedad (del 100 % el primer año al 10 % con más de 12 años).",
  },
  {
    p: "¿Dónde y cuándo se paga?",
    r: "En la hacienda de la comunidad donde vive el comprador, con el modelo 620 o el que indique la comunidad, normalmente en un plazo de 30 días hábiles o un mes desde la compra. Sin el justificante no se puede hacer el cambio de titular en la DGT.",
  },
  {
    p: "¿Es exacto el resultado?",
    r: "Es orientativo. Los tipos cambian cada año y algunas comunidades tienen reglas para casos concretos (vehículos históricos, familias numerosas, discapacidad). Confírmalo en tu hacienda autonómica antes de pagar.",
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

export default function PaginaItp() {
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
            <span className={base.punto} /> Tipos de 2026
          </span>
          <h1 className={base.h1}>Calculadora de ITP para coches usados</h1>
          <p className={base.sub}>
            Cuánto pagarás de Impuesto de Transmisiones Patrimoniales al comprar un
            coche de segunda mano a un particular, según tu comunidad.
          </p>
          <CalculadoraItp />
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Por comunidad autónoma</span>
          <h2 className={base.secTit}>Tipos de ITP de coches en 2026</h2>
          <p className={base.secSub}>
            El tipo se aplica sobre la base imponible. Algunas comunidades cobran una
            cuota fija o nada a los coches antiguos.
          </p>
          <div className={styles.tablaCaja}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Comunidad</th>
                  <th scope="col">Tipo general</th>
                  <th scope="col">Casos especiales</th>
                </tr>
              </thead>
              <tbody>
                {COMUNIDADES.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/calculadora-itp/${c.id}`}>{c.nombre}</Link>
                    </td>
                    <td>{pct(c.tipo)}</td>
                    <td>{especialidades(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Preguntas frecuentes</span>
          <h2 className={base.secTit}>El ITP al comprar un coche</h2>
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
          <h2 className={base.ctaT}>¿Ya sabes qué coche es?</h2>
          <p className={base.ctaX}>
            Consulta su ficha, su precio de segunda mano y qué revisar antes de comprarlo.
          </p>
          <Link href="/coches" className={`${base.btn} ${base.btnBlanco}`}>
            Ver fichas de coches
          </Link>
        </div>
      </section>
    </MarcoPagina>
  );
}
