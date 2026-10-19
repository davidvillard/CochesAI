import Link from "next/link";
import NextImage from "next/image";
import styles from "../page.module.css";

// Cabecera y pie de las páginas secundarias (matrícula, resultados compartidos)
export default function MarcoPagina({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.app}>
      <header className={styles.cab}>
        <div className={`${styles.cont} ${styles.cabIn}`}>
          <Link href="/" className={styles.logo}>
            <NextImage
              className={styles.logoImagen}
              src="/CochesAI-Logo-Completo.png"
              alt="Coches AI"
              width={122}
              height={101}
              priority
            />
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <Link href="/matricula" className={styles.navLink}>
              Matrícula y etiqueta
            </Link>
            <Link href="/" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`}>
              Identificar por foto
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className={styles.pie}>
        <div className={`${styles.cont} ${styles.pieIn}`}>
          <span>
            © 2026 Coches AI. Los datos son orientativos y pueden contener errores.
          </span>
          <nav className={styles.pieLinks} aria-label="Pie">
            <Link href="/">Identificar por foto</Link>
            <Link href="/matricula">Matrícula y etiqueta</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
