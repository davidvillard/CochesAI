import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightLinearIcon } from "@solar-icons/react";
import base from "../page.module.css";
import MarcoPagina from "../components/MarcoPagina";
import { HERRAMIENTAS } from "../lib/herramientas";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Herramientas gratis para comprar un coche de segunda mano",
  descripcion:
    "Calculadoras y herramientas gratis para comprar un coche usado: año por matrícula, bastidor, ITP, coste de la transferencia, ITV, contrato de compraventa y checklist de revisión.",
  ruta: "/herramientas",
});

export default function Herramientas() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Gratis y sin registro
          </span>
          <h1 className={base.h1}>Herramientas para comprar un coche</h1>
          <p className={base.sub}>
            Todo lo que necesitas antes, durante y después de comprar un coche de segunda
            mano.
          </p>
        </div>
      </section>

      <section className={base.cont} style={{ paddingBottom: 72 }}>
        <div className={`${base.rej} ${base.rej3}`} style={{ marginTop: 0 }}>
          <Link href="/" className={`${base.tarj} ${base.tarjLink} ${base.tarjDest}`}>
            <h2 className={base.tarjTit}>Identificar un coche por foto</h2>
            <p className={base.tarjTxt}>
              Haz una foto y descubre qué modelo es, su ficha y su precio de segunda mano.
            </p>
            <span className={base.tarjAccion} style={{ color: "#fff" }}>
              Hacer una foto <ArrowRightLinearIcon size={18} />
            </span>
          </Link>
          {HERRAMIENTAS.map(({ href, texto, detalle, Icono }) => (
            <Link key={href} href={href} className={`${base.tarj} ${base.tarjLink}`}>
              <span className={base.specIc}>
                <Icono size={24} />
              </span>
              <h2 className={base.tarjTit}>{texto}</h2>
              <p className={base.tarjTxt}>{detalle}.</p>
              <span className={base.tarjAccion}>
                Abrir <ArrowRightLinearIcon size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </MarcoPagina>
  );
}
