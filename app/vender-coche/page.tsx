import type { Metadata } from "next";
import base from "../page.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Checklist from "../checklist-compra-coche/Checklist";
import { GRUPOS_VENTA, TOTAL_VENTA } from "./puntos";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Cómo vender tu coche de segunda mano sin estafas: guía y checklist",
  descripcion:
    "Pasos para vender un coche entre particulares: papeles, precio, anuncio, cómo evitar las estafas más comunes, contrato, notificación de venta a la DGT, seguro e impuesto de circulación.",
  ruta: "/vender-coche",
});

export default function VenderCoche() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> {TOTAL_VENTA} pasos
          </span>
          <h1 className={base.h1}>Cómo vender tu coche sin sustos</h1>
          <p className={base.sub}>
            Todo lo que hay que hacer para vender un coche a un particular, en orden: antes de
            anunciarlo, para que no te estafen, el día de la venta y después. Ve marcando lo que
            ya tengas hecho.
          </p>
          <Checklist grupos={GRUPOS_VENTA} clave="cochesai.checklist-venta" nombre="venta" />
        </div>
      </section>
    </MarcoPagina>
  );
}
