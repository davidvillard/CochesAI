import Link from "next/link";
import NextImage from "next/image";
import {
  CameraLinearIcon,
  CheckReadLinearIcon,
  ScannerLinearIcon,
  CarLinearIcon,
  UsersGroupTwoRoundedLinearIcon,
  TagLinearIcon,
  MagnifierLinearIcon,
  NotesLinearIcon,
  ChatDotsLinearIcon,
} from "@solar-icons/react";
import styles from "./page.module.css";
import Identificador from "./components/Identificador";
import BotonFoto from "./components/BotonFoto";
import Revelar from "./components/Revelar";

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

// La portada se renderiza en el servidor; solo el identificador y los botones
// de foto se ejecutan en el navegador
export default function Home() {
  return (
    <div className={styles.app}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Revelar />

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
            <BotonFoto
              tipo="galeria"
              className={`${styles.btn} ${styles.btnP} ${styles.btnS}`}
            >
              Subir foto
            </BotonFoto>
          </nav>
        </div>
      </header>

      <main>
        <Identificador />

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

        <section id="herramientas" className={styles.sec}>
          <div className={`${styles.cont} ${styles.revelar}`} data-reveal>
            <span className={styles.eyebrow}>Más herramientas</span>
            <h2 className={styles.secTit}>¿Vas a comprar un coche de segunda mano?</h2>
            <div className={`${styles.rej} ${styles.rej4}`}>
              <Link href="/coches" className={`${styles.tarj} ${styles.span2} ${styles.tarjLink}`}>
                <span className={styles.specIc}>
                  <NotesLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>Fichas de coches</h3>
                <p className={styles.tarjTxt}>
                  Precio de segunda mano, generaciones, motores, puntos débiles y qué
                  revisar antes de comprar cada modelo.
                </p>
              </Link>
              <Link href="/matricula" className={`${styles.tarj} ${styles.span2} ${styles.tarjLink}`}>
                <span className={styles.specIc}>
                  <MagnifierLinearIcon size={24} />
                </span>
                <h3 className={styles.tarjTit}>¿De qué año es la matrícula?</h3>
                <p className={styles.tarjTxt}>
                  Fecha de matriculación aproximada y etiqueta ambiental de la DGT a
                  partir de la matrícula.
                </p>
              </Link>
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
            <BotonFoto
              tipo="camara"
              subir
              className={`${styles.btn} ${styles.btnBlanco}`}
            >
              <CameraLinearIcon size={20} /> Hacer foto
            </BotonFoto>
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
