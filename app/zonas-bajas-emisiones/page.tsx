import type { Metadata } from "next";
import Link from "next/link";
import { metadatos } from "../lib/seo";
import MarcoPagina from "../components/MarcoPagina";
import styles from "../legal.module.css";

export const metadata: Metadata = metadatos({
  titulo: "Zonas de bajas emisiones (ZBE): dónde consultar las normas de cada ciudad",
  descripcion:
    "Qué es una zona de bajas emisiones, qué etiqueta necesitas y enlaces a las webs oficiales de las ZBE de Madrid, Barcelona, Valencia, Zaragoza, Málaga, Bilbao y otras ciudades.",
  ruta: "/zonas-bajas-emisiones",
});

// Solo webs oficiales (ayuntamientos y Ministerio), comprobadas en noviembre de 2026.
// Las normas cambian a menudo, así que aquí no se copian: se enlaza a quien las dicta.
const MAPA_MITECO =
  "https://www.miteco.gob.es/es/calidad-y-evaluacion-ambiental/temas/movilidad/zonas_de_bajas_emisiones_en_espana.html";

const CIUDADES: [string, string][] = [
  ["Madrid", "https://www.madrid.es/portales/munimadrid/es/Inicio/Movilidad-y-transportes/Zonas-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones/Madrid-Zona-de-Bajas-Emisiones-ZBE-/?vgnextfmt=default&vgnextoid=93e63877029eb710VgnVCM1000001d4a900aRCRD&vgnextchannel=d2d2edf0f70ab710VgnVCM2000001f4a900aRCRD"],
  ["Barcelona (Rondes y área metropolitana)", "https://www.zbe.barcelona/"],
  ["Valencia", "https://www.valencia.es/cas/movilidad/inicio/-/content/inicio-3?uid=19262079"],
  ["Zaragoza", "https://www.zaragoza.es/sede/portal/movilidad/bajas-emisiones/"],
  ["Málaga", "https://movilidad.malaga.eu/es/servicios/zona-bajas-emisiones/"],
  ["Bilbao", "https://www.bilbao.eus/zbe/"],
  ["Valladolid (ordenanza)", "https://www.valladolid.es/en/ayuntamiento/organizacion-administrativa/areas/area-medio-ambiente/utilidad/normativas/ordenanza-regula-zona-bajas-emisiones-municipio-valladolid"],
  ["Vitoria-Gasteiz", "https://www.vitoria-gasteiz.org/wb021/was/contenidoAction.do?uid=u7627e050_18b933a5b58__2031&abreviada"],
  ["Donostia / San Sebastián", "https://www.donostia.eus/es/movilidad/zona-bajas-emisiones"],
];

export default function ZonasBajasEmisiones() {
  return (
    <MarcoPagina>
      <div className={styles.texto}>
        <h1 className={styles.h1}>Zonas de bajas emisiones</h1>
        <p>
          Una zona de bajas emisiones (ZBE) es una parte de la ciudad donde solo pueden circular
          algunos coches según su etiqueta ambiental de la DGT. La ley obliga a tenerla a los
          municipios de más de 50.000 habitantes, y cada ayuntamiento decide qué etiquetas entran,
          en qué horario, desde cuándo y qué excepciones hay (vecinos, aparcamientos, personas con
          movilidad reducida…).
        </p>
        <p>
          Lo primero es saber qué etiqueta tiene tu coche:{" "}
          <Link href="/matricula">calcúlala con la matrícula</Link>. Los coches sin etiqueta
          (en general, gasolina de antes de 2001 y diésel de antes de 2006) son los que tienen
          más restricciones.
        </p>

        <h2>Todas las ciudades</h2>
        <p>
          El Ministerio para la Transición Ecológica tiene un{" "}
          <a href={MAPA_MITECO} target="_blank" rel="noopener noreferrer">
            mapa con las ZBE de toda España
          </a>
          , con las vigentes, las que están en trámite y enlaces a la normativa de cada municipio.
        </p>

        <h2>Webs oficiales de las principales ciudades</h2>
        <p>
          Las normas cambian a menudo y pueden estar recurridas en los tribunales, así que
          consúltalas siempre en la web del ayuntamiento antes de ir:
        </p>
        <ul>
          {CIUDADES.map(([ciudad, url]) => (
            <li key={ciudad}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {ciudad}
              </a>
            </li>
          ))}
        </ul>
        <p>
          ¿Tu ciudad no está? Búscala en el mapa del Ministerio o en la web de tu ayuntamiento.
        </p>

        <h2>Antes de comprar un coche</h2>
        <p>
          Si vives o trabajas dentro de una ZBE, la etiqueta pesa mucho en el valor del coche: un
          diésel barato sin etiqueta puede salir caro si no puedes usarlo. Mira la etiqueta de
          cada modelo en nuestras <Link href="/coches">fichas</Link> y revisa la{" "}
          <Link href="/checklist-compra-coche">checklist de compra</Link>.
        </p>
      </div>
    </MarcoPagina>
  );
}
