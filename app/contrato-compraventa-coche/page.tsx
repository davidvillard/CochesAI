import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Contrato from "./Contrato";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Contrato de compraventa de coche entre particulares para rellenar",
  descripcion:
    "Rellena online el contrato de compraventa de un coche entre particulares e imprímelo o guárdalo en PDF. Gratis, sin registro y sin que tus datos salgan del navegador.",
  ruta: "/contrato-compraventa-coche",
});

export default function ContratoCompraventa() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Tus datos no salen del navegador
          </span>
          <h1 className={base.h1}>Contrato de compraventa de coche</h1>
          <p className={base.sub}>
            Rellénalo, imprímelo por duplicado y firmadlo. Después, el comprador tiene 30
            días para hacer el{" "}
            <Link href="/coste-transferencia" className={base.notaLink}>
              cambio de nombre
            </Link>
            .
          </p>
          <Contrato />
        </div>
      </section>
    </MarcoPagina>
  );
}
