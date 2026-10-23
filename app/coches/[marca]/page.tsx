import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import base from "../../page.module.css";
import styles from "../coches.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import { agruparPorMarca, listarModelos, urlFicha } from "../../lib/fichas";
import { SITE_URL, metadatos } from "../../lib/seo";

type Props = { params: Promise<{ marca: string }> };

// Metadatos y página usan la misma lista: una sola consulta a Redis
const obtener = cache(async (params: Props["params"]) => {
  const { marca } = await params;
  const grupo = agruparPorMarca(await listarModelos()).find((g) => g.slug === marca);
  if (!grupo) notFound();
  return grupo;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = await obtener(params);
  const ejemplos = g.modelos.slice(0, 3).map((m) => m.modelo).join(", ");
  return metadatos({
    titulo: `${g.marca} de segunda mano: fichas, precios y fallos`,
    descripcion: `Fichas de los ${g.marca} más buscados (${ejemplos}…): precio de segunda mano en España, motores, generaciones y qué revisar antes de comprar.`,
    ruta: `/coches/${g.slug}`,
  });
}

export default async function Marca({ params }: Props) {
  const g = await obtener(params);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Fichas", item: `${SITE_URL}/coches` },
      { "@type": "ListItem", position: 2, name: g.marca, item: `${SITE_URL}/coches/${g.slug}` },
    ],
  };

  return (
    <MarcoPagina>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className={`${base.cont} ${styles.ficha}`}>
        <nav aria-label="Migas de pan" className={styles.migas}>
          <Link href="/coches">Fichas</Link> <span aria-hidden="true">/</span>{" "}
          <span>{g.marca}</span>
        </nav>

        <header className={styles.cabecera}>
          <h1 className={styles.titulo}>{g.marca} de segunda mano</h1>
          <p className={styles.resumen}>
            {g.modelos.length === 1
              ? `La ficha del ${g.marca} ${g.modelos[0].modelo}`
              : `Fichas de ${g.modelos.length} modelos de ${g.marca}`}{" "}
            con su precio de segunda mano en España, motores, generaciones y qué revisar
            antes de comprar.
          </p>
        </header>

        <div className={styles.populares}>
          {g.modelos.map((m) => (
            <Link key={m.slug} href={urlFicha(m.slug)} className={styles.popular}>
              <span className={styles.popMarca}>{m.marca}</span>
              <strong>{m.modelo}</strong>
            </Link>
          ))}
        </div>

        <p className={styles.aviso}>
          <Link href="/coches" className={base.notaLink}>
            Ver las fichas de todas las marcas
          </Link>
        </p>
      </div>
    </MarcoPagina>
  );
}
