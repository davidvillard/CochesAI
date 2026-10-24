import { eurExacto } from "./formato";

// Cálculo orientativo del ITP en la compra de un turismo usado entre particulares.
// Todo se calcula en el navegador.
//
// Fuentes (octubre de 2026), contrastadas entre sí:
// - Depreciación: Anexo IV de la Orden HAC/1501/2025 (BOE 23/12/2025), igual
//   desde la Orden de 15/12/1998.
// - Tipos y reglas por comunidad: guías fiscales de 2026 (guiafiscal.es,
//   tramitatucoche.es). Cambian cada año: revísalas cada enero.

// Porcentaje del valor de nuevo según los años completos desde la 1.ª matriculación
const DEPRECIACION = [100, 84, 67, 56, 47, 39, 34, 28, 24, 19, 17, 13, 10];

export function coeficiente(anios: number) {
  return DEPRECIACION[Math.min(Math.max(0, Math.floor(anios)), DEPRECIACION.length - 1)] / 100;
}

export type Distintivo = "normal" | "eco" | "cero";

export type DatosItp = {
  comunidad: string; // id de COMUNIDADES
  precio: number; // precio pactado en el contrato
  valorNuevo?: number; // precio medio de las tablas de Hacienda (opcional)
  anios: number; // años completos desde la primera matriculación
  cc: number; // cilindrada en cm³ (0 si no se sabe o es eléctrico)
  cvFiscales: number; // 0 si no se sabe
  distintivo: Distintivo;
};

// Cuota fija por cilindrada: [cc máximos (incluidos), euros]. Sin tramo = tipo normal
type Tramos = [number, number][];

export type Comunidad = {
  id: string;
  nombre: string;
  tipo: number; // %
  tipo15cv?: number; // % si supera 15 CV fiscales
  tipoCero?: number; // % con etiqueta 0
  tipoEco?: number; // % con etiqueta ECO
  // Coches antiguos: desde cuántos años y qué pagan
  antiguos?: {
    desde: number;
    tramos?: Tramos; // cuota fija; por encima del último tramo, tipo normal
    exento?: boolean;
    limiteValor?: number; // la regla no aplica si el valor llega a esto
    limiteSobre?: "nuevo" | "base"; // qué valor se compara: el de nuevo o la base
    texto: string;
  };
  bonificacion?: number; // % de rebaja sobre la cuota
  plazo: string;
};

export const COMUNIDADES: Comunidad[] = [
  { id: "andalucia", nombre: "Andalucía", tipo: 4, tipo15cv: 8, tipoCero: 1, plazo: "2 meses" },
  {
    id: "aragon", nombre: "Aragón", tipo: 4, plazo: "1 mes",
    antiguos: { desde: 10, tramos: [[1000, 0], [1500, 20], [2000, 30]], texto: "Con 10 años o más: 0 € hasta 1.000 cc, 20 € hasta 1.500 cc y 30 € hasta 2.000 cc." },
  },
  { id: "asturias", nombre: "Asturias", tipo: 4, tipo15cv: 8, plazo: "30 días hábiles" },
  { id: "baleares", nombre: "Illes Balears", tipo: 4, tipo15cv: 8, tipoCero: 0, tipoEco: 2, plazo: "1 mes" },
  {
    id: "canarias", nombre: "Canarias", tipo: 5.5, plazo: "1 mes",
    antiguos: { desde: 10, tramos: [[1000, 40], [1500, 70], [2000, 115]], texto: "Con 10 años o más: 40 € hasta 1.000 cc, 70 € hasta 1.500 cc y 115 € hasta 2.000 cc." },
  },
  {
    id: "cantabria", nombre: "Cantabria", tipo: 6, plazo: "30 días hábiles",
    antiguos: { desde: 10, tramos: [[999, 45], [1499, 60], [1999, 90]], texto: "Con 10 años o más: 45 € hasta 999 cc, 60 € hasta 1.499 cc y 90 € hasta 1.999 cc." },
  },
  { id: "castilla-la-mancha", nombre: "Castilla-La Mancha", tipo: 6, plazo: "1 mes" },
  { id: "castilla-y-leon", nombre: "Castilla y León", tipo: 5, tipo15cv: 8, plazo: "30 días hábiles" },
  {
    id: "cataluna", nombre: "Cataluña", tipo: 5, tipoCero: 0, plazo: "1 mes",
    antiguos: { desde: 10, exento: true, limiteValor: 40000, limiteSobre: "nuevo", texto: "Con 10 años o más no se paga, salvo que su valor de nuevo fuera de 40.000 € o más." },
  },
  {
    id: "valencia", nombre: "Comunitat Valenciana", tipo: 6, plazo: "1 mes",
    antiguos: { desde: 12, tramos: [[1500, 40], [2000, 60], [Infinity, 140]], limiteValor: 20000, limiteSobre: "base", texto: "Con 12 años o más y valor inferior a 20.000 €: 40 € hasta 1.500 cc, 60 € hasta 2.000 cc y 140 € por encima." },
  },
  { id: "extremadura", nombre: "Extremadura", tipo: 6, plazo: "1 mes" },
  {
    id: "galicia", nombre: "Galicia", tipo: 3, tipoCero: 0, plazo: "1 mes",
    antiguos: { desde: 15, tramos: [[1199, 22], [1599, 38]], texto: "Con 15 años o más: 22 € hasta 1.199 cc y 38 € hasta 1.599 cc." },
  },
  { id: "madrid", nombre: "Comunidad de Madrid", tipo: 4, plazo: "30 días hábiles" },
  {
    id: "murcia", nombre: "Región de Murcia", tipo: 4, plazo: "30 días hábiles",
    antiguos: { desde: 12, tramos: [[1000, 0], [1500, 30], [2000, 50], [Infinity, 75]], texto: "Con 12 años o más: 0 € hasta 1.000 cc, 30 € hasta 1.500 cc, 50 € hasta 2.000 cc y 75 € por encima." },
  },
  {
    id: "navarra", nombre: "Navarra", tipo: 4, plazo: "2 meses",
    antiguos: { desde: 10, exento: true, limiteValor: 40000, limiteSobre: "base", texto: "Con 10 años o más está exento, salvo que la base sea de 40.000 € o más." },
  },
  { id: "pais-vasco", nombre: "País Vasco", tipo: 4, plazo: "30 días hábiles" },
  { id: "la-rioja", nombre: "La Rioja", tipo: 4, plazo: "30 días hábiles" },
  { id: "ceuta-melilla", nombre: "Ceuta y Melilla", tipo: 4, bonificacion: 50, plazo: "30 días hábiles" },
];

export type ResultadoItp = {
  base: number;
  valorTablas?: number;
  cuota: number;
  explicacion: string;
  plazo: string;
};


export function calcularItp(d: DatosItp): ResultadoItp | null {
  const c = COMUNIDADES.find((x) => x.id === d.comunidad);
  if (!c) return null;

  // Base: el mayor entre el precio pactado y el valor de las tablas de Hacienda
  const valorTablas = d.valorNuevo ? Math.round(d.valorNuevo * coeficiente(d.anios) * 100) / 100 : undefined;
  const base = Math.max(d.precio, valorTablas ?? 0);
  const fin = (cuota: number, explicacion: string) => {
    const conBonificacion = c.bonificacion ? cuota * (1 - c.bonificacion / 100) : cuota;
    return {
      base,
      valorTablas,
      cuota: Math.round(conBonificacion * 100) / 100,
      explicacion: c.bonificacion
        ? `${explicacion} Con la bonificación del ${c.bonificacion} %.`
        : explicacion,
      plazo: c.plazo,
    };
  };

  // Coches antiguos: cuota fija o exención
  const a = c.antiguos;
  // Si no se conoce el valor de nuevo, se usa la base (no puede ser menor que él)
  const valorLimite = a?.limiteSobre === "nuevo" ? (d.valorNuevo ?? base) : base;
  const superaLimite = a?.limiteValor !== undefined && valorLimite >= a.limiteValor;
  if (a && d.anios >= a.desde && !superaLimite) {
    if (a.exento) return fin(0, `En ${c.nombre}, ${a.texto.charAt(0).toLowerCase()}${a.texto.slice(1)}`);
    const tramo = d.cc > 0 ? a.tramos?.find(([max]) => d.cc <= max) : undefined;
    if (tramo) return fin(tramo[1], `Cuota fija de ${c.nombre} para coches antiguos. ${a.texto}`);
  }

  // Tipo porcentual
  let tipo = c.tipo;
  let motivo = `Tipo general de ${c.nombre}`;
  if (d.distintivo === "cero" && c.tipoCero !== undefined) {
    tipo = c.tipoCero;
    motivo = `Tipo de ${c.nombre} para vehículos con etiqueta 0`;
  } else if (d.distintivo === "eco" && c.tipoEco !== undefined) {
    tipo = c.tipoEco;
    motivo = `Tipo de ${c.nombre} para vehículos con etiqueta ECO`;
  } else if (c.tipo15cv && d.cvFiscales > 15) {
    tipo = c.tipo15cv;
    motivo = `Tipo de ${c.nombre} para coches de más de 15 CV fiscales`;
  }
  return fin(base * (tipo / 100), `${motivo}: ${tipo.toLocaleString("es-ES")} % sobre ${eurExacto(base)}.`);
}

export const pct = (n: number) => `${n.toLocaleString("es-ES")} %`;

// Resumen en texto de las reglas especiales de una comunidad
export function especialidades(c: Comunidad) {
  const partes: string[] = [];
  if (c.tipo15cv) partes.push(`${pct(c.tipo15cv)} si supera 15 CV fiscales.`);
  if (c.tipoCero !== undefined) partes.push(`${pct(c.tipoCero)} con etiqueta 0.`);
  if (c.tipoEco !== undefined) partes.push(`${pct(c.tipoEco)} con etiqueta ECO.`);
  if (c.antiguos) partes.push(c.antiguos.texto);
  if (c.bonificacion) partes.push(`Bonificación del ${c.bonificacion} % de la cuota.`);
  return partes.join(" ") || "—";
}

// Tasa de la DGT por el cambio de titularidad (2026). La fija la DGT cada año.
export const TASA_TRANSFERENCIA = { general: 55.7, ciclomotor: 27.85 };
