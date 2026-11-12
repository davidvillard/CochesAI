import { NOMBRE_WEB } from "../lib/marca";
import { fechaLarga } from "../lib/formato";
import { ACTUALIZADO, FUENTE_DGT, PERIODO } from "../lib/ventas";
import { FECHA_ULTIMA_OFICIAL } from "../lib/matricula";

// Cita de los datos de la DGT, igual en todas las páginas que los usan.
// Cumple las condiciones de reutilización de datos públicos (Ley 37/2007):
// citar el origen, indicar la fecha de los datos y no dar a entender que la
// DGT participa en el análisis o lo respalda.
export default function FuenteDgt({ datos }: { datos: "ventas" | "matriculas" }) {
  const enlace = (
    <a href={FUENTE_DGT} target="_blank" rel="noopener noreferrer">
      microdatos de matriculaciones
    </a>
  );
  return datos === "ventas" ? (
    <>
      Origen de los datos: Dirección General de Tráfico (DGT), {enlace}, datos {PERIODO} descargados el{" "}
      {fechaLarga(ACTUALIZADO)}. Elaboración propia de {NOMBRE_WEB}: la DGT no participa en este análisis ni lo
      respalda.
    </>
  ) : (
    <>
      Origen de los datos desde 2015: Dirección General de Tráfico (DGT), {enlace}, último dato publicado del{" "}
      {fechaLarga(FECHA_ULTIMA_OFICIAL.toISOString())}. Elaboración propia de {NOMBRE_WEB}: la DGT no participa en
      este cálculo ni lo respalda.
    </>
  );
}
