import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import base from "../../../page.module.css";
import styles from "../../coches.module.css";
import MarcoPagina from "../../../components/MarcoPagina";
import Afiliados from "../../../components/Afiliados";
import VentasModelo from "../../../components/VentasModelo";
import { eur, fechaLarga } from "../../../lib/formato";
import {
  leerFicha,
  listaFallos,
  urlFicha,
  urlMarca as rutaMarca,
  urlsDeFichas,
} from "../../../lib/fichas";
import { SITE_URL, metadatos } from "../../../lib/seo";

type Props = { params: Promise<{ marca: string; modelo: string }> };

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
  const fallos = listaFallos(f).slice(0, 3).map((x) => x.titulo.toLowerCase());
  return metadatos({
    titulo: `${nombre}: fallos comunes, problemas y precio`,
    descripcion: fallos.length
      ? `Fallos comunes del ${nombre} por motor y generación (${fallos.join(", ")}…), qué revisar antes de comprarlo y su precio de segunda mano en España.`
      : f.resumen,
    ruta: urlFicha(f.slug),
  });
}

export default async function FichaModelo({ params }: Props) {
  const f = await obtener(params);
  const nombre = `${f.marca} ${f.modelo}`;
  const precio = f.precioSegundaManoEur.max > 0 ? f.precioSegundaManoEur : null;
  const enlacesSimilares = await urlsDeFichas(f.similares);
  const urlMarca = rutaMarca(f.slug);
  const fallos = listaFallos(f);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fichas", item: `${SITE_URL}/coches` },
        { "@type": "ListItem", position: 2, name: f.marca, item: `${SITE_URL}${urlMarca}` },
        { "@type": "ListItem", position: 3, name: nombre, item: `${SITE_URL}${urlFicha(f.slug)}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${nombre}: fallos comunes, problemas y precio`,
      url: `${SITE_URL}${urlFicha(f.slug)}`,
      dateModified: f.actualizada,
      inLanguage: "es-ES",
      about: { "@type": "Car", name: nombre, brand: { "@type": "Brand", name: f.marca }, model: f.modelo },
      publisher: { "@id": `${SITE_URL}/#organizacion` },
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
          <Link href={urlMarca}>{f.marca}</Link>
        </nav>

        <header className={styles.cabecera}>
          <h1 className={styles.titulo}>
            <span className={styles.marca}>{f.marca}</span> {f.modelo}
          </h1>
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
              {f.precioNuevoEur ? `Nuevo: ${f.precioNuevoEur.replace(/\.$/, "")}. ` : ""}
              Precios orientativos, no son una tasación.{" "}
              {precio && (
                <Link href={`/tasacion?modelo=${f.slug}`} className={base.notaLink}>
                  Calcula el de un año y kilómetros concretos
                </Link>
              )}
            </p>
          </div>
        )}

        {fallos.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Fallos comunes del {nombre}</h2>
            <p className={styles.intro}>
              Los problemas más conocidos y en qué versiones aparecen. Revísalos antes de
              comprar uno de segunda mano.
            </p>
            <ol className={styles.fallos}>
              {fallos.map((x) => (
                <li key={x.titulo} className={styles.fallo}>
                  <h3 className={styles.falloT}>{x.titulo}</h3>
                  {x.afecta && <p className={styles.afecta}>Afecta a: {x.afecta}</p>}
                  {x.detalle && <p className={styles.falloX}>{x.detalle}</p>}
                </li>
              ))}
            </ol>
          </section>
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

        {f.electrico && f.electrico.length > 0 && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Autonomía y carga</h2>
            <div className={styles.tablaCaja}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Versión</th>
                    <th scope="col">Batería</th>
                    <th scope="col">Autonomía (WLTP)</th>
                    <th scope="col">Carga en casa (AC)</th>
                    <th scope="col">Carga rápida (DC)</th>
                    <th scope="col">10-80 %</th>
                  </tr>
                </thead>
                <tbody>
                  {f.electrico.map((e) => (
                    <tr key={e.version}>
                      <td>{e.version}</td>
                      <td>{e.bateriaKwh || "—"}</td>
                      <td>{e.autonomiaKm}</td>
                      <td>{e.cargaAcKw || "—"}</td>
                      <td>{e.cargaDcKw || "—"}</td>
                      <td>{e.carga10a80 || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.aviso} style={{ marginTop: 12 }}>
              Cifras oficiales WLTP de cuando el coche era nuevo: en uso real, sobre todo en
              autopista y con frío, la autonomía suele ser un 20-30 % menor, y en un coche usado
              depende además del estado de la batería. Pide un informe de salud de la batería
              antes de comprar.
            </p>
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

        <VentasModelo slug={f.slug} nombre={nombre} />

        <Afiliados titulo={`¿Vas a comprar un ${nombre}?`} />

        {f.etiquetaDgt && (
          <section className={styles.bloque}>
            <h2 className={styles.h2}>Etiqueta ambiental</h2>
            <p>{f.etiquetaDgt}</p>
            <p>
              <Link href="/matricula" className={base.notaLink}>
                Calcula la etiqueta de un coche concreto con su matrícula
              </Link>
              {" · "}
              <Link href="/zonas-bajas-emisiones" className={base.notaLink}>
                Dónde puede circular: zonas de bajas emisiones
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

        <p className={styles.bloque}>
          <Link href={`/comparar?a=${f.slug}`} className={base.notaLink}>
            Comparar el {nombre} con otro coche
          </Link>
        </p>

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
          Ficha elaborada con inteligencia artificial a partir de información pública
          {f.actualizada ? <> y actualizada el {fechaLarga(f.actualizada)}</> : null}. Puede contener
          errores: comprueba los datos antes de comprar.{" "}
          <Link href="/metodologia">Cómo elaboramos las fichas</Link>.
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
