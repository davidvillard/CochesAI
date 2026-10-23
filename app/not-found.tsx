import type { Metadata } from "next";
import Link from "next/link";
import base from "./page.module.css";
import MarcoPagina from "./components/MarcoPagina";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o ha caducado.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

export default function NoEncontrada() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>Error 404</span>
          <h1 className={base.h1}>Esta página no existe</h1>
          <p className={base.sub}>
            Puede que el enlace esté mal escrito o que el resultado compartido haya
            caducado (se guardan 30 días).
          </p>
          <div className={base.acciones}>
            <Link href="/" className={`${base.btn} ${base.btnP}`}>
              Identificar un coche por foto
            </Link>
            <Link href="/coches" className={base.btn}>
              Ver fichas de coches
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
