import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import base from "../../../page.module.css";
import styles from "../../coches.module.css";
import MarcoPagina from "../../../components/MarcoPagina";
import { eur } from "../../../lib/formato";
import { leerFicha, urlFicha, urlsDeFichas } from "../../../lib/fichas";

type Props = { params: Promise<{ marca: string; modelo: string }> };

const BASE_URL = "https://cochesai.vercel.app";

// Metadatos y página leen la misma ficha: una sola consulta a Redis
const obtener = cache(async (params: Props["params"]) => {
  const { marca, modelo } = await params;
  const f = await leerFicha(`${marca}/${modelo}`);
  if (!f) notFound();
  if ("alias" in f) permanentRedirect(urlFicha(f.alias));
  return f;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await obtener(params);
  const nombre = `${f.marca} ${f.modelo}`;
  return {
    title: `${nombre}: precio de segunda mano, motores y generaciones`,
    description: f.resumen.slice(0, 160),
    alternates: { canonical: urlFicha(f.slug) },
    openGraph: { title: nombre, description: f.resumen, url: urlFicha(f.slug) },
  };
}

export default async function FichaModelo({ params }: Props) {
  const f = await obtener(params);
  const nombre = `${f.marca} ${f.modelo}`;
  const precio = f.precioSegundaManoEur.max > 0 ? f.precioSegundaManoEur : null;
  const enlacesSimilares = await urlsDeFichas(f.similares);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fichas", item: `${BASE_URL}/coches` },
        { "@type": "ListItem", position: 2, name: nombre, item: `${BASE_URL}${urlFicha(f.slug)}` },
      ],
    },
    ...(f.preguntas.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: f.preguntas.map(({ p, r }) => ({
              "@type": "Question",
              name: p,
              acceptedAnswer: { "@type": "Answer", text: r },
            })),
          },
        ]
      : []),
  ];

  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className={`${base.cont} ${styles.ficha}`}>
        <nav aria-label="Migas de pan" className={styles.migas}>
          <Link href="/coches">Fichas</Link> <span aria-hidden="true">/</span>{" "}
          <span>{f.marca}</span>
        </nav>

        <header className={styles.cabecera}>
          <p className={styles.marca}>{f.marca}</p>
          <h1 className={styles.titulo}>{f.modelo}</h1>
          {(f.carroceria || f.segmento) && (
            <p className={styles.chips}>
              {[f.carroceria, f.segmento].filter(Boolean).map((c) => (
                <span key={c} className={base.chip}>
                  {c}
                </span>
              ))}
            </p>
          )}
          <p className={styles.resumen}>{f.resumen}</p>
        </header>

        {(precio || f.precioNuevoEur) && (
          <div className={base.precio}>
            <p className={base.precioEt}>Segunda mano en España</p>
            {precio && (
              <p className={base.precioN}>
                {eur(precio.min)} a {eur(precio.max)}
              </p>
            )}
            <p className={base.precioX}>
              {f.precioNuevoEur ? `Nuevo: ${f.precioNuevoEur}. ` : ""}
              Precios orientativos, no son una tasación.
            </p>
          </div>
        )}

        {f.generaciones.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Generaciones</h2>
            <ol className={styles.generaciones}>
              {f.generaciones.map((g) => (
                <li key={g.nombre + g.anios}>
                  <strong>{g.nombre}</strong>
                  {g.anios && <span className={styles.anios}>{g.anios}</span>}
                  {g.cambios && <p>{g.cambios}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {f.motores.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Motores habituales</h2>
            <div className={styles.tablaCaja}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Motor</th>
                    <th scope="col">Combustible</th>
                    <th scope="col">Potencia</th>
                  </tr>
                </thead>
                <tbody>
                  {f.motores.map((m) => (
                    <tr key={m.nombre + m.potenciaCv}>
                      <td>{m.nombre}</td>
                      <td>{m.combustible}</td>
                      <td>{m.potenciaCv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(f.puntosFuertes.length > 0 || f.puntosDebiles.length > 0) && (
          <section className={`${styles.bloque} ${styles.dosCol}`}>
            <div className={styles.caja}>
              <h2 className={styles.h2}>Puntos fuertes</h2>
              <ul className={styles.lista}>
                {f.puntosFuertes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className={styles.caja}>
              <h2 className={styles.h2}>Puntos débiles</h2>
              <ul className={styles.lista}>
                {f.puntosDebiles.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {f.fallosConocidos.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Qué revisar antes de comprarlo</h2>
            <ul className={styles.lista}>
              {f.fallosConocidos.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        {f.etiquetaDgt && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Etiqueta ambiental</h2>
            <p>{f.etiquetaDgt}</p>
            <p>
              <Link href="/matricula" className={base.notaLink}>
                Calcula la etiqueta de un coche concreto con su matrícula
              </Link>
            </p>
          </section>
        )}

        {f.similares.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Alternativas</h2>
            <div className={base.similares}>
              {f.similares.map((s, i) => {
                const contenido = (
                  <div>
                    <p className={base.simN}>
                      {s.marca} {s.modelo}
                    </p>
                    <p className={base.simM}>{s.motivo}</p>
                  </div>
                );
                const url = enlacesSimilares[i];
                return url ? (
                  <Link key={i} href={url} className={`${base.sim} ${styles.simLink}`}>
                    {contenido}
                  </Link>
                ) : (
                  <div key={i} className={base.sim}>
                    {contenido}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {f.preguntas.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Preguntas frecuentes</h2>
            <div className={`${base.faq} ${styles.faq}`}>
              {f.preguntas.map((q) => (
                <details key={q.p} className={base.faqIt}>
                  <summary className={base.faqP}>{q.p}</summary>
                  <p className={base.faqR}>{q.r}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <p className={styles.aviso}>
          Ficha elaborada con inteligencia artificial a partir de información pública.
          Puede contener errores: comprueba los datos antes de comprar.
        </p>
      </article>

      <section className={`${base.cont} ${base.cta}`}>
        <div className={base.ctaP}>
          <h2 className={base.ctaT}>¿Has visto un {nombre}?</h2>
          <p className={base.ctaX}>Hazle una foto y te decimos qué versión es y cuánto vale.</p>
          <Link href="/" className={`${base.btn} ${base.btnBlanco}`}>
            Identificar por foto
          </Link>
        </div>
      </section>
    </MarcoPagina>
  );
}
