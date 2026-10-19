// Cálculos a partir de la matrícula. Todo se hace en el navegador:
// la matrícula no se envía a ningún servidor.

// Primera combinación de letras de cada mes desde septiembre de 2000.
// Es una tabla recopilada por terceros (no oficial), así que la fecha es aproximada.
// Para actualizarla, añade al final los meses nuevos (fuente: seisenlinea.com/edad-matriculas).
const TABLA = `
2000-09 BBB BCD BCY BDR
2001-01 BFJ BGF BHG BJC BKB BLC BMF BMW BNL BPG BRB BRT
2002-01 BSL BTF BTZ BVW BWT BXP BYP BZF BZV CBP CCH CDC
2003-01 CDV CFM CGJ CHF CJC CKB CLD CLV CMM CNK CPF CRC
2004-01 CRV CSS CTT CVR CWR CXT CYY CZP DBJ DCH DDG DFF
2005-01 DFZ DGX DHZ DKB DLD DMJ DNP DPK DRG DSC DTB DVB
2006-01 DVW DWT DXZ DYY FBC FCJ FDP FFK FGF FHD FJD FKC
2007-01 FKY FLV FNB FNZ FRC FSJ FTP FVJ FWC FXB FXY FYY
2008-01 FZR GBN GCK GDH GFC GFY GGV GHG GHT GJJ GJV GKH
2009-01 GKS GLC GLP GMC GMN GNF GNY GPJ GPW GRM GSC GSR
2010-01 GTC GTS GVM GWC GWV GXP GYD GYM GYX GZJ GZT HBG
2011-01 HBP HCB HCR HDC HDR HFF HFT HGC HGM HGX HHH HHT
2012-01 HJC HJM HKB HKL HKX HLK HLW HMD HML HMT HNC HNK
2013-01 HNT HPC HPN HPY HRK HRX HSK HSS HSZ HTK HTV HVF
2014-01 HVN HVZ HWM HXB HXN HYD HYT HZB HZL HZZ JBL JBY
2015-01 JCK JCY JDR JFG JFX JGR JHJ JHT JJH JJW JKK JKZ
2016-01 JLN JMF JMY JNR JPK JRG JRZ JSK JTB JTN JVH JVZ
2017-01 JWN JXF JYB JYT JZP KBM KCH KCT KDH KFC KFW KGN
2018-01 KHG KHY KJV KKR KLN KMM KNK KPD KPS KRJ KRZ KSS
2019-01 KTJ KVB KVX KWT KXR KYN KZK KZY LBN LCG LCY LDR
2020-01 LFH LFY LGG LGH LGP LHG LJD LJR LKF LKV LLJ LMC
2021-01 LML LMX LNN LPD LPW LRP LSF LSP LTD LTP LVD LVV
2022-01 LWD LWR LXD LXS LYJ LYZ LZP LZZ MBN MBZ MCR MDD
2023-01 MDS MFG MFX MGN MHG MHY MJR MKD MKP MLH MLY MMN
2024-01 MNC MNT MPL MRD MRW MSS MTK MTV MVL MWD MWS MXP
2025-01 MYC MYV MZS NBL NCG NDG NFC NFR NGJ NHC NHX NJS
2026-01 NKF NKY NLZ NMW NNT NPT NRN NSG NTB
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

// Primera combinación de cada año, para la tabla de la página
export const PRIMERA_DEL_ANIO = TABLA.trim()
  .split("\n")
  .map((l) => l.trim().split(/\s+/))
  .map(([inicio, primera]) => ({ anio: Number(inicio.slice(0, 4)), primera }));

// Códigos del sistema provincial (hasta septiembre de 2000)
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
    const i = indice(letras);
    // Último mes cuya primera combinación es anterior o igual a la matrícula
    let k = 0;
    while (k + 1 < INICIOS.length && INICIOS[k + 1].indice <= i) k++;
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
