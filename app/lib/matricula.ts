// Cálculos a partir de la matrícula. Todo se hace en el navegador:
// la matrícula no se envía a ningún servidor.

// Primera combinación de letras de cada mes desde septiembre de 2000.
// Es una tabla recopilada por terceros (no oficial), así que la fecha es aproximada.
// Para actualizarla, añade al final los meses nuevos (fuente: seisenlinea.com/edad-matriculas).
const TABLA = `
2000-09 BBB
2000-11 BCD BCY
2001-01 BDR BFJ BGF BHG BJC BKB BLC BMF BMW BNL BPG BRB
2002-01 BRT BSL BTF BTZ BVW BWT BXP BYP BZF BZV CBP CCH
2003-01 CDC CDV CFM CGJ CHF CJC CKB CLD CLV CMM CNK CPF
2004-01 CRC CRV CSS CTT CVR CWR CXT CYY CZP DBJ DCH DDG
2005-01 DFF DFZ DGX DHZ DKB DLD DMJ DNP DPK DRG DSC DTB
2006-01 DVB DVW DWT DXZ DYY FBC FCJ FDP FFK FGF FHD FJD
2007-01 FKC FKY FLV FNB FNZ FRC FSJ FTP FVJ FWC FXB FXY
2008-01 FYY FZR GBN GCK GDH GFC GFY GGV GHG GHT GJJ GJV
2009-01 GKH GKS GLC GLP GMC GMN GNF GNY GPJ GPW GRM GSC
2010-01 GSR GTC GTS GVM GWC GWV GXP GYD GYM GYX GZJ GZT
2011-01 HBG HBP HCB HCR HDC HDR HFF HFT HGC HGM HGX HHH
2012-01 HHT HJC HJM HKB HKL HKX HLK HLW HMD HML HMT HNC
2013-01 HNK HNT HPC HPN HPY HRK HRX HSK HSS HSZ HTK HTV
2014-01 HVF HVN HVZ HWM HXB HXN HYD HYT HZB HZL HZZ JBL
2015-01 JBY JCK JCY JDR JFG JFX JGR JHJ JHT JJH JJW JKK
2016-01 JKZ JLN JMF JMY JNR JPK JRG JRZ JSK JTB JTN JVH
2017-01 JVZ JWN JXF JYB JYT JZP KBM KCH KCT KDH KFC KFW
2018-01 KGN KHG KHY KJV KKR KLN KMM KNK KPD KPS KRJ KRZ
2019-01 KSS KTJ KVB KVX KWT KXR KYN KZK KZY LBN LCG LCY
2020-01 LDR LFH LFY LGG LGH LGP LHG LJD LJR LKF LKV LLJ
2021-01 LMC LML LMX LNN LPD LPW LRP LSF LSP LTD LTP LVD
2022-01 LVV LWD LWR LXD LXS LYJ LYZ LZP LZZ MBN MBZ MCR
2023-01 MDD MDS MFG MFX MGN MHG MHY MJR MKD MKP MLH MLY
2024-01 MMN MNC MNT MPL MRD MRW MSS MTK MTV MVL MWD MWS
2025-01 MXP MYC MYV MZS NBL NCG NDG NFC NFR NGJ NHC NHX
2026-01 NJT NKG NKZ NLZ NMV NNS NPS NRP NSF NSY
`;

// Las matrículas actuales solo usan estas 20 consonantes, en este orden
const LETRAS = "BCDFGHJKLMNPRSTVWXYZ";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Convierte "BCD" en su posición dentro de la serie (BBB = 0)
const indice = (letras: string) =>
  [...letras].reduce((n, l) => n * LETRAS.length + LETRAS.indexOf(l), 0);

// Inversa de indice(): 22 -> "BCD"
const combinacion = (i: number) =>
  [Math.floor(i / 400), Math.floor(i / 20) % 20, i % 20].map((n) => LETRAS[n]).join("");

type Mes = { anio: number; mes: number }; // mes de 0 a 11

const INICIOS: (Mes & { indice: number })[] = TABLA.trim()
  .split("\n")
  .flatMap((linea) => {
    const [inicio, ...combos] = linea.trim().split(/\s+/);
    const [anio, mes] = inicio.split("-").map(Number);
    return combos.map((c, i) => {
      const m = mes - 1 + i;
      return { anio: anio + Math.floor(m / 12), mes: m % 12, indice: indice(c) };
    });
  });

export const ULTIMO_MES = INICIOS[INICIOS.length - 1];

export const nombreMes = ({ anio, mes }: Mes) => `${MESES[mes]} de ${anio}`;

// ---------- Estimación de la matrícula de un día concreto ----------

// Última matrícula oficial conocida (listado diario de la DGT). Actualízala junto
// con la tabla: es el punto de partida para estimar la de hoy y las futuras.
const ULTIMA_OFICIAL = { fecha: "2026-10-23", numero: 1057, letras: "NTM" };

// Puntos conocidos: el día 1 de cada mes y la última oficial (índice con decimales:
// la parte decimal es el número de 4 cifras / 10.000)
const PUNTOS = [
  ...INICIOS.map((m) => ({ t: Date.UTC(m.anio, m.mes, 1), i: m.indice })),
  {
    t: Date.parse(`${ULTIMA_OFICIAL.fecha}T12:00:00Z`),
    i: indice(ULTIMA_OFICIAL.letras) + ULTIMA_OFICIAL.numero / 10000,
  },
];
const DIA = 24 * 3600 * 1000;

export const FECHA_ULTIMA_OFICIAL = new Date(PUNTOS[PUNTOS.length - 1].t);

// Matrículas al día según los últimos 90 días de datos
export const RITMO_DIARIO = (() => {
  const fin = PUNTOS[PUNTOS.length - 1];
  const ini = [...PUNTOS].reverse().find((p) => fin.t - p.t >= 90 * DIA)!;
  return ((fin.i - ini.i) / ((fin.t - ini.t) / DIA)) * 10000;
})();

// Matrícula estimada para una fecha: interpola entre datos conocidos y, después
// del último, sigue al ritmo de los últimos meses
export function estimarMatricula(fecha: Date) {
  const t = fecha.getTime();
  const k = PUNTOS.findIndex((p) => p.t > t);
  let i: number;
  if (k === -1) {
    const fin = PUNTOS[PUNTOS.length - 1];
    i = fin.i + ((t - fin.t) / DIA) * (RITMO_DIARIO / 10000);
  } else if (k === 0) {
    return null; // antes de septiembre de 2000
  } else {
    const a = PUNTOS[k - 1];
    const b = PUNTOS[k];
    i = a.i + ((b.i - a.i) * (t - a.t)) / (b.t - a.t);
  }
  const entero = Math.floor(i);
  if (entero >= LETRAS.length ** 3) return null; // más allá de ZZZ
  const numero = Math.floor((i - entero) * 10000);
  return `${String(numero).padStart(4, "0")} ${combinacion(entero)}`;
}

// Primera combinación de cada año, para la tabla de la página
export const PRIMERA_DEL_ANIO = INICIOS.filter(
  (m, i) => i === 0 || m.anio !== INICIOS[i - 1].anio
).map((m) => ({ ...m, primera: combinacion(m.indice) }));

// Códigos del sistema provincial (hasta septiembre de 2000)
// Posición en la tabla del último mes cuya primera combinación es <= i
function mesDe(i: number) {
  let k = 0;
  while (k + 1 < INICIOS.length && INICIOS[k + 1].indice <= i) k++;
  return k;
}

// ---------- Rangos por letras (páginas /matricula/<letra>) ----------

// Primeras letras ya usadas: de la B a la del último mes conocido
const ultimaLetra = LETRAS.indexOf(
  LETRAS[Math.floor(INICIOS[INICIOS.length - 1].indice / LETRAS.length ** 2)]
);
export const LETRAS_USADAS = [...LETRAS.slice(0, ultimaLetra + 1)];

export type Rango = {
  prefijo: string;
  desde: Mes;
  hasta: Mes | null; // null: todavía se está asignando
};

// Meses en que se asignaron las matrículas que empiezan por un prefijo ("J", "JK")
export function rangoDe(prefijo: string): Rango | null {
  const p = prefijo.toUpperCase();
  if (!p || p.length > 3 || ![...p].every((l) => LETRAS.includes(l))) return null;
  const inicio = indice(p.padEnd(3, "B"));
  const fin = indice(p.padEnd(3, "Z")); // última combinación del prefijo
  const ultimo = INICIOS[INICIOS.length - 1];
  if (inicio > ultimo.indice) return null; // aún no se ha empezado a asignar
  const kDesde = mesDe(inicio);
  // Si el final cae en el último mes de la tabla, puede que siga asignándose
  const kHasta = mesDe(fin);
  return {
    prefijo: p,
    desde: INICIOS[kDesde],
    hasta: kHasta === INICIOS.length - 1 ? null : INICIOS[kHasta],
  };
}

// Subrangos de una letra por su segunda letra: J -> JB, JC, JD...
export function subrangos(letra: string) {
  return [...LETRAS]
    .map((l) => rangoDe(letra + l))
    .filter((r): r is Rango => r !== null);
}

const PROVINCIAS: Record<string, string> = {
  A: "Alicante", AB: "Albacete", AL: "Almería", AV: "Ávila", B: "Barcelona",
  BA: "Badajoz", BI: "Bizkaia", BU: "Burgos", C: "A Coruña", CA: "Cádiz",
  CC: "Cáceres", CE: "Ceuta", CO: "Córdoba", CR: "Ciudad Real", CS: "Castellón",
  CU: "Cuenca", GC: "Las Palmas", GE: "Girona", GI: "Girona", GR: "Granada",
  GU: "Guadalajara", H: "Huelva", HU: "Huesca", IB: "Illes Balears", J: "Jaén",
  L: "Lleida", LE: "León", LO: "La Rioja", LU: "Lugo", M: "Madrid", MA: "Málaga",
  ML: "Melilla", MU: "Murcia", NA: "Navarra", O: "Asturias", OR: "Ourense",
  OU: "Ourense", P: "Palencia", PM: "Illes Balears", PO: "Pontevedra",
  S: "Cantabria", SA: "Salamanca", SE: "Sevilla", SG: "Segovia", SO: "Soria",
  SS: "Gipuzkoa", T: "Tarragona", TE: "Teruel", TF: "Santa Cruz de Tenerife",
  TO: "Toledo", V: "Valencia", VA: "Valladolid", VI: "Álava", Z: "Zaragoza",
  ZA: "Zamora",
};

// Lista de códigos provinciales (sin duplicados de nombre), para su tabla
export const CODIGOS_PROVINCIALES = Object.entries(PROVINCIAS).sort(([, a], [, b]) =>
  a.localeCompare(b, "es")
);

export type Lectura =
  | { tipo: "actual"; texto: string; desde: Mes; posterior: boolean }
  | { tipo: "provincial"; texto: string; provincia: string }
  | { tipo: "invalida"; motivo: string };

export function leerMatricula(entrada: string): Lectura {
  const m = entrada.toUpperCase().replace(/[\s.-]/g, "");
  if (!m) return { tipo: "invalida", motivo: "Escribe una matrícula." };

  const actual = /^(\d{4})([A-Z]{3})$/.exec(m);
  if (actual) {
    const [, numeros, letras] = actual;
    if (![...letras].every((l) => LETRAS.includes(l))) {
      return {
        tipo: "invalida",
        motivo:
          "Las matrículas actuales no llevan vocales, Ñ ni Q. Revisa las letras.",
      };
    }
    const k = mesDe(indice(letras));
    return {
      tipo: "actual",
      texto: `${numeros} ${letras}`,
      desde: INICIOS[k],
      posterior: k === INICIOS.length - 1,
    };
  }

  const provincial = /^([A-Z]{1,2})(\d{1,6})([A-Z]{0,2})$/.exec(m);
  if (provincial && PROVINCIAS[provincial[1]]) {
    const [, codigo, numeros, letras] = provincial;
    return {
      tipo: "provincial",
      texto: [codigo, numeros, letras].filter(Boolean).join("-"),
      provincia: PROVINCIAS[codigo],
    };
  }

  return {
    tipo: "invalida",
    motivo:
      "No reconozco el formato. Escribe 4 números y 3 letras (1234 BCD) o una matrícula provincial antigua (M-1234-AB).",
  };
}

// Años completos entre el mes de matriculación y hoy
export function antiguedad({ anio, mes }: Mes, hoy = new Date()) {
  const meses = (hoy.getFullYear() - anio) * 12 + hoy.getMonth() - mes;
  return Math.max(0, Math.floor(meses / 12));
}

// ---------- Etiqueta ambiental ----------

export const COMBUSTIBLES = [
  { id: "gasolina", nombre: "Gasolina" },
  { id: "diesel", nombre: "Diésel" },
  { id: "hibrido", nombre: "Híbrido no enchufable" },
  { id: "gas", nombre: "Gas (GLP o GNC)" },
  { id: "enchufable", nombre: "Híbrido enchufable (menos de 40 km eléctricos)" },
  { id: "enchufable40", nombre: "Híbrido enchufable (40 km eléctricos o más)" },
  { id: "electrico", nombre: "Eléctrico o hidrógeno" },
] as const;

export type Combustible = (typeof COMBUSTIBLES)[number]["id"];
export type Etiqueta = "0" | "ECO" | "C" | "B" | "SIN";

// Reglas de la DGT para turismos según la fecha de matriculación.
// Algunos coches cumplían la norma Euro antes de esas fechas y tienen una
// etiqueta mejor: por eso el resultado es orientativo.
export function etiqueta(combustible: Combustible, { anio, mes }: Mes): Etiqueta {
  const desde = (a: number, m: number) => anio > a || (anio === a && mes >= m);
  const gasolina = desde(2006, 0) ? "C" : desde(2001, 0) ? "B" : "SIN";

  switch (combustible) {
    case "electrico":
    case "enchufable40":
      return "0";
    case "enchufable":
      return "ECO";
    // Híbridos y gas necesitan además cumplir los requisitos de la etiqueta C
    case "hibrido":
    case "gas":
      return gasolina === "C" ? "ECO" : gasolina;
    case "gasolina":
      return gasolina;
    case "diesel":
      return desde(2015, 8) ? "C" : desde(2006, 0) ? "B" : "SIN";
  }
}

export const ETIQUETAS: Record<Etiqueta, { nombre: string; texto: string }> = {
  "0": {
    nombre: "Etiqueta 0 (azul)",
    texto: "Cero emisiones. Acceso libre a las zonas de bajas emisiones.",
  },
  ECO: {
    nombre: "Etiqueta ECO",
    texto: "Híbridos y gas. Suele tener ventajas para circular y aparcar en las ciudades.",
  },
  C: {
    nombre: "Etiqueta C (verde)",
    texto: "Gasolina desde 2006 y diésel desde septiembre de 2015. Puede circular por la mayoría de zonas de bajas emisiones.",
  },
  B: {
    nombre: "Etiqueta B (amarilla)",
    texto: "Gasolina desde 2001 y diésel desde 2006. Tiene restricciones en algunas zonas de bajas emisiones.",
  },
  SIN: {
    nombre: "Sin etiqueta",
    texto: "Gasolina anterior a 2001 o diésel anterior a 2006. Es el grupo con más restricciones en las ciudades.",
  },
};
