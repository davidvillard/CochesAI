import type { Ficha } from "./fichas";

// Precio orientativo de un coche usado a partir de su ficha.
// La ficha da el rango habitual de anuncios (del ejemplar más viejo al más nuevo) y los
// años de cada generación. El precio parte del máximo (el ejemplar más nuevo), baja un
// porcentaje fijo por cada año de antigüedad y se ajusta por kilómetros y estado. Es una estimación: no sustituye a mirar anuncios reales.

export type Estado = "muy-bueno" | "normal" | "defectos";
export const ESTADOS: Record<Estado, { texto: string; factor: number }> = {
  "muy-bueno": { texto: "Muy bueno, sin golpes ni averías", factor: 1.05 },
  normal: { texto: "Normal para su edad", factor: 1 },
  defectos: { texto: "Con golpes o averías que reparar", factor: 0.85 },
};

const KM_ANIO = 13_000; // kilómetros medios al año en España, aproximados
const MARGEN = 0.12; // ancho del rango alrededor del precio central
const DEPRECIACION = 0.07; // pérdida de valor por año, media de los coches usados

// "2019-presente" -> [2019, año actual]; "2011 - 2019" -> [2011, 2019]
function anios(texto: string, actual: number): [number, number] | null {
  const n = (texto.match(/(19|20)\d{2}/g) ?? []).map(Number);
  if (!n.length) return null;
  const fin = /present|actual|hoy/i.test(texto) ? actual : Math.max(...n);
  return [Math.min(...n), Math.min(fin, actual)];
}

// Primer y último año en que se vendió el modelo, según sus generaciones
export function aniosModelo(f: Pick<Ficha, "generaciones">, actual = new Date().getFullYear()) {
  const r = f.generaciones.map((g) => anios(g.anios, actual)).filter((x): x is [number, number] => !!x);
  if (!r.length) return null;
  return { desde: Math.min(...r.map((x) => x[0])), hasta: Math.max(...r.map((x) => x[1])) };
}

export type Tasacion = {
  min: number;
  max: number;
  central: number;
  kmEsperados: number;
  fueraDeAnios: boolean;
  anuncio?: { precio: number; veredicto: "sospechoso" | "barato" | "normal" | "caro" };
};

const redondeo = (n: number) => Math.round(n / 100) * 100;

export function tasar(
  f: Pick<Ficha, "generaciones" | "precioSegundaManoEur">,
  anio: number,
  km: number,
  estado: Estado,
  precioAnuncio?: number,
  actual = new Date().getFullYear()
): Tasacion | null {
  const { min, max } = f.precioSegundaManoEur;
  const a = aniosModelo(f, actual);
  if (!(min > 0) || !(max > min) || !a) return null;

  // El máximo del rango es el ejemplar más nuevo; desde ahí pierde un 7 % por año,
  // sin bajar mucho del mínimo habitual de los anuncios
  const antiguedad = Math.max(a.hasta - anio, 0);
  let precio = Math.max(max * Math.pow(1 - DEPRECIACION, antiguedad), min * 0.85);

  // Kilómetros: cada 10.000 km por encima o por debajo de lo normal, un 2,5 % menos o más
  const edad = Math.max(actual - anio + 0.5, 0.5);
  const kmEsperados = Math.round((KM_ANIO * edad) / 1000) * 1000;
  const factorKm = Math.min(Math.max(1 - (0.025 * (km - kmEsperados)) / 10_000, 0.75), 1.1);
  precio *= factorKm * ESTADOS[estado].factor;

  const r: Tasacion = {
    central: redondeo(precio),
    min: redondeo(precio * (1 - MARGEN)),
    max: redondeo(precio * (1 + MARGEN)),
    kmEsperados,
    fueraDeAnios: anio < a.desde || anio > a.hasta,
  };
  if (precioAnuncio && precioAnuncio > 0) {
    const veredicto =
      precioAnuncio < r.min * 0.75
        ? "sospechoso"
        : precioAnuncio < r.min
          ? "barato"
          : precioAnuncio > r.max * 1.1
            ? "caro"
            : "normal";
    r.anuncio = { precio: precioAnuncio, veredicto };
  }
  return r;
}
