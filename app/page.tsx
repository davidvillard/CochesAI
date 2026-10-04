"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Similar = { marca: string; modelo: string; motivo: string };

type Resultado = {
  esCoche: boolean;
  marca: string;
  modelo: string;
  generacion: string;
  anios: string;
  carroceria: string;
  combustibles: string[];
  potenciaCvRango: string;
  cambio: string;
  puertas: number;
  plazas: number;
  precioNuevoEurAprox: string;
  precioSegundaManoEur: { min: number; max: number };
  similares: Similar[];
  confianza: number;
  notas: string;
};

// Reduce la imagen a máx. 768px y la convierte a JPEG base64.
function resizeImage(file: File, maxSize = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas no disponible"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}

const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const PASOS_CARGA = [
  "Subiendo la foto",
  "Identificando el coche",
  "Estimando precio y alternativas",
];

import {
  CameraLinearIcon,
  UploadLinearIcon,
  ShieldLinearIcon,
  CheckReadLinearIcon,
  DangerLinearIcon,
  ScannerLinearIcon,
  CarLinearIcon,
  WaterdropLinearIcon,
  BoltLinearIcon,
  TransmissionLinearIcon,
  LoginLinearIcon,
  UsersGroupTwoRoundedLinearIcon,
  TagLinearIcon,
  MagnifierLinearIcon,
  NotesLinearIcon,
  ChatDotsLinearIcon,
  LikeLinearIcon,
  DislikeLinearIcon
} from "@solar-icons/react";

const IC = {
  carroceria: CarLinearIcon,
  combustible: WaterdropLinearIcon,
  potencia: BoltLinearIcon,
  cambio: TransmissionLinearIcon,
  puertas: LoginLinearIcon,
  plazas: UsersGroupTwoRoundedLinearIcon,
  pulgarSi: LikeLinearIcon,
  pulgarNo: DislikeLinearIcon,
};

function Icono({ d: Component }: { d: React.ElementType }) {
  return <Component size={20} />;
}

// Anillo de confianza que se dibuja al aparecer
function Anillo({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 36;
  const color =
    pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--aviso)" : "var(--error)";
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      role="img"
      aria-label={`Seguridad ${pct} %`}
    >
      <circle
        cx="44"
        cy="44"
        r="36"
        fill="none"
        stroke="var(--linea)"
        strokeWidth="8"
      />
      <circle
        className={styles.anilloValor}
        cx="44"
        cy="44"
        r="36"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={
          {
            stroke: color,
            strokeDasharray: C,
            strokeDashoffset: C * (1 - pct / 100),
            "--c": C,
          } as React.CSSProperties
        }
      />
      <text x="44" y="50" textAnchor="middle" className={styles.anilloTxt}>
        {pct}%
      </text>
    </svg>
  );
}

// Número que sube de 0 al valor final
function useContar(objetivo: number, activo: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!activo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setV(objetivo);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(objetivo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, activo]);
  return v;
}

const PREGUNTAS = [
  { p: "¿Es gratis?", r: "De momento sí, y sin registro." },
  {
    p: "¿Cómo de fiable es?",
    r: "Suele acertar la marca y el modelo cuando el coche se ve bien. La versión exacta, el motor y el precio son estimaciones, por eso cada resultado indica su nivel de seguridad.",
  },
  {
    p: "¿Qué foto funciona mejor?",
    r: "Una con el coche entero, buena luz y nada que lo tape. De frente o de tres cuartos da mejores resultados que de perfil o muy de cerca.",
  },
  {
    p: "¿Qué pasa con mi foto?",
    r: "Se envía a Google Gemini para analizarla y nuestro servidor no la guarda. En el plan gratuito, Google puede usar las imágenes para mejorar sus modelos.",
  },
  {
    p: "¿Puedo buscar por matrícula?",
    r: "Todavía no. Es lo siguiente que queremos añadir.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map(({ p, r }) => ({
    "@type": "Question",
    name: p,
    acceptedAnswer: { "@type": "Answer", text: r },
  })),
};

export default function Home() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Resultado | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [voto, setVoto] = useState<"si" | "no" | null>(null);

  const r = result && result.esCoche ? result : null;
  const noCoche = result !== null && !result.esCoche;
  const pct = r ? Math.round((r.confianza ?? 0) * 100) : 0;
  const nivel = pct >= 80 ? "alta" : pct >= 50 ? "media" : "baja";
  const min = useContar(r?.precioSegundaManoEur?.min ?? 0, !!r);
  const max = useContar(r?.precioSegundaManoEur?.max ?? 0, !!r);

  // Avanza los pasos mientras analiza
  useEffect(() => {
    if (!loading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(0);
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, PASOS_CARGA.length - 1)),
      2500
    );
    return () => clearInterval(id);
  }, [loading]);

  // Foco en el nombre del coche al llegar el resultado
  useEffect(() => {
    if (r) tituloRef.current?.focus({ preventScroll: true });
  }, [r]);

  // Libera la URL de la foto al salir
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  // Las secciones aparecen al hacer scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visto);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Pegar una imagen con Ctrl+V
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) =>
        x.type.startsWith("image/")
      );
      if (f) analyze(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  async function analyze(file: File) {
    setUltimo(file);
    setError(null);
    setResult(null);
    setVoto(null);

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setLoading(true);
    document
      .getElementById("identificador")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const base64 = await resizeImage(file);
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) analyze(file);
    e.target.value = "";
  }

  function soltar(e: React.DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) analyze(f);
  }

  async function votar(v: "si" | "no") {
    if (voto) return;
    setVoto(v);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto: v }),
      });
    } catch {
      // si falla, no molestamos al usuario
    }
  }

  const reintentar = !!error && !!ultimo;
  const acciones = (
    <div className={styles.acciones}>
      {reintentar && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnP}`}
          onClick={() => ultimo && analyze(ultimo)}
        >
          Reintentar
        </button>
      )}
      <button
        type="button"
        className={`${styles.btn} ${reintentar ? "" : styles.btnP}`}
        onClick={() => cameraRef.current?.click()}
      >
        <CameraLinearIcon size={20} /> Hacer foto
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={() => galleryRef.current?.click()}
      >
        <UploadLinearIcon size={20} /> Subir imagen
      </button>
    </div>
  );

  const filas: [keyof typeof IC, string, string][] = r
    ? ([
      ["carroceria", "Carrocería", r.carroceria ?? ""],
      ["combustible", "Combustible", r.combustibles?.join(", ") ?? ""],
      ["potencia", "Potencia", r.potenciaCvRango ?? ""],
      ["cambio", "Cambio", r.cambio ?? ""],
      ["puertas", "Puertas", r.puertas ? String(r.puertas) : ""],
      ["plazas", "Plazas", r.plazas ? String(r.plazas) : ""],
    ] as [keyof typeof IC, string, string][]).filter(([, , v]) => v)
    : [];

  const delay = (i: number) => ({ "--i": i } as React.CSSProperties);

  return (
    <div className={styles.app}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        hidden
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        hidden
      />

      <header className={styles.cab}>
        <div className={`${styles.cont} ${styles.cabIn}`}>
          <a href="#identificador" className={styles.logo}>
            <NextImage
              className={styles.logoImagen}
              src="/CochesAI-Logo-Completo.png"
              alt="Coches AI"
              width={122}
              height={101}
              priority
            />
          </a>
          <nav className={styles.nav} aria-label="Principal">
            <a href="#como-funciona" className={styles.navLink}>
              Cómo funciona
            </a>
            <a href="#incluye" className={styles.navLink}>
              Qué incluye
            </a>
            <a href="#preguntas" className={styles.navLink}>
              Preguntas
            </a>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnP} ${styles.btnS}`}
              onClick={() => galleryRef.current?.click()}
            >
              Subir foto
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section id="identificador" className={styles.hero}>
          <div className={styles.cont}>
            {!preview ? (
              <>
                <span className={styles.chip}>
                  <span className={styles.punto} /> Reconocimiento de coches con
                  IA
                </span>
                <h1 className={styles.h1}>
                  Sube una foto y descubre qué coche es
                </h1>
                <p className={styles.sub}>
                  Marca, modelo, ficha técnica, precio aproximado y alternativas.
                  Gratis y sin registro.
                </p>

                <div className={styles.zona}>
                  <div className={`${styles.flota} ${styles.flotaA}`} aria-hidden="true">
                    <span className={styles.flotaEt}>Ejemplo</span>
                    <span className={styles.flotaTit}>Seat León</span>
                    <span className={styles.flotaTxt}>Tercera generación</span>
                  </div>
                  <div className={`${styles.flota} ${styles.flotaB}`} aria-hidden="true">
                    <span className={styles.flotaEt}>Ejemplo</span>
                    <span className={styles.flotaTit}>7.000 € a 11.000 €</span>
                    <span className={styles.flotaTxt}>Segunda mano</span>
                  </div>

                  <div
                    className={`${styles.drop} ${arrastrando ? styles.dropActiva : ""
                      }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setArrastrando(true);
                    }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={soltar}
                  >
                    <span className={styles.dropIcono}>
                      <CameraLinearIcon size={34} />
                    </span>
                    <p className={styles.dropTitulo}>Arrastra una foto aquí</p>
                    <p className={styles.dropTexto}>
                      o pégala con Ctrl+V.
                    </p>

                    {acciones}
                  </div>
                </div>

                <p className={styles.nota}>
                  <ShieldLinearIcon size={16} />
                  <span>
                    Tu foto se analiza con Google Gemini y no la guardamos.{" "}
                    <Link href="/privacidad" className={styles.notaLink}>
                      Más información
                    </Link>
                  </span>
                </p>
              </>
            ) : (
              <div className={styles.res}>
                <div className={styles.resFoto}>
                  <div className={styles.foto}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Foto del coche que has elegido"
                      className={styles.fotoImg}
                    />
                    {loading && (
                      <>
                        <div className={styles.velo} />
                        <div className={styles.scan} />
                      </>
                    )}
                    <div
                      className={`${styles.marcoV} ${r ? styles.fijo : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className={styles.resInfo}>
                  {loading && (
                    <div role="status">
                      <h2 className={styles.estadoT}>Analizando tu foto</h2>
                      <ul className={styles.pasosCarga}>
                        {PASOS_CARGA.map((t, i) => (
                          <li
                            key={t}
                            className={`${styles.pasoC} ${i < step ? styles.pasoCOk : ""
                              } ${i === step ? styles.pasoCAct : ""}`}
                          >
                            <span className={styles.pasoIc}>
                              {i < step ? (
                                <CheckReadLinearIcon size={14} />
                              ) : i === step ? (
                                <span className={styles.spin} />
                              ) : null}
                            </span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {error && !loading && (
                    <>
                      <div className={`${styles.aviso} ${styles.entra}`} role="alert">
                        <DangerLinearIcon size={20} />
                        <div>
                          <p className={styles.avisoT}>No se pudo analizar la foto</p>
                          <p className={styles.avisoX}>{error}</p>
                        </div>
                      </div>
                      {acciones}
                    </>
                  )}

                  {noCoche && !loading && (
                    <>
                      <div
                        className={`${styles.aviso} ${styles.avisoN} ${styles.entra}`}
                        role="status"
                      >
                        <DangerLinearIcon size={20} />
                        <div>
                          <p className={styles.avisoT}>No veo ningún coche en esta foto</p>
                          <p className={styles.avisoX}>
                            Prueba con una foto donde se vea el coche entero y bien
                            iluminado.
                          </p>
                        </div>
                      </div>
                      {acciones}
                    </>
                  )}

                  {r && !loading && (
                    <>
                      <div className={`${styles.cabRes} ${styles.entra}`}>
                        <div>
                          <p className={styles.marcaR}>{r.marca}</p>
                          <h2
                            className={styles.modeloR}
                            ref={tituloRef}
                            tabIndex={-1}
                            aria-label={`${r.marca} ${r.modelo}`}
                          >
                            {r.modelo}
                          </h2>
                          <p className={styles.genR}>
                            {[r.generacion, r.anios].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <div className={styles.seg}>
                          <Anillo pct={pct} />
                          <span>Seguridad {nivel}</span>
                        </div>
                      </div>

                      {r.notas && (
                        <p className={`${styles.notaR} ${styles.entra}`} style={delay(1)}>
                          {r.notas}
                        </p>
                      )}

                      <div className={styles.specs}>
                        {filas.map(([ic, et, v], k) => (
                          <div
                            key={et}
                            className={`${styles.spec} ${styles.entra}`}
                            style={delay(k + 2)}
                          >
                            <span className={styles.specIc}>
                              <Icono d={IC[ic]} />
                            </span>
                            <div>
                              <span className={styles.specEt}>{et}</span>
                              <strong className={styles.specV}>{v}</strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      {r.precioSegundaManoEur && (
                        <div className={`${styles.precio} ${styles.entra}`} style={delay(8)}>
                          <p className={styles.precioEt}>Segunda mano en España</p>
                          <p className={styles.precioN}>
                            {eur(min)} a {eur(max)}
                          </p>
                          <p className={styles.precioX}>
                            {r.precioNuevoEurAprox
                              ? `Nuevo: ${r.precioNuevoEurAprox}. `
                              : ""}
                            Estimación de la IA, no es una tasación.
                          </p>
                        </div>
                      )}

                      {r.similares?.length > 0 && (
                        <>
                          <h3 className={styles.subT}>Coches parecidos</h3>
                          <div className={styles.similares}>
                            {r.similares.map((s, i) => (
                              <div
                                key={i}
                                className={`${styles.sim} ${styles.entra}`}
                                style={delay(9 + i)}
                              >
                                <span className={styles.simIni}>
                                  <CarLinearIcon size={22} />
                                </span>
                                <div>
                                  <p className={styles.simN}>
                                    {s.marca} {s.modelo}
                                  </p>
                                  <p className={styles.simM}>{s.motivo}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className={`${styles.voto} ${styles.entra}`} style={delay(12)}>
                        {voto ? (
                          <p className={styles.votoGracias} role="status">
                            Gracias, nos ayuda a mejorar.
                          </p>
                        ) : (
                          <>
                            <p className={styles.votoPregunta}>¿Ha acertado?</p>
                            <div className={styles.votoBotones}>
                              <button
                                type="button"
                                className={`${styles.btn} ${styles.btnS}`}
                                onClick={() => votar("si")}
                              >
                                <Icono d={IC.pulgarSi} /> Sí
                              </button>
                              <button
                                type="button"
                                className={`${styles.btn} ${styles.btnS}`}
                                onClick={() => votar("no")}
                              >
                                <Icono d={IC.pulgarNo} /> No
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      {acciones}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="como-funciona" className={styles.sec}>
          <div className={`${styles.cont} ${styles.revelar}`} data-reveal>
            <span className={styles.eyebrow}>Tres pasos</span>
            <h2 className={styles.secTit}>De la foto a la ficha en segundos</h2>
            <div className={`${styles.rej} ${styles.rej3}`}>
              {[
                {
                  t: "Sube una foto",
                  x: "Hazla ahora o elige una de tu galería. Funciona con fotos de la calle o de anuncios.",
                  Icon: CameraLinearIcon,
                },
                {
                  t: "La IA lo identifica",
                  x: "Analiza la forma, los faros y las proporciones para reconocer marca, modelo y generación.",
                  Icon: ScannerLinearIcon,
                },
                {
                  t: "Mira la ficha",
                  x: "Datos básicos, precio aproximado y coches parecidos. Confírmalos antes de comprar.",
                  Icon: CheckReadLinearIcon,
                },
              ].map(({ t, x, Icon }, i) => (
                <article key={t} className={styles.tarj}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className={styles.num}>{i + 1}</span>
                    <span className={styles.specIc} style={{ width: 48, height: 48 }}>
                      <Icon size={24} />
                    </span>
                  </div>
                  <h3 className={styles.tarjTit}>{t}</h3>
                  <p className={styles.tarjTxt}>{x}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="incluye" className={styles.sec}>
          <div className={`${styles.cont} ${styles.revelar}`} data-reveal>
            <span className={styles.eyebrow}>Qué incluye</span>
            <h2 className={styles.secTit}>Todo lo que sale de una sola foto</h2>
            <div className={`${styles.rej} ${styles.rej4}`}>
              <article className={`${styles.tarj} ${styles.tarjDest} ${styles.span2}`}>
                <span className={styles.specIc} style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  <CarLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Modelo y generación</h3>
                <p className={styles.tarjTxt}>
                  Marca, modelo, generación y años de fabricación, con un nivel de
                  seguridad para que sepas cuánto fiarte.
                </p>
              </article>
              <article className={styles.tarj}>
                <span className={styles.specIc}>
                  <NotesLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Ficha técnica</h3>
                <p className={styles.tarjTxt}>
                  Carrocería, combustible, potencia, cambio y plazas.
                </p>
              </article>
              <article className={styles.tarj}>
                <span className={styles.specIc}>
                  <TagLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Precio</h3>
                <p className={styles.tarjTxt}>
                  Rango de segunda mano en España y precio de nuevo.
                </p>
              </article>
              <article className={`${styles.tarj} ${styles.span2}`}>
                <span className={styles.specIc}>
                  <UsersGroupTwoRoundedLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Coches parecidos</h3>
                <p className={styles.tarjTxt}>
                  Alternativas del mismo segmento, con el motivo de cada una.
                </p>
              </article>
              <article className={`${styles.tarj} ${styles.span2}`}>
                <span className={styles.specIc}>
                  <MagnifierLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Matrícula, próximamente</h3>
                <p className={styles.tarjTxt}>
                  Datos básicos del vehículo a partir de su matrícula.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="preguntas" className={styles.sec}>
          <div className={`${styles.cont} ${styles.revelar}`} data-reveal>
            <span className={styles.eyebrow}>Preguntas frecuentes</span>
            <h2 className={styles.secTit}>Antes de empezar</h2>
            <div className={styles.faq}>
              {PREGUNTAS.map((q) => (
                <details key={q.p} className={styles.faqIt}>
                  <summary className={styles.faqP}>
                    <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <ChatDotsLinearIcon size={20} style={{ color: "var(--color)" }} />
                      {q.p}
                    </span>
                  </summary>
                  <p className={styles.faqR}>{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.cont} ${styles.cta}`}>
          <div className={`${styles.ctaP} ${styles.revelar}`} data-reveal>
            <h2 className={styles.ctaT}>Haz una foto y descubre qué coche es</h2>
            <p className={styles.ctaX}>Gratis, sin registro y en unos segundos.</p>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnBlanco}`}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                cameraRef.current?.click();
              }}
            >
              <CameraLinearIcon size={20} /> Hacer foto
            </button>
          </div>
        </section>
      </main>

      <footer className={styles.pie}>
        <div className={`${styles.cont} ${styles.pieIn}`}>
          <span>© 2026 Coches AI. Las identificaciones y los precios los genera una IA y pueden contener errores.</span>
          <nav className={styles.pieLinks} aria-label="Pie">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#incluye">Qué incluye</a>
            <a href="#preguntas">Preguntas</a>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
