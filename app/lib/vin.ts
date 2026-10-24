// Lectura del número de bastidor (VIN, ISO 3779). Todo en el navegador.
// Posiciones: 1-3 fabricante (WMI), 4-8 descripción del modelo (propia de cada
// marca), 9 dígito de control (obligatorio solo en Norteamérica), 10 año de modelo
// (en Europa no es obligatorio), 11 planta, 12-17 número de serie.

// Fabricantes frecuentes en España. Solo códigos contrastados; el resto se
// identifica por país.
const FABRICANTES: Record<string, string> = {
  VSS: "SEAT / Cupra", VWV: "Volkswagen (España)", VS6: "Ford (España)", VSX: "Opel (España)",
  VS7: "Citroën (España)", WVW: "Volkswagen", WV1: "Volkswagen Vehículos Comerciales",
  WV2: "Volkswagen (furgonetas y monovolúmenes)", WAU: "Audi", WUA: "Audi Sport", TRU: "Audi (Hungría)",
  WBA: "BMW", WBS: "BMW M", WBY: "BMW i", WMW: "MINI", WDB: "Mercedes-Benz", WDD: "Mercedes-Benz",
  WDC: "Mercedes-Benz (SUV)", W1K: "Mercedes-Benz", W1N: "Mercedes-Benz (SUV)", WME: "smart",
  WP0: "Porsche", WP1: "Porsche (SUV)", W0L: "Opel", W0V: "Opel", WF0: "Ford (Alemania)",
  VF1: "Renault", UU1: "Dacia", VF3: "Peugeot", VR3: "Peugeot", VF7: "Citroën", VR7: "Citroën",
  VR1: "DS Automobiles", TMB: "Škoda", ZFA: "Fiat", ZAR: "Alfa Romeo", ZFF: "Ferrari",
  ZHW: "Lamborghini", ZAM: "Maserati", SAJ: "Jaguar", SAL: "Land Rover", YV1: "Volvo",
  VNK: "Toyota (Francia)", SB1: "Toyota (Reino Unido)", JHM: "Honda", SHH: "Honda (Reino Unido)",
  JN1: "Nissan", SJN: "Nissan (Reino Unido)", KMH: "Hyundai", TMA: "Hyundai (Chequia)",
  KNA: "Kia", KNE: "Kia", U5Y: "Kia (Eslovaquia)", JMZ: "Mazda", JMB: "Mitsubishi",
  TSM: "Suzuki (Hungría)", "5YJ": "Tesla (EE. UU.)", LRW: "Tesla (China)", XP7: "Tesla (Alemania)",
  LSJ: "MG (SAIC)",
};
// Prefijos de dos caracteres de un solo fabricante
const FABRICANTES_2: Record<string, string> = { JT: "Toyota", JS: "Suzuki" };

// País de fabricación por los dos primeros caracteres (rangos ISO 3779)
const PAISES: [string, string, string][] = [
  ["VS", "VW", "España"], ["VF", "VR", "Francia"], ["VA", "VE", "Austria"], ["WA", "W0", "Alemania"],
  ["ZA", "ZR", "Italia"], ["SA", "SM", "Reino Unido"], ["SU", "SZ", "Polonia"], ["TA", "TH", "Suiza"],
  ["TJ", "TP", "Chequia"], ["TR", "TV", "Hungría"], ["U5", "U7", "Eslovaquia"], ["UU", "U1", "Rumanía"],
  ["YA", "YE", "Bélgica"], ["YF", "YK", "Finlandia"], ["YS", "YW", "Suecia"], ["XL", "XR", "Países Bajos"],
  ["XS", "XW", "Rusia"], ["NL", "NR", "Turquía"], ["MA", "ME", "India"], ["KL", "KR", "Corea del Sur"],
  ["JA", "J0", "Japón"], ["LA", "L0", "China"], ["1A", "10", "Estados Unidos"], ["4A", "40", "Estados Unidos"],
  ["5A", "50", "Estados Unidos"], ["2A", "20", "Canadá"], ["3A", "3W", "México"], ["9A", "9E", "Brasil"],
];

// Fábricas con un código fuera del rango de su país
const PAIS_WMI: Record<string, string> = { XP7: "Alemania" };

// Orden de caracteres dentro de cada rango (ISO 3779): A-Z sin I, O, Q y luego 1-9, 0
const ORDEN = "ABCDEFGHJKLMNPRSTUVWXYZ1234567890";
const enRango = (dos: string, desde: string, hasta: string) =>
  dos[0] === desde[0] &&
  ORDEN.indexOf(dos[1]) >= ORDEN.indexOf(desde[1]) &&
  ORDEN.indexOf(dos[1]) <= ORDEN.indexOf(hasta[1]);

// Año de modelo (posición 10): ciclo de 30 años. En Europa no es obligatorio y
// muchas marcas (Mercedes, BMW...) no lo usan; solo se da cuando es fiable.
const ANIO_FIABLE = new Set([
  "VSS", "VWV", "WVW", "WV1", "WV2", "WAU", "WUA", "TRU", "TMB", // grupo Volkswagen
  "KMH", "TMA", "KNA", "KNE", "U5Y", "5YJ", "LRW", "XP7", // Hyundai, Kia, Tesla
]);
const anioFiable = (vin: string) => /^[1-5KL]/.test(vin) || ANIO_FIABLE.has(vin.slice(0, 3));
const ANIOS = "ABCDEFGHJKLMNPRSTVWXY123456789";

const PESOS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const VALOR = (c: string) =>
  /\d/.test(c) ? Number(c) : "ABCDEFGH".includes(c) ? "ABCDEFGH".indexOf(c) + 1
  : "JKLMN".includes(c) ? "JKLMN".indexOf(c) + 1 : c === "P" ? 7 : c === "R" ? 9
  : "STUVWXYZ".indexOf(c) + 2;

export type LecturaVin =
  | { valido: false; motivo: string }
  | {
      valido: true;
      vin: string;
      fabricante?: string;
      pais?: string;
      anios: number[]; // posibles años de modelo, el más probable primero (vacío si no se sabe)
      control: "correcto" | "incorrecto" | "no aplica";
      partes: { wmi: string; vds: string; control: string; anio: string; planta: string; serie: string };
    };

export function leerVin(entrada: string, hoy = new Date()): LecturaVin {
  const vin = entrada.toUpperCase().replace(/[\s-]/g, "");
  if (vin.length !== 17) {
    return { valido: false, motivo: `El bastidor tiene 17 caracteres y has escrito ${vin.length}.` };
  }
  if (/[IOQ]/.test(vin)) {
    return { valido: false, motivo: "Los bastidores no usan las letras I, O ni Q (se confunden con 1 y 0)." };
  }
  if (!/^[A-Z0-9]+$/.test(vin)) {
    return { valido: false, motivo: "Solo puede tener letras y números." };
  }

  const wmi = vin.slice(0, 3);
  const pais =
    PAIS_WMI[wmi] ?? PAISES.find(([d, h]) => enRango(vin.slice(0, 2), d, h))?.[2];
  const fabricante = FABRICANTES[wmi] ?? FABRICANTES_2[vin.slice(0, 2)];

  // Año: el código se repite cada 30 años; se dan las opciones que no son futuras
  const pos = ANIOS.indexOf(vin[9]);
  const limite = hoy.getFullYear() + 1;
  const anios =
    pos === -1 || !anioFiable(vin)
      ? []
      : [1980 + pos, 2010 + pos].filter((a) => a <= limite).reverse();

  // Dígito de control: solo es obligatorio en vehículos fabricados para Norteamérica
  const norteamerica = /^[1-5]/.test(vin);
  let control: "correcto" | "incorrecto" | "no aplica" = "no aplica";
  if (norteamerica) {
    const suma = [...vin].reduce((s, c, i) => s + VALOR(c) * PESOS[i], 0) % 11;
    control = (suma === 10 ? "X" : String(suma)) === vin[8] ? "correcto" : "incorrecto";
  }

  return {
    valido: true,
    vin,
    fabricante,
    pais,
    anios,
    control,
    partes: {
      wmi,
      vds: vin.slice(3, 8),
      control: vin[8],
      anio: vin[9],
      planta: vin[10],
      serie: vin.slice(11),
    },
  };
}
