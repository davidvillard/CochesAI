import VENTAS from "./ventas-dgt.json";
import { COMBUSTIBLES, LISTA_PROVINCIAS, PERIODO_ISO, modelo } from "./ventas";

// Tablas en CSV para periodistas y para quien quiera reutilizar los datos (licencia CC BY 4.0).
// Formato pensado para abrir con Excel en español: UTF-8 con BOM, separador «;» y saltos CRLF.

type Tabla = { titulo: string; descripcion: string; filas: (string | number)[][] };

const celda = (v: string | number) => {
  const s = String(v);
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const aCsv = (filas: (string | number)[][]) =>
  "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n") + "\r\n";

const MODELOS = VENTAS.modelos as Record<string, { nombre: string; puesto: number; nuevos: number; usados: number; total: number }>;
const comb = Object.keys(COMBUSTIBLES);

export const TABLAS: Record<string, Tabla> = {
  "modelos-espana.csv": {
    titulo: "Modelos en España",
    descripcion: "Cada modelo con sus matriculaciones de nuevos, de usados importados y el total, ordenados por ventas de nuevos.",
    filas: [
      ["periodo", "puesto_nuevos", "modelo", "nuevos", "usados_importados", "total"],
      ...Object.values(MODELOS)
        .filter((m) => m.nuevos > 0)
        .sort((a, b) => a.puesto - b.puesto)
        .map((m) => [PERIODO_ISO, m.puesto, m.nombre, m.nuevos, m.usados, m.total]),
    ],
  },
  "ranking-provincias.csv": {
    titulo: "Los 20 más vendidos de cada provincia",
    descripcion: "Una fila por provincia y puesto: el modelo y sus unidades.",
    filas: [
      ["periodo", "provincia", "puesto", "modelo", "unidades"],
      ...LISTA_PROVINCIAS.flatMap((p) =>
        p.ranking.map(([clave, n], i) => [PERIODO_ISO, p.nombre, i + 1, modelo(clave)?.nombre ?? clave, n])
      ),
    ],
  },
  "combustible-provincias.csv": {
    titulo: "Combustible por provincia",
    descripcion: "Turismos matriculados en cada provincia por tipo de combustible.",
    filas: [
      ["periodo", "provincia", "total", ...comb],
      ...LISTA_PROVINCIAS.map((p) => [PERIODO_ISO, p.nombre, p.total, ...comb.map((c) => p.combustible[c] ?? 0)]),
    ],
  },
};
