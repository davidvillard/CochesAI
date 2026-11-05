// Genera app/lib/ventas-dgt.json: turismos matriculados en España en los
// últimos 12 meses, por modelo y por provincia, a partir de los microdatos
// mensuales de matriculaciones de la DGT (datos abiertos, "DGT en cifras").
// Uso: npm run matriculas   (lo lanza después de actualizar-matriculas.mjs)
//
// Cada mes es un ZIP de ~16 MB con un vehículo por línea, en campos de ancho
// fijo. Posiciones según el "Documento de interfaz de envío de datos
// (Matriculaciones)" de la DGT. Si el último mes publicado no ha cambiado
// desde la última vez, no descarga nada.

import { readFile, writeFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";

const DESTINO = new URL("../app/lib/ventas-dgt.json", import.meta.url);
const BASE = "https://www.dgt.es/microdatos/salida";
const UA = { "User-Agent": "QueCocheEs (estadisticas de matriculaciones)" };
const dos = (n) => String(n).padStart(2, "0");
const urlMes = (a, m) => `${BASE}/${a}/${m}/vehiculos/matriculaciones/export_mensual_mat_${a}${dos(m)}.zip`;

// Campos usados: [inicio, fin) en cada línea
const C = {
  marca: [17, 47],
  modelo: [47, 69],
  tipo: [91, 93], // 40 turismo, 25 todoterreno
  propulsion: [93, 94], // 0 gasolina, 1 diésel, 2 eléctrico, 6 GLP, 7/8 gas natural
  provincia: [152, 154], // donde está domiciliado el vehículo
  tramite: [156, 157], // 1 matriculación ordinaria
  nuevoUsado: [178, 179], // N nuevo, U usado (importado)
  electrico: [453, 457], // BEV, PHEV, HEV, REEV
};
const campo = (l, [a, b]) => l.slice(a, b).trim();

const PROVINCIAS = {
  A: "Alicante", AB: "Albacete", AL: "Almería", AV: "Ávila", B: "Barcelona", BA: "Badajoz",
  BI: "Bizkaia", BU: "Burgos", C: "A Coruña", CA: "Cádiz", CC: "Cáceres", CE: "Ceuta",
  CO: "Córdoba", CR: "Ciudad Real", CS: "Castellón", CU: "Cuenca", GC: "Las Palmas",
  GI: "Girona", GR: "Granada", GU: "Guadalajara", H: "Huelva", HU: "Huesca", IB: "Illes Balears",
  J: "Jaén", L: "Lleida", LE: "León", LO: "La Rioja", LU: "Lugo", M: "Madrid", MA: "Málaga",
  ML: "Melilla", MU: "Murcia", NA: "Navarra", O: "Asturias", OU: "Ourense", P: "Palencia",
  PO: "Pontevedra", S: "Cantabria", SA: "Salamanca", SE: "Sevilla", SG: "Segovia", SO: "Soria",
  SS: "Gipuzkoa", T: "Tarragona", TE: "Teruel", TF: "Santa Cruz de Tenerife", TO: "Toledo",
  V: "Valencia", VA: "Valladolid", VI: "Álava", Z: "Zaragoza", ZA: "Zamora",
};

// Igual que slugModelo de app/lib/fichas.ts
const trozo = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Marcas escritas de varias formas en la DGT
function marcaDe(texto) {
  // Sin coletillas de empresa: "VOLKSWAGEN AG", "VOLKSWAGEN VW", "BMW GMBH"
  const s = trozo(texto).replace(/(-(ag|gmbh|s-a|sa|spa|s-p-a|ltd|limited|inc|vw|v-w))+$/, "");
  if (s === "vw" || s === "v-w") return "volkswagen";
  if (s.startsWith("merced")) return "mercedes-benz";
  if (s === "land-rover" || s.startsWith("land-rover-")) return "land-rover";
  return s;
}

// Primeras palabras que no bastan para nombrar el modelo
const DOBLES = new Set(["model", "serie", "series", "clase", "range", "grand", "santa", "new", "e", "mustang", "tourneo", "transit"]);
// Palabras de motorización que no forman parte del nombre del modelo
const MOTOR = new Set(["hev", "phev", "mhev", "ev", "hybrid", "e-hybrid", "hibrido", "electric", "electrico", "gasolina", "diesel"]);

// Modelo de la DGT -> familia: "SEAT LEON SP E-HYBRID" -> "leon", "X1 SDRIVE20D" -> "x1",
// "A 250 E" (Mercedes) -> "clase-a", "120D" (BMW) -> "serie-1", "OMODA5 HEV" -> "5"
function familiaDe(marca, texto) {
  // Cualquier carácter raro separa palabras ("BERLINGO­TALLA M" -> "berlingo talla m")
  let palabras = texto.toLowerCase().replace(/[^a-z0-9ëüñ.+&-]+/g, " ").split(" ").filter(Boolean);
  // Quita la marca repetida y "nuevo" del principio ("NUEVO CITROËN C3", "VW GOLF")
  const sobra = new Set([...marca.split("-"), marca, "nuevo", "nueva", "new", ...(marca === "volkswagen" ? ["vw"] : [])]);
  // Sin signos sueltos ("LYNK & CO 08": el "&" no es una palabra)
  palabras = palabras.map(trozo).filter(Boolean);
  while (palabras.length > 1 && sobra.has(palabras[0])) palabras.shift();
  palabras = palabras.filter((p) => !MOTOR.has(p));
  if (!palabras.length) return null;
  let [p1, p2] = palabras;
  // "omoda5" -> "5", "mg3" -> "3", "jaecoo7" -> "7": la marca pegada al número
  const pegada = p1.startsWith(marca.replace(/-/g, "")) ? p1.slice(marca.replace(/-/g, "").length).replace(/^-/, "") : "";
  if (/^\d+$/.test(pegada)) p1 = pegada;
  if (marca === "mercedes-benz" && /^[a-z]$/.test(p1)) return `clase-${p1}`;
  if (marca === "bmw" && /^\d{3}/.test(p1)) return `serie-${p1[0]}`;
  if (marca === "lexus" && /^[a-z]{2,3}\d/.test(p1)) return p1.replace(/\d.*$/, ""); // "nx450h" -> "nx"
  if (/^[a-z]$/.test(p1) && /^\d+$/.test(p2 ?? "")) return `${p1}${p2}`; // "i 30" -> "i30"
  if ((DOBLES.has(p1) || p1.length === 1) && p2) return `${p1}-${p2}`;
  return p1;
}

function combustibleDe(propulsion, electrico) {
  if (electrico === "BEV") return "electrico";
  if (electrico === "PHEV" || electrico === "REEV") return "enchufable";
  if (electrico === "HEV") return "hibrido";
  if (propulsion === "2") return "electrico";
  if (propulsion === "0") return "gasolina";
  if (propulsion === "1") return "diesel";
  if (propulsion === "6") return "glp";
  if (propulsion === "7" || propulsion === "8") return "gas-natural";
  return "otros";
}

// Nombre legible: "c-hr" -> "C-HR", "t-roc" -> "T-Roc", "clase-a" -> "Clase A"
const MARCAS = {
  bmw: "BMW", mg: "MG", ds: "DS", kia: "Kia", seat: "Seat", cupra: "Cupra", byd: "BYD",
  "mercedes-benz": "Mercedes-Benz", "land-rover": "Land Rover", "alfa-romeo": "Alfa Romeo",
  volkswagen: "Volkswagen", "ssangyong": "SsangYong", kgm: "KGM", jaecoo: "Jaecoo", "lynk-co": "Lynk & Co", dr: "DR", citroen: "Citroën",
};
const bonito = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nombreMarca = (m) => MARCAS[m] ?? m.split("-").map(bonito).join(" ");
function nombreFamilia(f) {
  if (/^(clase|serie|model|range|grand|santa|mustang)-/.test(f)) {
    return f.split("-").map((p, i) => (i && p.length <= 2 ? p.toUpperCase() : bonito(p))).join(" ");
  }
  if (/\d/.test(f) || /^[a-z]{1,3}$/.test(f)) return f.toUpperCase();
  return f.split("-").map((p) => (p.length <= 2 ? p.toUpperCase() : bonito(p))).join("-");
}

async function leerMes(a, m) {
  const res = await fetch(urlMes(a, m), { headers: UA });
  if (!res.ok) throw new Error(`${res.status} al descargar ${a}-${dos(m)}`);
  const zip = Buffer.from(await res.arrayBuffer());
  if (zip.readUInt32LE(0) !== 0x04034b50) throw new Error(`No es un ZIP: ${a}-${dos(m)}`);
  const inicio = 30 + zip.readUInt16LE(26) + zip.readUInt16LE(28);
  return inflateRawSync(zip.subarray(inicio)).toString("latin1").split("\n");
}

// ¿Existe ya el fichero de ese mes?
async function publicado(a, m) {
  const res = await fetch(urlMes(a, m), { method: "HEAD", headers: UA });
  return res.ok;
}

async function main() {
  const anterior = JSON.parse(await readFile(DESTINO, "utf8").catch(() => "{}"));

  // Último mes publicado: el anterior al actual o, si aún no ha salido, el de antes
  const hoy = new Date();
  let a = hoy.getFullYear();
  let m = hoy.getMonth(); // mes anterior (1-12); 0 = diciembre del año pasado
  if (m === 0) [a, m] = [a - 1, 12];
  if (!(await publicado(a, m))) {
    m--;
    if (m === 0) [a, m] = [a - 1, 12];
  }
  const hasta = `${a}-${dos(m)}`;
  if (anterior.hasta === hasta) {
    console.log("ventas: ya están al día hasta", hasta);
    return;
  }

  // Los 12 meses que acaban en "hasta", del más antiguo al más reciente
  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(a, m - 1 - i, 1));
    meses.push([d.getUTCFullYear(), d.getUTCMonth() + 1]);
  }

  const familias = new Map(); // "seat/leon" -> datos
  const provincias = {}; // "M" -> { total, combustible, modelos: Map }
  const combustibleEspana = {};
  const marcasEspana = {};
  let totalEspana = 0;
  const nuevosUltimoMes = new Map();

  for (const [i, [aa, mm]] of meses.entries()) {
    const lineas = await leerMes(aa, mm);
    let n = 0;
    for (const l of lineas) {
      if (l.length < 460) continue; // cabecera o línea vacía
      const tipo = campo(l, C.tipo);
      if ((tipo !== "40" && tipo !== "25") || campo(l, C.tramite) !== "1") continue;
      const marca = marcaDe(campo(l, C.marca));
      const familia = marca && familiaDe(marca, campo(l, C.modelo));
      if (!familia) continue;
      const clave = `${marca}/${familia}`;
      const nuevo = campo(l, C.nuevoUsado) !== "U";
      const comb = combustibleDe(campo(l, C.propulsion), campo(l, C.electrico));
      const prov = PROVINCIAS[campo(l, C.provincia)] ? campo(l, C.provincia) : null;

      let f = familias.get(clave);
      if (!f) {
        f = { marca, familia, total: 0, nuevos: 0, usados: 0, mensual: Array(12).fill(0), combustible: {}, provincias: {} };
        familias.set(clave, f);
      }
      f.total++;
      f[nuevo ? "nuevos" : "usados"]++;
      f.mensual[i]++;
      f.combustible[comb] = (f.combustible[comb] ?? 0) + 1;
      if (prov) f.provincias[prov] = (f.provincias[prov] ?? 0) + 1;

      totalEspana++;
      combustibleEspana[comb] = (combustibleEspana[comb] ?? 0) + 1;
      if (nuevo) marcasEspana[marca] = (marcasEspana[marca] ?? 0) + 1;
      if (nuevo && i === 11) nuevosUltimoMes.set(clave, (nuevosUltimoMes.get(clave) ?? 0) + 1);

      if (prov) {
        const p = (provincias[prov] ??= { total: 0, combustible: {}, modelos: new Map() });
        p.total++;
        p.combustible[comb] = (p.combustible[comb] ?? 0) + 1;
        if (nuevo) p.modelos.set(clave, (p.modelos.get(clave) ?? 0) + 1);
      }
      n++;
    }
    console.log("ventas", `${aa}-${dos(mm)}`, n, "turismos");
  }

  // Solo modelos con un mínimo de unidades: el resto es ruido (errores de escritura, rarezas)
  const lista = [...familias.entries()].filter(([, f]) => f.total >= 30);
  const porNuevos = [...lista].sort((x, y) => y[1].nuevos - x[1].nuevos);
  const puesto = new Map(porNuevos.map(([k], i) => [k, i + 1]));
  const top = (mapa, n) =>
    [...mapa.entries()].sort((x, y) => y[1] - x[1]).slice(0, n).map(([k, v]) => [k, v]);
  const topObj = (obj, n) => Object.fromEntries(Object.entries(obj).sort((x, y) => y[1] - x[1]).slice(0, n));

  const datos = {
    fuente: "DGT, microdatos mensuales de matriculaciones (DGT en cifras). Turismos y todoterrenos, matriculación ordinaria.",
    actualizado: hoy.toISOString().slice(0, 10),
    desde: `${meses[0][0]}-${dos(meses[0][1])}`,
    hasta,
    total: totalEspana,
    combustible: combustibleEspana,
    marcas: Object.fromEntries(
      Object.entries(marcasEspana).sort((x, y) => y[1] - x[1]).slice(0, 30).map(([k, v]) => [nombreMarca(k), v])
    ),
    modelos: Object.fromEntries(
      lista.map(([k, f]) => [
        k,
        {
          // "MG MG3" -> "MG3": si el modelo ya lleva la marca, no se repite
          nombre: f.familia.startsWith(f.marca)
            ? nombreFamilia(f.familia)
            : `${nombreMarca(f.marca)} ${nombreFamilia(f.familia)}`,
          puesto: puesto.get(k),
          total: f.total,
          nuevos: f.nuevos,
          usados: f.usados,
          mensual: f.mensual,
          combustible: f.combustible,
          provincias: topObj(f.provincias, 5),
        },
      ])
    ),
    // Rankings de coches nuevos (y de usados importados), por claves de "modelos"
    ranking: porNuevos.slice(0, 50).map(([k]) => k),
    rankingUltimoMes: top(nuevosUltimoMes, 30).filter(([k]) => familias.get(k)?.total >= 30),
    rankingImportados: [...lista].sort((x, y) => y[1].usados - x[1].usados).slice(0, 30).map(([k]) => k),
    provincias: Object.fromEntries(
      Object.entries(provincias).map(([cod, p]) => [
        cod,
        {
          nombre: PROVINCIAS[cod],
          total: p.total,
          combustible: p.combustible,
          ranking: top(p.modelos, 20).filter(([k]) => familias.get(k)?.total >= 30),
        },
      ])
    ),
  };

  await writeFile(DESTINO, JSON.stringify(datos) + "\n");
  console.log(`ventas: ${lista.length} modelos, ${datos.desde} a ${hasta}, guardado en ventas-dgt.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
