import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import base from "../../page.module.css";
import styles from "../itp.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import CalculadoraItp from "../CalculadoraItp";
import { eur } from "../../lib/formato";
import { COMUNIDADES, calcularItp, coeficiente, especialidades, pct } from "../../lib/itp";
import { SITE_URL, metadatos } from "../../lib/seo";

type Props = { params: Promise<{ comunidad: string }> };

// Una página por comunidad: /calculadora-itp/galicia, /calculadora-itp/madrid...
export const dynamicParams = false;
export function generateStaticParams() {
  return COMUNIDADES.map((c) => ({ comunidad: c.id }));
}

function obtener(id: string) {
  const c = COMUNIDADES.find((x) => x.id === id);
  if (!c) notFound();
  return c;
}

// Ejemplo fijo para cada comunidad: compacto de 8 años, 1.6 y 11 CV fiscales
const EJEMPLO = { precio: 8000, valorNuevo: 22000, anios: 8, cc: 1598, cvFiscales: 11 };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = obtener((await params).comunidad);
  return metadatos({
    titulo: `ITP coche ${c.nombre} 2026: calculadora y tipos`,
    descripcion: `En ${c.nombre} el ITP de un coche de segunda mano es del ${pct(c.tipo)}. ${especialidades(c) === "—" ? "" : especialidades(c)} Calcula cuánto pagarás al comprarlo.`,
    ruta: `/calculadora-itp/${c.id}`,
  });
}

export default async function ItpComunidad({ params }: Props) {
  const c = obtener((await params).comunidad);
  const ejemplo = calcularItp({ comunidad: c.id, distintivo: "normal", ...EJEMPLO })!;
  const valorTablas = EJEMPLO.valorNuevo * coeficiente(EJEMPLO.anios);
  const reglas = especialidades(c);
  const respuesta = `En ${c.nombre}, el ITP al comprar un coche usado a un particular es del ${pct(c.tipo)} sobre el mayor entre el precio y el valor fiscal del coche.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `¿Cuánto es el ITP de un coche de segunda mano en ${c.nombre}?`,
          acceptedAnswer: { "@type": "Answer", text: `${respuesta}${reglas === "—" ? "" : ` ${reglas}`}` },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Calculadora de ITP", item: `${SITE_URL}/calculadora-itp` },
        { "@type": "ListItem", position: 2, name: c.nombre, item: `${SITE_URL}/calculadora-itp/${c.id}` },
      ],
    },
  ];

  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Tipos de 2026
          </span>
          <h1 className={base.h1}>ITP de coches en {c.nombre}</h1>
          <p className={base.sub}>{respuesta}</p>
          <CalculadoraItp comunidadInicial={c.id} />
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Tipos y casos especiales en {c.nombre}</h2>
          <ul>
            <li>
              Tipo general: <strong>{pct(c.tipo)}</strong>.
            </li>
            {reglas !== "—" && <li>{reglas}</li>}
            <li>
              Plazo para pagarlo: <strong>{c.plazo}</strong> desde la compra.
            </li>
          </ul>

          <h2 className={styles.h2}>Ejemplo de cálculo</h2>
          <p>
            Compras por {eur(EJEMPLO.precio)} un compacto de {EJEMPLO.anios} años
            (1.6 de gasolina, {EJEMPLO.cvFiscales} CV fiscales) que nuevo valía{" "}
            {eur(EJEMPLO.valorNuevo)} según las tablas de Hacienda.
          </p>
          <ul>
            <li>
              Valor fiscal: {eur(EJEMPLO.valorNuevo)} × {Math.round(coeficiente(EJEMPLO.anios) * 100)} % por
              su antigüedad = {eur(valorTablas)}.
            </li>
            <li>
              Base imponible: el mayor entre el precio y el valor fiscal ={" "}
              {eur(ejemplo.base)}.
            </li>
            <li>
              ITP a pagar: <strong>{eur(ejemplo.cuota)}</strong>. {ejemplo.explicacion}
            </li>
          </ul>

          <p className={styles.nota}>
            Cálculo orientativo con los tipos de 2026. Confírmalo en la hacienda de{" "}
            {c.nombre} antes de pagar.
          </p>

          <h2 className={styles.h2}>Otras comunidades</h2>
          <p className={styles.comunidades}>
            {COMUNIDADES.filter((x) => x.id !== c.id).map((x, i) => (
              <span key={x.id}>
                {i > 0 && " · "}
                <Link href={`/calculadora-itp/${x.id}`}>{x.nombre}</Link>
              </span>
            ))}
          </p>
          <p>
            <Link href="/calculadora-itp" className={base.notaLink}>
              Ver la tabla con los tipos de todas las comunidades
            </Link>
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
