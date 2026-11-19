import type { Metadata } from "next";
import Link from "next/link";
import { metadatos } from "../lib/seo";
import PaginaLegal from "../components/PaginaLegal";
import { LEGAL } from "../datos-legales";
import { NOMBRE_WEB } from "../lib/marca";
import { fechaLarga } from "../lib/formato";
import { ACTUALIZADO, FUENTE_DGT, PERIODO } from "../lib/ventas";
import { FECHA_ULTIMA_OFICIAL } from "../lib/matricula";

export const metadata: Metadata = metadatos({
  titulo: "Metodología y fuentes de los datos",
  descripcion:
    "De dónde salen los datos de ¿Qué coche es?: ventas de coches con datos abiertos de la DGT, fechas de matrículas, ITP, ITV y fichas de coches elaboradas con IA. Cómo se hacen y sus limitaciones.",
  ruta: "/metodologia",
});

export default function Metodologia() {
  return (
    <PaginaLegal titulo="Metodología y fuentes">
      <p>
        {NOMBRE_WEB} es un proyecto independiente hecho en España para ayudar a quien va a comprar
        o simplemente quiere saber qué coche tiene delante. No vendemos coches ni trabajamos para
        ninguna marca. Aquí explicamos de dónde sale cada dato y hasta dónde puedes fiarte de él.
      </p>

      <h2>1. Ventas de coches (datos de la DGT)</h2>
      <p>
        Los rankings de <Link href="/mas-vendidos">coches más vendidos</Link>, las páginas por
        provincia y el bloque «¿Cuántos se venden?» de cada ficha salen de los{" "}
        <a href={FUENTE_DGT} target="_blank" rel="noopener noreferrer">
          microdatos de matriculaciones de la DGT
        </a>
        , que la Dirección General de Tráfico publica cada mes como datos abiertos y que se pueden
        reutilizar citando su origen (Ley 37/2007). Cada fichero recoge todos los vehículos
        matriculados ese mes, uno por línea. Los rankings y cálculos son elaboración propia de{" "}
        {NOMBRE_WEB}: la DGT no participa en ellos ni los respalda.
      </p>
      <ul>
        <li>
          Contamos turismos y todoterrenos con matriculación ordinaria, nuevos y usados
          importados. Los rankings de «más vendidos» solo cuentan coches nuevos.
        </li>
        <li>
          Agrupamos todas las versiones de un modelo: «SEAT LEON SP E-HYBRID» y «LEON» cuentan
          como Seat León. Por eso las cifras pueden no coincidir al detalle con las de las
          patronales, que usan otros criterios.
        </li>
        <li>
          La provincia es la del domicilio del vehículo. Las empresas de alquiler y renting
          concentran muchos coches en Madrid.
        </li>
        <li>
          Datos actuales: {PERIODO}. Última descarga: {fechaLarga(ACTUALIZADO)}. Se actualizan
          una vez al mes.
        </li>
      </ul>

      <h2>2. Año y etiqueta por matrícula</h2>
      <p>
        Las matrículas actuales se asignan en orden en toda España. Para saber de qué fecha es una
        matrícula usamos las letras de la última matrícula asignada que la DGT publica en sus
        microdatos (desde 2015; último dato: {fechaLarga(FECHA_ULTIMA_OFICIAL.toISOString())}) y
        tablas públicas para 2000-2014. Es una fecha aproximada, con un margen de semanas, y un
        coche importado puede ser más antiguo de lo que indica. La etiqueta ambiental se calcula
        según el combustible y la fecha; la oficial se consulta en la sede de la DGT. La matrícula
        que escribes no sale de tu navegador.
      </p>

      <h2>3. Calculadoras de ITP, transferencia e ITV</h2>
      <ul>
        <li>
          ITP: tipos de cada comunidad autónoma y tabla de depreciación por antigüedad del Anexo
          IV de la Orden HAC/1501/2025 (BOE). Las bonificaciones y casos especiales cambian a
          menudo: confirma el importe con tu comunidad antes de pagar.
        </li>
        <li>Transferencia: ITP, tasa de la DGT (55,70 €; 27,85 € los ciclomotores) y gestoría.</li>
        <li>
          ITV: periodicidad del Real Decreto 920/2017 según el tipo de vehículo y su antigüedad.
        </li>
        <li>
          Bastidor (VIN): estructura de la norma ISO 3779. El año solo se indica cuando la marca
          lo codifica de forma fiable.
        </li>
      </ul>

      <h2>4. Fichas de coches</h2>
      <p>
        Las fichas (resumen, generaciones, motores, precios, fallos comunes y preguntas
        frecuentes) se elaboran con inteligencia artificial (Google Gemini) a partir de
        información pública, con instrucciones de no inventar datos y de dar rangos cuando hay
        dudas. Se crean cuando alguien identifica ese coche o, para los modelos más vendidos según
        la DGT, por adelantado. Cada ficha indica su fecha.
      </p>
      <p>
        Aun así pueden tener errores. Los precios de segunda mano son orientativos y los fallos
        comunes no significan que un coche concreto los vaya a tener: revisa siempre el coche y su
        historial antes de comprar. Si ves un dato incorrecto, escríbenos y lo corregimos.
      </p>

      <h2>5. Identificación por foto</h2>
      <p>
        La foto se analiza con inteligencia artificial (Google Gemini), que indica marca, modelo,
        generación y su seguridad. No guardamos la foto. Puede equivocarse con coches poco
        comunes, muy modificados o fotografiados de lejos; el botón «¿Ha acertado?» nos ayuda a
        medir y mejorar la tasa de acierto.
      </p>

      <h2>6. Contacto y correcciones</h2>
      <p>
        Para avisar de un error o proponer una mejora, escríbenos a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Los datos del
        titular están en el <Link href="/aviso-legal">aviso legal</Link> y el tratamiento de datos
        personales, en la <Link href="/privacidad">política de privacidad</Link>.
      </p>
    </PaginaLegal>
  );
}
