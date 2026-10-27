// Actualiza app/lib/matriculas-dgt.json con los datos abiertos de la DGT.
// Uso: npm run matriculas   (una vez al mes, por ejemplo)
//
// Cada fichero de microdatos de matriculaciones de la DGT empieza con la línea
// "Letras de la serie de la última matrícula asignada: XXX". De ahí sale:
// - finDeMes: las letras al acabar cada mes (ficheros mensuales, desde dic. 2014)
// - diario: las letras al acabar cada día del mes en curso (ficheros diarios)
// Solo se descargan los primeros 64 KB de cada ZIP: basta para leer esa línea.
// Fuente: DGT, "DGT en cifras" (datos abiertos).

import { readFile, writeFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";

const DESTINO = new URL("../app/lib/matriculas-dgt.json", import.meta.url);
const BASE = "https://www.dgt.es/microdatos/salida";
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const dos = (n) => String(n).padStart(2, "0");

// Letras de la cabecera de un ZIP de la DGT; null si el fichero no existe y
// undefined si no trae esa cabecera (pasa con algunos ficheros diarios)
async function letras(url) {
  const res = await fetch(url, {
    headers: { Range: "bytes=0-65535", "User-Agent": "CochesAI (actualizacion de tabla de matriculas)" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} en ${url}`);
  const zip = Buffer.from(await res.arrayBuffer());
  if (zip.readUInt32LE(0) !== 0x04034b50) throw new Error(`No es un ZIP: ${url}`);
  const inicio = 30 + zip.readUInt16LE(26) + zip.readUInt16LE(28);
  // El ZIP llega cortado: se descomprime lo que haya y se lee la primera línea
  let texto;
  try {
    texto = inflateRawSync(zip.subarray(inicio), { finishFlush: 2 }).toString("latin1");
  } catch {
    throw new Error(`No se pudo leer la cabecera de ${url}`);
  }
  const m = /asignada:\s*([BCDFGHJKLMNPRSTVWXYZ]{3})/.exec(texto.split("\n")[0]);
  return m ? m[1] : undefined;
}

async function main() {
  const anterior = JSON.parse(await readFile(DESTINO, "utf8").catch(() => "{}"));
  const finDeMes = { ...(anterior.finDeMes ?? {}) };
  const hoy = new Date();

  // Ficheros mensuales: solo los que aún no tenemos, hasta que dejen de existir
  for (let a = 2014, m = 12; a < hoy.getFullYear() || (a === hoy.getFullYear() && m <= hoy.getMonth() + 1); ) {
    const clave = `${a}-${dos(m)}`;
    if (!finDeMes[clave]) {
      const l = await letras(`${BASE}/${a}/${m}/vehiculos/matriculaciones/export_mensual_mat_${a}${dos(m)}.zip`);
      if (l === null) break; // el mes aún no se ha publicado
      if (!l) throw new Error(`El fichero de ${clave} no trae la cabecera con las letras`);
      finDeMes[clave] = l;
      console.log("mes", clave, l);
      await pausa(300);
    }
    m++;
    if (m === 13) [a, m] = [a + 1, 1];
  }

  // Ficheros diarios: la DGT solo deja los del mes en curso
  const diario = {};
  const a = hoy.getFullYear();
  const m = hoy.getMonth() + 1;
  for (let d = 1; d <= hoy.getDate(); d++) {
    const l = await letras(`${BASE}/${a}/${dos(m)}/vehiculos/matriculaciones/export_mat_${a}${dos(m)}${dos(d)}.zip`);
    if (l === undefined) console.log("día", `${a}-${dos(m)}-${dos(d)}`, "sin cabecera, se omite");
    if (l) {
      diario[`${a}-${dos(m)}-${dos(d)}`] = l;
      console.log("día", `${a}-${dos(m)}-${dos(d)}`, l);
    }
    await pausa(300);
  }

  const datos = {
    fuente: "DGT, microdatos de matriculaciones (DGT en cifras): letras de la última matrícula asignada",
    actualizado: hoy.toISOString().slice(0, 10),
    finDeMes,
    // Si este mes aún no hay ficheros diarios, se conservan los anteriores
    diario: Object.keys(diario).length ? diario : (anterior.diario ?? {}),
  };
  await writeFile(DESTINO, JSON.stringify(datos, null, 2) + "\n");
  console.log(`Guardado: ${Object.keys(finDeMes).length} meses y ${Object.keys(datos.diario).length} días.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
