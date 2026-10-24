import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import base from "../../page.module.css";
import MarcoPagina from "../../components/MarcoPagina";
import FichaCoche from "../../components/FichaCoche";
import { eur } from "../../lib/formato";
import Compartir from "../../components/Compartir";
import Afiliados from "../../components/Afiliados";
import { leerResultado } from "../../lib/resultados";
import { buscarFicha } from "../../lib/fichas";
import { metadatos } from "../../lib/seo";

type Props = { params: Promise<{ id: string }> };

// Metadatos y página piden el mismo resultado: una sola lectura de Redis
const obtener = cache(leerResultado);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await obtener((await params).id);
  if (!r) return { title: "Resultado no encontrado", robots: { index: false } };
  const id = (await params).id;

  const nombre = `${r.marca} ${r.modelo}`;
  const precio = r.precioSegundaManoEur
    ? ` Segunda mano: ${eur(r.precioSegundaManoEur.min)} a ${eur(r.precioSegundaManoEur.max)}.`
    : "";
  const detalle = [r.generacion, r.anios].filter(Boolean).join(", ");
  const descripcion = `${detalle ? `${detalle}.` : ""}${precio} Identificado con IA a partir de una foto.`.trim();

  // Son resultados de usuarios y caducan: se comparten, pero no se indexan
  return metadatos({
    titulo: `Es un ${nombre}`,
    descripcion: descripcion,
    ruta: `/r/${id}`,
    indexar: false,
    imagenPropia: true,
  });
}

export default async function ResultadoCompartido({ params }: Props) {
  const guardado = await obtener((await params).id);
  if (!guardado) notFound();
  // La ficha del modelo puede haberse creado después de compartir el resultado
  const r = { ...guardado, ficha: await buscarFicha(guardado.marca, guardado.modelo) };

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={`${base.cont} ${base.compartida}`}>
          <span className={base.chip}>
            <span className={base.punto} /> Resultado compartido
          </span>
          <div className={base.compartidaFicha}>
            <FichaCoche r={r} />
            <Compartir r={r} />
            <Afiliados />
          </div>

          <div className={base.acciones}>
            <Link href="/" className={`${base.btn} ${base.btnP}`}>
              Identifica tu coche con una foto
            </Link>
            <Link href="/matricula" className={base.btn}>
              Año y etiqueta por matrícula
            </Link>
          </div>
        </div>
      </section>
    </MarcoPagina>
  );
}
