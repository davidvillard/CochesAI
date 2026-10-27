"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CameraLinearIcon,
  UploadLinearIcon,
  ShieldLinearIcon,
  CheckReadLinearIcon,
  DangerLinearIcon,
  LikeLinearIcon,
  DislikeLinearIcon,
} from "@solar-icons/react";
import styles from "../page.module.css";
import FichaCoche from "./FichaCoche";
import Compartir from "./Compartir";
import Afiliados from "./Afiliados";
import { ENTRADA } from "./BotonFoto";
import type { Resultado } from "../lib/resultados";
import { medir } from "../lib/medir";

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

// La parte interactiva de la portada: subida de la foto, análisis y resultado
export default function Identificador() {
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

  // Enlace a la ficha que llega después del resultado (se genera en segundo plano)
  const [fichaTardia, setFichaTardia] = useState<string | null>(null);

  const identificado = result && result.esCoche ? result : null;
  const r = useMemo(
    () =>
      identificado && !identificado.ficha && fichaTardia
        ? { ...identificado, ficha: fichaTardia }
        : identificado,
    [identificado, fichaTardia]
  );
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
    if (identificado) tituloRef.current?.focus({ preventScroll: true });
  }, [identificado]);

  // Si el coche aún no tenía ficha, pregunta cada 3 s si ya se ha creado.
  // Para cuando aparece, cuando el servidor dice que no se está generando
  // o tras 45 s, y también si llega otro resultado.
  useEffect(() => {
    if (!identificado || identificado.ficha) return;
    const { marca, modelo } = identificado;
    let intentos = 0;
    let parar = false;
    const id = setInterval(async () => {
      if (parar || ++intentos > 15) return clearInterval(id);
      try {
        const q = new URLSearchParams({ marca, modelo });
        const res = await fetch(`/api/ficha?${q}`);
        const data: { ficha?: string; pendiente: boolean } = await res.json();
        if (parar) return;
        if (data.ficha) setFichaTardia(data.ficha);
        if (data.ficha || !data.pendiente) {
          parar = true;
          clearInterval(id);
        }
      } catch {
        // sin red: lo intenta en la siguiente vuelta
      }
    }, 3000);
    return () => {
      parar = true;
      clearInterval(id);
    };
  }, [identificado]);

  // Libera la URL de la foto al salir
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);


  // Pegar una imagen con Ctrl+V
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) =>
        x.type.startsWith("image/")
      );
      if (f) analyze(f, "pegar");
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  async function analyze(file: File, origen?: string) {
    if (origen) medir(["foto", origen]);
    setUltimo(file);
    setError(null);
    setResult(null);
    setFichaTardia(null);
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
    if (file) analyze(file, e.target.id === ENTRADA.camara ? "camara" : "galeria");
    e.target.value = "";
  }

  function soltar(e: React.DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) analyze(f, "arrastrar");
  }

  async function votar(v: "si" | "no") {
    if (voto) return;
    setVoto(v);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto: v, marca: result?.marca, modelo: result?.modelo }),
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
    <>
      <input
        ref={cameraRef}
        id={ENTRADA.camara}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        hidden
      />
      <input
        ref={galleryRef}
        id={ENTRADA.galeria}
        type="file"
        accept="image/*"
        onChange={handleFile}
        hidden
      />
      <section id="identificador" className={styles.hero}>
        <div className={styles.cont}>
          {!preview ? (
            <>
              <span className={styles.chip}>
                <span className={styles.punto} /> Sin descargar ninguna app
              </span>
              <h1 className={styles.h1}>
                Identifica un coche por foto
              </h1>
              <p className={styles.sub}>
                Sube la foto y descubre qué coche es: marca, modelo, ficha técnica,
                precio de segunda mano y alternativas. Desde el navegador, gratis y
                sin registro.
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
                    Cómo tratamos tu foto
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
                    <Afiliados />
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
    </>
  );
}
