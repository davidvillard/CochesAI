import Link from "next/link";
import Cabecera from "./Cabecera";
import styles from "../page.module.css";

// Cabecera y pie de las páginas secundarias (todas menos la portada)
export default function MarcoPagina({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.app}>
      <Cabecera />

      <main>{children}</main>

      <footer className={styles.pie}>
        <div className={`${styles.cont} ${styles.pieIn}`}>
          <span>
            © 2026 ¿Qué coche es?. Los datos son orientativos y pueden contener errores.
          </span>
          <nav className={styles.pieLinks} aria-label="Pie">
            <Link href="/">Identificar por foto</Link>
            <Link href="/coches">Fichas de coches</Link>
            <Link href="/matricula">Matrícula y etiqueta</Link>
            <Link href="/herramientas">Herramientas</Link>
            <Link href="/glosario">Glosario</Link>
            <Link href="/metodologia">Metodología</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
