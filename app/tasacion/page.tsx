import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import BotonCalcular from "./BotonCalcular";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import base from "../page.module.css";
import cmp from "../comparar/comparar.module.css";
import styles from "./tasacion.module.css";
import MarcoPagina from "../components/MarcoPagina";
import SelectorModelo from "../comparar/SelectorModelo";
import { eur } from "../lib/formato";
import { leerFicha, listarModelos, registrarModelo, urlFicha, type Ficha } from "../lib/fichas";
import { redis } from "../lib/redis";
import { CLAVES_DGT, fichasPorClave, marcaYModelo, modelo as modeloDgt } from "../lib/ventas";
import { ESTADOS, aniosModelo, tasar, type Estado } from "../lib/tasacion";
import { metadatos } from "../lib/seo";

export const metadata: Metadata = metadatos({
  titulo: "¿Cuánto vale mi coche? Tasación orientativa gratis",
  descripcion:
    "Calcula el precio orientativo de un coche de segunda mano según modelo, año, kilómetros y estado, y comprueba si el precio de un anuncio es sospechosamente barato.",
  ruta: "/tasacion",
});

type Props = {
  searchParams: Promise<{ modelo?: string; anio?: string; km?: string; estado?: string; precio?: string }>;
};

// Crear una ficha tarda unos segundos (Gemini): margen para que no se corte
export const maxDuration = 60;

// La DGT también lista variantes sueltas con pocas unidades ("A180", "C220D"): por debajo
// de este mínimo al año no se ofrecen en la lista (el modelo base ya está)
const MIN_MATRICULAS = 100;

// Fichas nuevas que puede pedir una misma persona por hora. Solo se pueden crear modelos
// de la lista de la DGT (finita y real), y cada uno una vez: no hay forma de gastar
// cuota de Gemini con nombres inventados.
const limiteFichas = redis
  ? new Ratelimit({ redis, prefix: "quecoche:tasacion", limiter: Ratelimit.slidingWindow(5, "1 h") })
  : null;

async function puedeCrear() {
  if (!limiteFichas) return true;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "anon";
  try {
    return (await limiteFichas.limit(ip)).success;
  } catch (err) {
    console.error("Error en el límite de la tasación:", err);
    return true;
  }
}

// Lee la ficha de un slug ("seat/leon"), siguiendo los alias
async function ficha(slug?: string): Promise<Ficha | null> {
  if (!slug) return null;
  const f = await leerFicha(slug);
  if (!f) return null;
  return "alias" in f ? ficha(f.alias) : f;
}

// Ficha del modelo elegido: una que ya existe, la de su familia de la DGT o, si es un
// modelo de la DGT sin ficha, una nueva creada en este momento
async function resolver(valor: string | undefined, slugsConFicha: string[]) {
  if (!valor || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(valor)) return { f: null };
  const directa = await ficha(valor);
  if (directa) return { f: directa };
  if (!modeloDgt(valor)) return { f: null };
  const deFamilia = fichasPorClave(slugsConFicha).get(valor);
  if (deFamilia) return { f: await ficha(deFamilia) };
  if (!(await puedeCrear())) return { f: null, limite: true };
  const { marca, modelo } = marcaYModelo(valor);
  await registrarModelo(marca, modelo, { slug: valor, contar: false, lote: true });
  return { f: await ficha(valor), intentada: true };
}

// "12.500 €" -> 12500; vacío o no numérico -> undefined
const entero = (v?: string) => {
  const t = (v ?? "").replace(/[.\s€]/g, "").replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
};

const VEREDICTOS = {
  sospechoso: {
    titulo: "Sospechosamente barato",
    texto:
      "Está muy por debajo de lo normal. Puede ser una estafa (el coche no existe o te pedirán una señal por adelantado) o esconder un problema serio: averías, kilómetros manipulados, cargas o un coche siniestrado. No pagues nada sin verlo y revisarlo.",
  },
  barato: {
    titulo: "Por debajo de lo normal",
    texto: "Puede ser una buena oportunidad, pero pregunta el motivo y revisa bien el coche y sus papeles.",
  },
  normal: { titulo: "Dentro de lo normal", texto: "El precio cuadra con coches parecidos." },
  caro: {
    titulo: "Por encima de lo normal",
    texto:
      "Puede estar justificado por un acabado alto, extras o muy pocos kilómetros; si no, hay margen para negociar.",
  },
} as const;

export default async function Tasacion({ searchParams }: Props) {
  const q = await searchParams;
  const modelos = await listarModelos();
  const conFicha = modelos.map((m) => m.slug);
  const { f, limite, intentada } = await resolver(q.modelo, conFicha);
  const actual = new Date().getFullYear();
  const anio = entero(q.anio);
  const km = entero(q.km);
  const estado: Estado = q.estado && q.estado in ESTADOS ? (q.estado as Estado) : "normal";
  const precio = entero(q.precio);
  const r = f && anio && km !== undefined ? tasar(f, anio, km, estado, precio || undefined) : null;
  const rango = f ? aniosModelo(f) : null;

  // Todos los modelos matriculados en España en el último año (DGT), más las fichas de
  // modelos que ya no se venden. Si una familia de la DGT ya tiene ficha, se usa su nombre.
  const familias = fichasPorClave(conFicha);
  const enDgt = new Set(familias.values());
  const nombres = new Map(modelos.map((m) => [m.slug, m]));
  const opciones = [
    ...CLAVES_DGT.filter((clave) => modeloDgt(clave).total >= MIN_MATRICULAS).map((clave) => {
      const conF = familias.get(clave);
      const n = conF && nombres.get(conF);
      return n ? { slug: conF!, marca: n.marca, modelo: n.modelo } : { slug: clave, ...marcaYModelo(clave) };
    }),
    ...modelos.filter((m) => !enDgt.has(m.slug)).map(({ slug, marca, modelo }) => ({ slug, marca, modelo })),
  ]
    .filter((o, i, l) => l.findIndex((x) => x.slug === o.slug) === i)
    .sort((x, y) => `${x.marca} ${x.modelo}`.localeCompare(`${y.marca} ${y.modelo}`, "es"));
  const anios = Array.from({ length: 30 }, (_, i) => actual - i);

  return (
    <MarcoPagina>
      <section className={base.hero}>
        <div className={base.cont}>
          <span className={base.chip}>
            <span className={base.punto} /> Gratis y sin registro
          </span>
          <h1 className={base.h1}>¿Cuánto vale este coche?</h1>
          <p className={base.sub}>
            Precio orientativo de segunda mano según el modelo, el año, los kilómetros y el
            estado. Si estás mirando un anuncio, pon su precio y te decimos si es normal o
            sospechoso.
          </p>

          {/* Formulario GET: funciona sin JavaScript y la URL se puede compartir */}
          <Form action="/tasacion" className={`${cmp.form} ${styles.form}`}>
            <SelectorModelo
              campo="modelo"
              etiqueta="Modelo"
              opciones={opciones}
              actual={f?.slug}
              sinResultados={
                <>
                  <strong>¿No está tu coche?</strong>{" "}
                  <Link href="/">Hazle una foto y lo identificamos</Link>: si es nuevo para nosotros,
                  creamos su ficha y podrás tasarlo.
                </>
              }
            />
            <label className={cmp.campo}>
              <span className={cmp.etiqueta}>Año</span>
              <select name="anio" defaultValue={anio ?? ""} required className={cmp.select}>
                <option value="" disabled>
                  Elige el año
                </option>
                {anios.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className={cmp.campo}>
              <span className={cmp.etiqueta}>Kilómetros</span>
              <input
                name="km"
                inputMode="numeric"
                required
                defaultValue={q.km ?? ""}
                placeholder="120000"
                className={cmp.select}
              />
            </label>
            <label className={cmp.campo}>
              <span className={cmp.etiqueta}>Estado</span>
              <select name="estado" defaultValue={estado} className={cmp.select}>
                {Object.entries(ESTADOS).map(([v, e]) => (
                  <option key={v} value={v}>
                    {e.texto}
                  </option>
                ))}
              </select>
            </label>
            <label className={cmp.campo}>
              <span className={cmp.etiqueta}>Precio del anuncio (opcional)</span>
              <input
                name="precio"
                inputMode="numeric"
                defaultValue={q.precio ?? ""}
                placeholder="9500"
                className={cmp.select}
              />
            </label>
            <BotonCalcular className={`${base.btn} ${base.btnP}`} />
          </Form>

          {q.modelo && !f && (
            <p className={styles.aviso}>
              {limite
                ? "Has pedido muchos modelos nuevos en poco tiempo. Prueba otra vez dentro de un rato."
                : intentada
                  ? "No hemos podido preparar los datos de este modelo ahora mismo. Prueba otra vez mañana."
                  : "No tenemos datos de ese modelo."}
            </p>
          )}
          {f && anio && km !== undefined && !r && (
            <p className={styles.aviso}>No tenemos datos de precio suficientes para este modelo.</p>
          )}

          {f && r && anio && km !== undefined && (
            <div className={styles.resultado} aria-live="polite">
              <p className={styles.etiqueta}>
                {f.marca} {f.modelo} de {anio}, {km.toLocaleString("es-ES")} km
              </p>
              <p className={styles.cifra}>
                {eur(r.min)} – {eur(r.max)}
              </p>
              <p className={styles.texto}>
                Precio orientativo de venta entre particulares. En un concesionario suele
                anunciarse algo más caro, con garantía.
              </p>
              {r.fueraDeAnios && rango && (
                <p className={styles.texto}>
                  Ojo: según nuestra ficha, este modelo se vendió en España entre {rango.desde} y{" "}
                  {rango.hasta}. Comprueba el año con la <Link href="/matricula">matrícula</Link>.
                </p>
              )}
              {Math.abs(km - r.kmEsperados) > 40_000 && (
                <p className={styles.texto}>
                  Lo normal para su edad serían unos {r.kmEsperados.toLocaleString("es-ES")} km.
                  {km < r.kmEsperados &&
                    " Tan pocos kilómetros suben el precio, pero comprueba que cuadran con las ITV y las revisiones."}
                </p>
              )}

              {r.anuncio && (
                <div className={`${styles.veredicto} ${styles[r.anuncio.veredicto]}`}>
                  <p className={styles.veredictoT}>
                    {eur(r.anuncio.precio)}: {VEREDICTOS[r.anuncio.veredicto].titulo}
                  </p>
                  <p>{VEREDICTOS[r.anuncio.veredicto].texto}</p>
                  {(r.anuncio.veredicto === "sospechoso" || r.anuncio.veredicto === "barato") && (
                    <p>
                      <Link href="/checklist-compra-coche">Qué revisar antes de comprarlo</Link>
                    </p>
                  )}
                </div>
              )}

              <p className={styles.mas}>
                <Link href={urlFicha(f.slug)}>Ficha del {f.modelo}: fallos comunes y motores</Link>
                {" · "}
                <Link href="/vender-coche">Cómo venderlo sin estafas</Link>
                {" · "}
                <Link href="/calculadora-itp">ITP si lo compras</Link>
              </p>
            </div>
          )}

          <div className={styles.explica}>
            <h2 className={base.secTit}>Cómo lo calculamos</h2>
            <p>
              Partimos del rango de precios habitual de los anuncios de ese modelo, que aparece en
              su ficha, y le restamos un 7 % por cada año de antigüedad. Después lo ajustamos por
              los kilómetros (unos 13.000 al año se consideran normales) y por el estado. Es una
              estimación: no conoce la versión, el acabado, los extras ni la zona, que pueden
              mover el precio bastante. Para afinar, compara con anuncios del mismo motor y
              kilómetros parecidos. No es una tasación oficial ni el valor que usa Hacienda para
              el ITP.
            </p>
          </div>
        </div>
      </section>
    </MarcoPagina>
  );
}
