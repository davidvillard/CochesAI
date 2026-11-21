import type { Metadata } from "next";
import Link from "next/link";
import base from "../page.module.css";
import styles from "./adivina.module.css";
import MarcoPagina from "../components/MarcoPagina";
import Juego from "./Juego";
import { MAX_INTENTOS, jugar, opciones } from "../lib/adivina";
import { fechaLarga } from "../lib/formato";
import { metadatos } from "../lib/seo";

// Cambia cada día: no se puede generar en el build
export const dynamic = "force-dynamic";

export const metadata: Metadata = metadatos({
  titulo: "Adivina el coche del día: juego diario de coches",
  descripcion: `Cada día, un coche secreto. Tienes ${MAX_INTENTOS} intentos: cada fallo te da una pista y te dice si el de hoy es más caro, más vendido o de otra marca. Comparte tu resultado.`,
  ruta: "/adivina",
});

export default async function Adivina() {
  const [partida, ops] = await Promise.all([jugar([]), opciones()]);

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} />
            {partida ? `Juego nº ${partida.numero} · ${fechaLarga(partida.fecha)}` : "Juego diario"}
          </span>
          <h1 className={base.h1}>Adivina el coche del día</h1>
          <p className={base.sub}>
            Un coche secreto, el mismo para todos. Tienes {MAX_INTENTOS} intentos: con cada
            fallo descubres una pista nueva y ves en qué se parece tu coche al de hoy.
          </p>
          {partida ? (
            <Juego inicial={partida} opciones={ops} />
          ) : (
            <p className={styles.error}>El juego de hoy no está disponible. Vuelve en un rato.</p>
          )}
        </div>
      </section>

      <section className={base.sec}>
        <div className={`${base.cont} ${styles.texto}`}>
          <h2 className={styles.h2}>Cómo se juega</h2>
          <ul>
            <li>Empiezas con una pista. Escribe un modelo y pulsa «Probar».</li>
            <li>
              Cada intento se compara con el coche de hoy: en verde lo que coincide, en
              amarillo si también se vende con ese motor, y las flechas te dicen si el de hoy
              es más caro o más vendido (↑) o menos (↓).
            </li>
            <li>Con cada fallo aparece una pista más. La última es la marca.</li>
            <li>A medianoche (hora de España) cambia el coche.</li>
          </ul>
          <p>
            Los datos de ventas son de la DGT y los precios, orientativos, de nuestras{" "}
            <Link href="/coches" className={base.notaLink}>
              fichas de modelos
            </Link>
            . Si ves un coche por la calle y no sabes cuál es,{" "}
            <Link href="/" className={base.notaLink}>
              hazle una foto
            </Link>
            .
          </p>
        </div>
      </section>
    </MarcoPagina>
  );
}
