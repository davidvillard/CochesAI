import VENTAS from "./ventas-dgt.json";
import { FUENTE_DGT, nombreMes } from "./matricula";

// Turismos matriculados en los últimos 12 meses, de los microdatos de la DGT.
// Lo genera scripts/actualizar-ventas.mjs (npm run matriculas, una vez al mes).

export type VentasModelo = {
  nombre: string;
  puesto: number; // en el ranking de coches nuevos de España
  total: number;
  nuevos: number;
  usados: number; // usados importados matriculados por primera vez en España
  mensual: number[]; // 12 meses, del más antiguo al más reciente
  combustible: Record<string, number>;
  provincias: Record<string, number>; // código DGT -> unidades (las 5 primeras)
};

type Provincia = {
  nombre: string;
  total: number;
  combustible: Record<string, number>;
  ranking: [string, number][];
};

const MODELOS = VENTAS.modelos as Record<string, VentasModelo>;
const PROVINCIAS = VENTAS.provincias as unknown as Record<string, Provincia>;

export { FUENTE_DGT };
export const TOTAL = VENTAS.total;
export const COMBUSTIBLE_ESPANA = VENTAS.combustible as Record<string, number>;
export const MARCAS = VENTAS.marcas as Record<string, number>;
export const RANKING = VENTAS.ranking as string[];
export const RANKING_ULTIMO_MES = VENTAS.rankingUltimoMes as unknown as [string, number][];
export const RANKING_IMPORTADOS = VENTAS.rankingImportados as string[];

// "2026-09" -> { anio: 2026, mes: 8 } (meses de 0 a 11, como en lib/matricula)
const mes = (s: string) => ({ anio: Number(s.slice(0, 4)), mes: Number(s.slice(5, 7)) - 1 });
export const DESDE = nombreMes(mes(VENTAS.desde));
export const HASTA = nombreMes(mes(VENTAS.hasta));
export const PERIODO = `de ${DESDE} a ${HASTA}`;
// Día en que se descargaron los datos de la DGT ("2026-10-28")
export const ACTUALIZADO = VENTAS.actualizado;
// Periodo de los datos en formato ISO 8601 ("2025-10/2026-09")
export const PERIODO_ISO = `${VENTAS.desde}/${VENTAS.hasta}`;

// Las 12 etiquetas de mes cortas para las gráficas: "oct", "nov"...
export const MESES_CORTOS = Array.from({ length: 12 }, (_, i) => {
  const { anio, mes: m } = mes(VENTAS.hasta);
  const d = new Date(Date.UTC(anio, m - 11 + i, 1));
  return d.toLocaleDateString("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" });
});

export const COMBUSTIBLES: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  hibrido: "Híbrido",
  enchufable: "Híbrido enchufable",
  electrico: "Eléctrico",
  glp: "GLP",
  "gas-natural": "Gas natural",
  otros: "Otros",
};

export const modelo = (clave: string) => MODELOS[clave];

// Modelos con ventas de coches nuevos, del más vendido al menos
export const POR_PUESTO = Object.entries(MODELOS)
  .filter(([, m]) => m.nuevos > 0)
  .sort((a, b) => a[1].puesto - b[1].puesto)
  .map(([clave]) => clave);

// "toyota/c-hr" + "Toyota C-HR" -> { marca: "Toyota", modelo: "C-HR" }.
// Si el nombre no empieza por la marca ("MG3"), la marca va aparte.
export function marcaYModelo(clave: string) {
  const [marcaSlug] = clave.split("/");
  const palabras = MODELOS[clave].nombre.split(" ");
  const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  for (let i = 1; i < palabras.length; i++) {
    if (slug(palabras.slice(0, i).join(" ")) === marcaSlug) {
      return { marca: palabras.slice(0, i).join(" "), modelo: palabras.slice(i).join(" ") };
    }
  }
  return { marca: marcaSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), modelo: MODELOS[clave].nombre };
}

// ---------- Cruce con las fichas ----------

const marcaBase = (m: string) => (m.startsWith("mercedes") ? "mercedes-benz" : m);

// Familia de la DGT de una ficha: "cupra/leon-sportstourer" -> "cupra/leon",
// "bmw/serie-8-gran-coupe" -> "bmw/serie-8". Elige la coincidencia más larga.
export function claveDeFicha(slug: string) {
  const [marca, nombre] = slug.split("/");
  if (!marca || !nombre) return null;
  const m = marcaBase(marca);
  const partes = nombre.split("-");
  for (let n = partes.length; n > 0; n--) {
    const clave = `${m}/${partes.slice(0, n).join("-")}`;
    if (MODELOS[clave]) return clave;
  }
  return null;
}

export function ventasDeFicha(slug: string) {
  const clave = claveDeFicha(slug);
  return clave ? { clave, ...MODELOS[clave] } : null;
}

// Para enlazar los rankings con las fichas que existen: clave DGT -> slug de ficha
export function fichasPorClave(slugs: string[]) {
  const r = new Map<string, string>();
  for (const s of slugs) {
    const c = claveDeFicha(s);
    // Si varias fichas caen en la misma familia, gana la de nombre más corto (la base)
    if (c && (!r.has(c) || s.length < r.get(c)!.length)) r.set(c, s);
  }
  return r;
}

// ---------- Provincias ----------

const slugProvincia = (nombre: string) =>
  nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const LISTA_PROVINCIAS = Object.entries(PROVINCIAS)
  .map(([codigo, p]) => ({ codigo, slug: slugProvincia(p.nombre), ...p }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const provinciaPorSlug = (slug: string) => LISTA_PROVINCIAS.find((p) => p.slug === slug);
export const provinciaPorCodigo = (codigo: string) => LISTA_PROVINCIAS.find((p) => p.codigo === codigo);

// ---------- Formato ----------

export const pct = (parte: number, total: number) =>
  total ? `${(Math.round((parte / total) * 1000) / 10).toLocaleString("es-ES")} %` : "—";

// Con punto de miles también en cifras de 4 dígitos: 2.791
const miles = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
export const unidades = (n: number) => miles.format(n);

// Combustibles ordenados de más a menos, con su nombre. Los que no llegan al
// 0,5 % se omiten: saldrían como "0 %" y no aportan nada
export function repartoCombustible(c: Record<string, number>) {
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  return Object.entries(c)
    .filter(([, v]) => v / total >= 0.005)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ id: k, nombre: COMBUSTIBLES[k] ?? k, unidades: v }));
}
