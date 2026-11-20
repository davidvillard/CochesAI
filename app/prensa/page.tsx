import type { Metadata } from "next";
import Link from "next/link";
import { metadatos, SITE_URL } from "../lib/seo";
import MarcoPagina from "../components/MarcoPagina";
import FuenteDgt from "../components/FuenteDgt";
import styles from "../legal.module.css";
import { LEGAL } from "../datos-legales";
import { NOMBRE_WEB } from "../lib/marca";
import { TABLAS } from "../lib/datos-abiertos";
import { LISTA_PROVINCIAS, PERIODO, RANKING, modelo, unidades } from "../lib/ventas";

export const metadata: Metadata = metadatos({
  titulo: "Prensa: datos de ventas de coches por provincia para descargar",
  descripcion:
    "Datos de matriculaciones de coches en España y en cada provincia, en CSV y con licencia CC BY 4.0, y el mapa del coche más vendido en cada provincia. Libres para publicar citando la fuente.",
  ruta: "/prensa",
});

// El mapa es una imagen fija: se regenera a mano cuando se actualiza la nota de prensa
const MAPA = "/prensa/mapa-coche-mas-vendido-por-provincia.png";
const MAPA_PERIODO = "de noviembre de 2025 a octubre de 2026";

export default function Prensa() {
  const lider = modelo(RANKING[0]);
  // Cuántas provincias gana cada modelo
  const gana = new Map<string, number>();
  for (const p of LISTA_PROVINCIAS) gana.set(p.ranking[0][0], (gana.get(p.ranking[0][0]) ?? 0) + 1);
  const [masProvincias, nProvincias] = [...gana].sort((a, b) => b[1] - a[1])[0];

  return (
    <MarcoPagina>
      <div className={styles.texto}>
        <h1 className={styles.h1}>Prensa y datos abiertos</h1>
        <p>
          Si eres periodista o investigas el mercado del coche, aquí tienes los datos de{" "}
          {NOMBRE_WEB} para descargar y publicar. Son las matriculaciones de turismos{" "}
          {PERIODO}, elaboradas a partir de los datos abiertos de la DGT y actualizadas cada mes.
        </p>

        <h2>Titulares de este mes</h2>
        <ul>
          <li>
            El coche nuevo más vendido de España es el {lider.nombre}, con {unidades(lider.nuevos)}{" "}
            unidades.
          </li>
          <li>
            El {modelo(masProvincias).nombre} es el más vendido en {nProvincias} de las 52
            provincias.
          </li>
          <li>
            El ranking completo de España y de cada provincia está en{" "}
            <Link href="/mas-vendidos">Coches más vendidos</Link>.
          </li>
        </ul>

        <h2>Descargas</h2>
        <ul>
          {Object.entries(TABLAS).map(([archivo, t]) => (
            <li key={archivo}>
              <a href={`/prensa/datos/${archivo}`} download>
                {t.titulo} (CSV)
              </a>
              : {t.descripcion}
            </li>
          ))}
          <li>
            <a href={MAPA} download>
              Mapa del coche más vendido en cada provincia (PNG, 1600 × 1250)
            </a>
            : datos {MAPA_PERIODO}.
          </li>
        </ul>
        <p>
          Los CSV usan punto y coma como separador y se abren directamente con Excel o con
          LibreOffice. «Nuevos» son coches matriculados por primera vez; «usados importados», los
          que llegan de otro país y se matriculan en España. Más detalles en la{" "}
          <Link href="/metodologia">metodología</Link>.
        </p>

        <h2>Licencia: puedes publicarlos</h2>
        <p>
          Las tablas de datos y el mapa de esta página se publican con licencia{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.es" target="_blank" rel="noopener noreferrer">
            Creative Commons Reconocimiento 4.0 (CC BY 4.0)
          </a>
          : puedes copiarlos, publicarlos y adaptarlos, también con fines comerciales, siempre
          que cites la fuente. Por ejemplo:
        </p>
        <blockquote style={{ margin: "12px 0", padding: "12px 16px", borderLeft: "3px solid var(--color)", background: "var(--tenue)", borderRadius: 8 }}>
          Fuente: {NOMBRE_WEB} ({SITE_URL.replace(/^https?:\/\//, "")}) a partir de datos de la
          DGT.
        </blockquote>
        <p>
          Si lo publicas en internet, agradecemos un enlace a{" "}
          <Link href="/mas-vendidos">la página del ranking</Link>.
        </p>
        <p>
          <small>
            <FuenteDgt datos="ventas" />
          </small>
        </p>

        <h2>Contacto</h2>
        <p>
          ¿Necesitas otro cruce de datos (un modelo concreto, una comunidad, la evolución por
          meses)? Escribe a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> y te lo
          preparamos.
        </p>
      </div>
    </MarcoPagina>
  );
}
