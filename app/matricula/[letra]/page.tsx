import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import base from "../../page.module.css";
import styles from "../matricula.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import ConsultaMatricula from "../ConsultaMatricula";
import FuenteDgt from "../../components/FuenteDgt";
import { LETRAS_USADAS, nombreMes, rangoDe, subrangos, type Rango } from "../../lib/matricula";
import { SITE_URL, metadatos } from "../../lib/seo";

type Props = { params: Promise<{ letra: string }> };

// Una página por cada primera letra ya usada: /matricula/b ... /matricula/n
export const dynamicParams = false;
export function generateStaticParams() {
  return LETRAS_USADAS.map((l) => ({ letra: l.toLowerCase() }));
}

const periodo = (r: Rango) =>
  r.hasta
    ? r.desde.anio === r.hasta.anio && r.desde.mes === r.hasta.mes
      ? nombreMes(r.desde)
      : `de ${nombreMes(r.desde)} a ${nombreMes(r.hasta)}`
    : `desde ${nombreMes(r.desde)} (se sigue asignando)`;

function respuesta(r: Rango) {
  return r.hasta
    ? `Las matrículas que empiezan por ${r.prefijo} se asignaron entre ${nombreMes(r.desde)} y ${nombreMes(r.hasta)}.`
    : `Las matrículas que empiezan por ${r.prefijo} se asignan desde ${nombreMes(r.desde)} y todavía están en uso.`;
}

function datos(letra: string) {
  const r = rangoDe(letra);
  if (!r || r.prefijo.length !== 1) notFound();
  return r;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = datos((await params).letra);
  const ej = subrangos(r.prefijo)
    .slice(0, 2)
    .map((s) => s.prefijo)
    .join(", ");
  // El title y la description no dan la respuesta entera: si Google ya la
  // muestra en el resultado, nadie entra (CTR del 0,25 % en noviembre de 2026)
  return metadatos({
    titulo: `Matrícula ${r.prefijo}: ¿de qué año es? Mes exacto por letra`,
    descripcion: `Tabla con el mes exacto de cada matrícula ${r.prefijo} según la segunda letra (${ej}…). Escribe la tuya y te damos año, mes y etiqueta ambiental.`,
    ruta: `/matricula/${r.prefijo.toLowerCase()}`,
  });
}

export default async function LetraMatricula({ params }: Props) {
  const r = datos((await params).letra);
  const sub = subrangos(r.prefijo);
  const pos = LETRAS_USADAS.indexOf(r.prefijo);
  const anterior = LETRAS_USADAS[pos - 1];
  const siguiente = LETRAS_USADAS[pos + 1];
  const ejemplo = sub[Math.floor(sub.length / 2)];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `¿De qué año es la matrícula ${r.prefijo}?`,
          acceptedAnswer: { "@type": "Answer", text: respuesta(r) },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Matrícula", item: `${SITE_URL}/matricula` },
        { "@type": "ListItem", position: 2, name: `Letra ${r.prefijo}`, item: `${SITE_URL}/matricula/${r.prefijo.toLowerCase()}` },
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
            <span className={base.punto} /> Matrículas con la letra {r.prefijo}
          </span>
          <h1 className={base.h1}>¿De qué año es la matrícula {r.prefijo}?</h1>
          <p className={base.sub}>{respuesta(r)}</p>
          {!r.hasta && (
            <p className={styles.ultima}>
              <Link href="/ultima-matricula">
                ¿Cuál es la última matrícula {r.prefijo} asignada hoy? →
              </Link>
            </p>
          )}
          <ConsultaMatricula />
        </div>
      </section>

      <section className={base.sec}>
        <div className={base.cont}>
          <span className={base.eyebrow}>Mes a mes</span>
          <h2 className={base.secTit}>Matrículas {r.prefijo} según la segunda letra</h2>
          {ejemplo && (
            <p className={base.secSub}>
              La segunda letra afina la fecha. Por ejemplo, una matrícula 1234{" "}
              {ejemplo.prefijo}X es {periodo(ejemplo)}.
            </p>
          )}
          <div className={styles.tablaCaja}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Empieza por</th>
                  <th scope="col">Fecha de matriculación</th>
                </tr>
              </thead>
              <tbody>
                {sub.map((s) => (
                  <tr key={s.prefijo}>
                    <td>{s.prefijo}</td>
                    <td>{periodo(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className={styles.letras} aria-label="Otras letras">
            {anterior && (
              <Link href={`/matricula/${anterior.toLowerCase()}`} className={base.btn}>
                ← Matrícula {anterior}
              </Link>
            )}
            {siguiente && (
              <Link href={`/matricula/${siguiente.toLowerCase()}`} className={base.btn}>
                Matrícula {siguiente} →
              </Link>
            )}
          </nav>
          <p className={styles.otras}>
            Todas las letras:{" "}
            {LETRAS_USADAS.map((l, i) => (
              <span key={l}>
                {i > 0 && " · "}
                {l === r.prefijo ? (
                  <strong>{l}</strong>
                ) : (
                  <Link href={`/matricula/${l.toLowerCase()}`}>{l}</Link>
                )}
              </span>
            ))}
            {" · "}
            <Link href="/matricula/provinciales">Matrículas provinciales (antes de 2000)</Link>
          </p>
          <p className={styles.otras}>
            Las fechas son aproximadas: un coche importado recibe matrícula española al
            llegar, aunque sea más antiguo. <FuenteDgt datos="matriculas" />
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
