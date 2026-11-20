import type { Metadata } from "next";
import base from "../page.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Afiliados from "../components/Afiliados";
import Checklist from "./Checklist";
import { GRUPOS, TOTAL } from "./puntos";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "Qué revisar al comprar un coche de segunda mano: checklist",
  descripcion:
    "Checklist para comprar un coche usado: documentación, cargas, kilómetros, carrocería, interior, motor, prueba en marcha y papeles de la compra. Márcala en el móvil mientras lo revisas.",
  ruta: "/checklist-compra-coche",
});

export default function ChecklistCompra() {
  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> {TOTAL} puntos
          </span>
          <h1 className={base.h1}>Qué revisar al comprar un coche de segunda mano</h1>
          <p className={base.sub}>
            Llévala en el móvil y ve marcando cada punto mientras ves el coche. Se queda
            guardada en tu navegador.
          </p>
          <Checklist grupos={GRUPOS} clave="cochesai.checklist" nombre="checklist" />
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <Afiliados titulo="Lo que no se ve a simple vista" />
          </div>
        </div>
      </section>
    </MarcoPagina>
  );
}
