import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import base from "../page.module.css";
import styles from "./panel.module.css";
import { leerDias, type Dia } from "../lib/contadores";
import { redis } from "../lib/redis";

// Panel privado con la analítica propia: /panel?clave=TU_STATS_KEY
// Sin la clave (o sin STATS_KEY en Vercel) responde como si no existiera.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
  // Que la clave de la URL no viaje a otras webs al pulsar un enlace
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<{ clave?: string; dias?: string }> };

const RANGOS = [7, 30, 90];
const num = (n: number) => n.toLocaleString("es-ES");

// Suma de todos los días de un grupo: { valor: total }
function sumar(dias: Dia[], grupo: string) {
  const r: Record<string, number> = {};
  for (const d of dias) {
    for (const [k, v] of Object.entries(d.grupos[grupo] ?? {})) r[k] = (r[k] ?? 0) + v;
  }
  return r;
}

const total = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

const NOMBRES: Record<string, string> = {
  movil: "Móvil",
  ordenador: "Ordenador",
  tablet: "Tablet",
  directo: "Directo o app (sin referente)",
  camara: "Cámara",
  galeria: "Galería",
  arrastrar: "Arrastrar",
  pegar: "Pegar (Ctrl+V)",
  compartir: "Compartida desde otra app",
  "/": "/ (portada)",
};

function Lista({ datos, max = 12 }: { datos: Record<string, number>; max?: number }) {
  const filas = Object.entries(datos)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!filas.length) return <p className={styles.vacio}>Todavía sin datos.</p>;
  const tope = filas[0][1];
  const suma = total(datos);
  const fila = ([k, v]: [string, number]) => (
    <li key={k} className={styles.fila} title={`${NOMBRES[k] ?? k}: ${num(v)} (${Math.round((v / suma) * 100)} %)`}>
      <span className={styles.nombre}>{NOMBRES[k] ?? k}</span>
      <span className={styles.valor}>{num(v)}</span>
      <span className={styles.pista}>
        <span className={styles.barra} style={{ width: `${(v / tope) * 100}%`, display: "block" }} />
      </span>
    </li>
  );
  return (
    <>
      <ul className={styles.lista}>{filas.slice(0, max).map(fila)}</ul>
      {filas.length > max && (
        <details className={styles.mas}>
          <summary>Ver los {filas.length - max} restantes</summary>
          <ul className={styles.lista}>{filas.slice(max).map(fila)}</ul>
        </details>
      )}
    </>
  );
}

function Columnas({ puntos }: { puntos: { etiqueta: string; valor: number }[] }) {
  const tope = Math.max(1, ...puntos.map((p) => p.valor));
  return (
    <>
      <div className={styles.columnas} role="img" aria-label={puntos.map((p) => `${p.etiqueta}: ${p.valor}`).join(", ")}>
        {puntos.map((p) => (
          <div key={p.etiqueta} className={styles.col} title={`${p.etiqueta}: ${num(p.valor)}`}>
            <span style={{ height: `${(p.valor / tope) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className={styles.ejes}>
        <span>{puntos[0]?.etiqueta}</span>
        <span>máx. {num(tope)}</span>
        <span>{puntos.at(-1)?.etiqueta}</span>
      </div>
    </>
  );
}

function Tarjeta({
  titulo,
  para,
  ancha,
  children,
}: {
  titulo: string;
  para: string;
  ancha?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.tarjeta} ${ancha ? styles.ancha : ""}`}>
      <h3>{titulo}</h3>
      <p className={styles.para}>{para}</p>
      {children}
    </section>
  );
}

export default async function Panel({ searchParams }: Props) {
  const { clave, dias: diasTexto } = await searchParams;
  const secreta = process.env.STATS_KEY;
  if (!secreta || clave !== secreta || !redis) notFound();

  const n = RANGOS.includes(Number(diasTexto)) ? Number(diasTexto) : 30;
  const [dias, si, no] = await Promise.all([
    leerDias(n),
    redis.get<number>("quecoche:feedback:si"),
    redis.get<number>("quecoche:feedback:no"),
  ]);
  const cronologico = [...dias].reverse();
  const g = (grupo: string) => sumar(dias, grupo);

  const vistas = total(g("vista"));
  const visitas = total(g("entrada"));
  const analisis = dias.reduce((a, d) => a + d.analisis, 0);
  const noCoche = dias.reduce((a, d) => a + d.noCoche, 0);
  const errores = dias.reduce((a, d) => a + d.errores, 0);
  const votos = g("voto");
  const votosTotal = (votos.si ?? 0) + (votos.no ?? 0);
  const siHist = Number(si) || 0;
  const noHist = Number(no) || 0;
  const corto = (fecha: string) => fecha.slice(8, 10) + "/" + fecha.slice(5, 7);

  const kpis: [string, string][] = [
    [num(visitas), "Visitas (entradas a la web)"],
    [num(vistas), "Páginas vistas"],
    [visitas ? (vistas / visitas).toLocaleString("es-ES", { maximumFractionDigits: 1 }) : "—", "Páginas por visita"],
    [num(analisis), "Fotos analizadas"],
    [analisis ? `${Math.round((noCoche / analisis) * 100)} %` : "—", "Fotos sin coche"],
    [
      votosTotal ? `${Math.round(((votos.si ?? 0) / votosTotal) * 100)} %` : "—",
      `Acierto según los votos (${num(votosTotal)}; histórico ${siHist + noHist ? Math.round((siHist / (siHist + noHist)) * 100) : 0} %)`,
    ],
    [num(errores), "Errores al analizar"],
    [num(total(g("afiliado"))), "Clics en afiliados"],
  ];

  const herramientas = (["itp", "transferencia", "matricula", "prediccion", "itv", "vin", "imprimir"] as const)
    .map((e) => [e, total(g(`ev:${e}`))] as const)
    .filter(([, v]) => v > 0);

  return (
    <div className={base.app}>
      <main className={styles.panel}>
        <div className={styles.cabeza}>
          <div>
            <h1 className={styles.titulo}>Panel de ¿Qué coche es?</h1>
            <p className={styles.nota}>
              Últimos {n} días, hora de España. Analítica propia sin cookies: cuenta también a quien
              rechaza Google Analytics. Pasa el ratón por una barra para ver el detalle.
            </p>
          </div>
          <nav className={styles.rangos} aria-label="Periodo">
            {RANGOS.map((r) => (
              <Link
                key={r}
                href={`/panel?clave=${encodeURIComponent(secreta)}&dias=${r}`}
                className={styles.rango}
                aria-current={r === n ? "page" : undefined}
              >
                {r} días
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.kpis}>
          {kpis.map(([valor, et]) => (
            <div key={et} className={styles.kpi}>
              <p className={styles.kpiN}>{valor}</p>
              <p className={styles.kpiEt}>{et}</p>
            </div>
          ))}
        </div>

        <h2 className={styles.bloque}>Tráfico</h2>
        <div className={styles.rejilla}>
          <Tarjeta titulo="Visitas por día" para="Entradas a la web cada día. Mira si sube tras publicar algo." ancha>
            <Columnas puntos={cronologico.map((d) => ({ etiqueta: corto(d.fecha), valor: total(d.grupos.entrada ?? {}) }))} />
          </Tarjeta>
          <Tarjeta titulo="Páginas de entrada" para="Por dónde entra la gente (casi siempre desde Google). Las que más traen merecen más contenido y enlaces.">
            <Lista datos={g("entrada")} />
          </Tarjeta>
          <Tarjeta titulo="Páginas más vistas" para="Todas las páginas vistas, también al navegar dentro de la web.">
            <Lista datos={g("vista")} />
          </Tarjeta>
          <Tarjeta titulo="De dónde vienen" para="Buscadores, IAs (ChatGPT, Perplexity), redes y webs que te enlazan. Usa ?utm_source=algo en tus enlaces para distinguirlos.">
            <Lista datos={g("origen")} />
          </Tarjeta>
          <Tarjeta titulo="Dispositivo" para="Si casi todo es móvil, prioriza la velocidad y el diseño en móvil.">
            <Lista datos={g("disp")} />
          </Tarjeta>
          <Tarjeta titulo="Hora del día" para="Páginas vistas por hora. Publica y comparte justo antes de las horas fuertes." ancha>
            <Columnas
              puntos={Array.from({ length: 24 }, (_, h) => {
                const k = String(h).padStart(2, "0");
                return { etiqueta: `${k}:00`, valor: g("hora")[k] ?? 0 };
              })}
            />
          </Tarjeta>
        </div>

        <h2 className={styles.bloque}>Qué coches interesan</h2>
        <div className={styles.rejilla}>
          <Tarjeta titulo="Fotos analizadas por día" para="Uso de la función principal. El tope diario está en LIMITE_DIARIO_GLOBAL." ancha>
            <Columnas puntos={cronologico.map((d) => ({ etiqueta: corto(d.fecha), valor: d.analisis }))} />
          </Tarjeta>
          <Tarjeta titulo="Coches identificados" para="Los modelos que la gente fotografía. Son las fichas, comparativas y artículos de fallos que más te conviene cuidar.">
            <Lista datos={g("coche")} max={15} />
          </Tarjeta>
          <Tarjeta titulo="Marcas" para="Marcas más fotografiadas: candidatas a páginas de marca más completas.">
            <Lista datos={g("marca")} />
          </Tarjeta>
          <Tarjeta titulo="Comparaciones" para="Parejas que la gente compara. Las repetidas merecen una página propia indexable («X o Y»).">
            <Lista datos={g("ev:comparar")} />
          </Tarjeta>
          <Tarjeta titulo="Fallos de la IA por coche" para="Votos «no ha acertado». Si un modelo se repite, revisa el prompt o la ficha.">
            <Lista datos={g("fallo")} />
          </Tarjeta>
          <Tarjeta titulo="Seguridad de la IA" para="Alta ≥ 85 %, media ≥ 70 % (crea ficha), baja < 70 %.">
            <Lista datos={g("confianza")} />
          </Tarjeta>
          <Tarjeta titulo="Cómo suben la foto" para="Cámara = gente en la calle con el móvil; galería y pegar = fotos de anuncios o redes.">
            <Lista datos={g("ev:foto")} />
          </Tarjeta>
        </div>

        <h2 className={styles.bloque}>Herramientas</h2>
        <div className={styles.rejilla}>
          <Tarjeta titulo="Uso de cada herramienta" para="Cuántas veces se ha usado cada una con un resultado. Las más usadas merecen más visibilidad en la portada.">
            <Lista datos={Object.fromEntries(herramientas)} />
          </Tarjeta>
          <Tarjeta titulo="ITP por comunidad" para="Comunidades que más calculan. Refuerza su página /calculadora-itp/… y enlázala.">
            <Lista datos={g("ev:itp")} />
          </Tarjeta>
          <Tarjeta titulo="Transferencia por comunidad" para="Lo mismo para el coste total del cambio de nombre.">
            <Lista datos={g("ev:transferencia")} />
          </Tarjeta>
          <Tarjeta titulo="Precio del coche (ITP)" para="En qué precios compra la gente: orienta qué coches y afiliados mostrar.">
            <Lista datos={g("ev:precio")} />
          </Tarjeta>
          <Tarjeta titulo="Antigüedad del coche" para="Años de los coches en ITP e ITV.">
            <Lista datos={g("ev:antiguedad")} />
          </Tarjeta>
          <Tarjeta titulo="Matrículas consultadas" para="Primera letra consultada. Mira qué años interesan más en /matricula/[letra].">
            <Lista datos={g("ev:matricula")} />
          </Tarjeta>
          <Tarjeta titulo="Etiqueta resultante" para="Etiquetas que salen al consultar con combustible.">
            <Lista datos={g("ev:etiqueta")} />
          </Tarjeta>
          <Tarjeta titulo="¿Qué matrícula me toca?" para="Año elegido. Si hay muchos del año que viene, son compradores de coche nuevo.">
            <Lista datos={g("ev:prediccion")} />
          </Tarjeta>
          <Tarjeta titulo="ITV por tipo" para="Tipo de vehículo en la calculadora de ITV.">
            <Lista datos={g("ev:itv")} />
          </Tarjeta>
          <Tarjeta titulo="Bastidor: fabricante" para="Coches cuyo VIN se consulta: suelen ser importados o de segunda mano.">
            <Lista datos={g("ev:vin")} />
          </Tarjeta>
          <Tarjeta titulo="Bastidor: país" para="Si sale mucho Alemania, interesa contenido sobre importar coches.">
            <Lista datos={g("ev:vin-pais")} />
          </Tarjeta>
          <Tarjeta titulo="Compartir e imprimir" para="Botones de compartir resultados e imprimir checklist o contrato.">
            <Lista
              datos={{
                ...Object.fromEntries(Object.entries(g("ev:compartir")).map(([k, v]) => [`compartir: ${k}`, v])),
                ...Object.fromEntries(Object.entries(g("ev:imprimir")).map(([k, v]) => [`imprimir: ${k}`, v])),
              }}
            />
          </Tarjeta>
          <Tarjeta titulo="Clics en afiliados" para="Por oferta (lib/afiliados.ts).">
            <Lista datos={g("afiliado")} />
          </Tarjeta>
        </div>

        <h2 className={styles.bloque}>SEO y técnica</h2>
        <div className={styles.rejilla}>
          <Tarjeta titulo="Páginas que no existen (404)" para="Enlaces rotos o fichas que la gente busca y aún no tienes.">
            <Lista datos={g("ev:404")} />
          </Tarjeta>
          <Tarjeta titulo="Robots" para="Visitas de robots que ejecutan JavaScript. No cuentan como visitas.">
            <Lista datos={g("bot")} />
          </Tarjeta>
          <Tarjeta titulo="Lo que renderiza Google" para="Páginas que Googlebot ha procesado. Si una no aparece nunca, revisa que esté enlazada y en el sitemap.">
            <Lista datos={g("rastreo")} />
          </Tarjeta>
          <Tarjeta titulo="Modelo de Gemini que respondió" para="Si el principal falla mucho, se tira de los de respaldo.">
            <Lista datos={g("modelo")} />
          </Tarjeta>
          <Tarjeta titulo="Rechazos" para="Análisis bloqueados por el límite por persona o por el tope diario.">
            <Lista
              datos={{
                "Límite por persona": dias.reduce((a, d) => a + d.rechazadosPorIp, 0),
                "Tope diario": dias.reduce((a, d) => a + d.rechazadosPorTopeDiario, 0),
              }}
            />
          </Tarjeta>
        </div>
      </main>
    </div>
  );
}
