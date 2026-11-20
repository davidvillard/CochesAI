import type { Metadata } from "next";
import Link from "next/link";
import { metadatos } from "../lib/seo";
import MarcoPagina from "../components/MarcoPagina";
import styles from "../legal.module.css";

export const metadata: Metadata = metadatos({
  titulo: "Glosario del coche: VIN, TDI, PHEV, Euro 6 y más",
  descripcion:
    "Qué significan las siglas que verás en un anuncio o en la ficha de un coche: VIN, TDI, TSI, híbrido, PHEV, SUV, normas Euro, ITV, ITP y etiqueta ambiental, explicado fácil.",
  ruta: "/glosario",
});

// Términos de los anuncios y de las fichas, explicados para quien no sabe de coches
const TERMINOS: { t: string; d: React.ReactNode }[] = [
  {
    t: "VIN o número de bastidor",
    d: (
      <>
        Código de 17 letras y números que identifica cada coche, como su DNI. Está en la ficha
        técnica, en la base del parabrisas y en el marco de la puerta. Sirve para pedir el historial
        y comprobar que el coche es el que dice el anuncio. <Link href="/bastidor">Descodifica un VIN</Link>.
      </>
    ),
  },
  {
    t: "TDI, HDi, dCi, CRDi, BlueHDi",
    d: "Nombres que cada marca da a sus motores diésel con turbo e inyección directa. TDI es de Volkswagen, Seat, Skoda y Audi; HDi y BlueHDi, de Peugeot y Citroën; dCi, de Renault y Dacia; CRDi, de Hyundai y Kia.",
  },
  {
    t: "TSI, TFSI, PureTech, TCe, T-GDI",
    d: "Lo mismo en gasolina: motores de gasolina con turbo. TSI y TFSI son del grupo Volkswagen; PureTech, de Peugeot, Citroën y Opel; TCe, de Renault y Dacia; T-GDI, de Hyundai y Kia.",
  },
  {
    t: "Híbrido (HEV) o «autorrecargable»",
    d: "Coche con motor de gasolina y uno eléctrico pequeño que se carga solo al frenar. No se enchufa. Gasta poco en ciudad y lleva etiqueta ECO.",
  },
  {
    t: "Microhíbrido (MHEV o mild hybrid)",
    d: "Un motor normal con un pequeño sistema eléctrico de 12 o 48 voltios que ayuda al arrancar. Ahorra algo de combustible y suele llevar etiqueta ECO, pero no se mueve solo con electricidad.",
  },
  {
    t: "Híbrido enchufable (PHEV)",
    d: "Híbrido con una batería más grande que se carga en un enchufe y permite hacer unos 40 a 80 km solo en eléctrico. Si lo cargas a menudo gasta muy poco; si no, gasta como un gasolina. Con más de 40 km de autonomía eléctrica lleva etiqueta Cero.",
  },
  {
    t: "Eléctrico (BEV o EV)",
    d: "Solo tiene motor eléctrico y batería. Se carga en un enchufe o en un cargador rápido. Lleva etiqueta Cero. Lo importante al comprarlo de segunda mano es la autonomía real y el estado de la batería.",
  },
  {
    t: "SUV y crossover",
    d: "Coches más altos que un turismo normal, con aspecto de todoterreno pero casi siempre con tracción solo delantera. Crossover suele llamarse a los más pequeños o con forma más de turismo.",
  },
  {
    t: "Normas Euro (Euro 4, Euro 5, Euro 6…)",
    d: "Límites de contaminación que debe cumplir un coche según el año en que se fabricó. Cuanto más alto el número, más moderno y menos contaminante. De ellas depende la etiqueta ambiental.",
  },
  {
    t: "Etiqueta ambiental (Cero, ECO, C, B)",
    d: (
      <>
        Pegatina de la DGT que clasifica el coche por lo que contamina. Decide si puedes entrar en
        las zonas de bajas emisiones de las ciudades. Los coches sin etiqueta (gasolina antes de
        2001 y diésel antes de 2006, más o menos) son los más limitados.{" "}
        <Link href="/matricula">Calcula la etiqueta por matrícula</Link>.
      </>
    ),
  },
  {
    t: "ITV",
    d: (
      <>
        Inspección técnica obligatoria que revisa que el coche es seguro. La primera a los 4 años,
        después cada 2 y, a partir de los 10 años, cada año. <Link href="/itv">Calcula cuándo le toca</Link>.
      </>
    ),
  },
  {
    t: "ITP",
    d: (
      <>
        Impuesto que paga el comprador de un coche de segunda mano entre particulares. Lo cobra
        cada comunidad autónoma y depende del valor oficial del coche, no del precio pagado.{" "}
        <Link href="/calculadora-itp">Calcula cuánto pagarás</Link>.
      </>
    ),
  },
  {
    t: "CV y kW",
    d: "Dos formas de medir la potencia del motor. 1 kW son unos 1,36 CV: un coche de 100 kW tiene unos 136 CV. En la ficha técnica también aparecen los «CV fiscales», que no son la potencia sino un número que sirve para calcular impuestos.",
  },
  {
    t: "Cambio automático, DSG, EDC, CVT",
    d: "Cajas de cambios que cambian solas. DSG (Volkswagen) y EDC (Renault) son de doble embrague: rápidas, pero conviene probar que no dan tirones. CVT es la de variador continuo que usan muchos híbridos.",
  },
  {
    t: "Distribución por correa o por cadena",
    d: "Pieza que sincroniza el motor. Si es de correa hay que cambiarla cada cierto número de kilómetros o años, y es una reparación cara: al comprar, pregunta si ya está hecha.",
  },
];

export default function Glosario() {
  return (
    <MarcoPagina>
      <div className={styles.texto}>
        <h1 className={styles.h1}>Glosario del coche</h1>
        <p>
          Las siglas que verás en los anuncios y en nuestras fichas, explicadas sin tecnicismos.
        </p>
        <dl>
          {TERMINOS.map(({ t, d }) => (
            <div key={t} style={{ marginBottom: 18 }}>
              <dt>
                <strong>{t}</strong>
              </dt>
              <dd style={{ margin: "4px 0 0" }}>{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </MarcoPagina>
  );
}
