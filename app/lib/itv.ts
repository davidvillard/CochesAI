// Cuándo toca la ITV, según la periodicidad del Real Decreto 920/2017 (art. 6)
// para vehículos de uso particular. Todo se calcula en el navegador.

export type TipoItv = "turismo" | "moto" | "furgoneta";

type Tramo = { hasta: number; meses: number }; // hasta: años de antigüedad (sin incluir)

// primera: años exento desde la matriculación; tramos: cada cuántos meses después
const REGLAS: Record<TipoItv, { nombre: string; primera: number; tramos: Tramo[]; texto: string }> = {
  turismo: {
    nombre: "Turismo (coche particular)",
    primera: 4,
    tramos: [
      { hasta: 10, meses: 24 },
      { hasta: Infinity, meses: 12 },
    ],
    texto: "Exento hasta los 4 años, cada 2 años hasta los 10 y cada año a partir de los 10.",
  },
  moto: {
    nombre: "Moto",
    primera: 4,
    tramos: [{ hasta: Infinity, meses: 24 }],
    texto: "Exenta hasta los 4 años y después cada 2 años, sin importar la antigüedad.",
  },
  furgoneta: {
    nombre: "Furgoneta ligera (hasta 3.500 kg)",
    primera: 2,
    tramos: [
      { hasta: 6, meses: 24 },
      { hasta: 10, meses: 12 },
      { hasta: Infinity, meses: 6 },
    ],
    texto: "Exenta hasta los 2 años, cada 2 años hasta los 6, cada año hasta los 10 y cada 6 meses después.",
  },
};

export const TIPOS_ITV = (Object.keys(REGLAS) as TipoItv[]).map((id) => ({ id, ...REGLAS[id] }));

const sumarMeses = (d: Date, meses: number) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + meses);
  return r;
};

// Antigüedad en años contando meses completos (exacta en las fechas de vencimiento)
function aniosEntre(desde: Date, hasta: Date) {
  let meses = (hasta.getFullYear() - desde.getFullYear()) * 12 + hasta.getMonth() - desde.getMonth();
  if (hasta.getDate() < desde.getDate()) meses--;
  return meses / 12;
}

// Meses hasta la siguiente ITV para un vehículo de esa antigüedad
function periodo(tipo: TipoItv, antiguedad: number) {
  return REGLAS[tipo].tramos.find((t) => antiguedad < t.hasta)!.meses;
}

export type ResultadoItv = {
  proxima: Date;
  dias: number; // negativo si ya ha caducado
  porFecha: boolean; // true si se ha calculado sin la fecha de la última ITV
  primera: boolean; // true si aún no ha pasado ninguna
  periodicidad: string;
};

export function proximaItv(
  tipo: TipoItv,
  matriculacion: Date,
  ultima?: Date,
  hoy = new Date()
): ResultadoItv {
  const r = REGLAS[tipo];
  const primeraFecha = sumarMeses(matriculacion, r.primera * 12);
  let proxima: Date;
  let porFecha = false;

  if (ultima && ultima >= matriculacion) {
    // Desde la última ITV favorable, según la antigüedad que tenía entonces
    proxima = sumarMeses(ultima, periodo(tipo, aniosEntre(matriculacion, ultima)));
  } else if (primeraFecha > hoy) {
    proxima = primeraFecha;
  } else {
    // Sin la fecha de la última: se supone que la ha pasado siempre en su fecha
    porFecha = true;
    proxima = primeraFecha;
    while (proxima <= hoy) {
      proxima = sumarMeses(proxima, periodo(tipo, aniosEntre(matriculacion, proxima)));
    }
  }

  const dias = Math.ceil((proxima.getTime() - hoy.getTime()) / (24 * 3600 * 1000));
  const meses = periodo(tipo, aniosEntre(matriculacion, proxima));
  return {
    proxima,
    dias,
    porFecha,
    primera: !ultima && primeraFecha > hoy,
    periodicidad: meses === 24 ? "cada 2 años" : meses === 12 ? "cada año" : "cada 6 meses",
  };
}
