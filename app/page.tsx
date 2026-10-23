"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import FichaCoche from "./components/FichaCoche";
import Compartir from "./components/Compartir";
import type { Resultado } from "./lib/resultados";

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
  UsersGroupTwoRoundedLinearIcon,
  TagLinearIcon,
  MagnifierLinearIcon,
  NotesLinearIcon,
  ChatDotsLinearIcon,
  LikeLinearIcon,
  DislikeLinearIcon,
} from "@solar-icons/react";

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
    r: "Sí: en la sección «Matrícula y etiqueta» calculas la fecha de matriculación aproximada de un coche y su etiqueta ambiental de la DGT, gratis.",
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
            <Link href="/coches" className={styles.navLink}>
              Fichas
            </Link>
            <Link href="/matricula" className={styles.navLink}>
              Matrícula
            </Link>
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
                      <FichaCoche r={r} tituloRef={tituloRef} />
                      <Compartir r={r} style={delay(11)} />
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
                                <LikeLinearIcon size={20} /> Sí
                              </button>
                              <button
                                type="button"
                                className={`${styles.btn} ${styles.btnS}`}
                                onClick={() => votar("no")}
                              >
                                <DislikeLinearIcon size={20} /> No
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
                <h3 className={styles.tarjTit}>
                  <Link href="/matricula" className={styles.notaLink}>
                    Matrícula y etiqueta
                  </Link>
                </h3>
                <p className={styles.tarjTxt}>
                  Fecha de matriculación aproximada y etiqueta ambiental de la DGT a
                  partir de la matrícula.
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
            <Link href="/coches">Fichas de coches</Link>
            <Link href="/matricula">Matrícula y etiqueta</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
