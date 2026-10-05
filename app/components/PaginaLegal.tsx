import Link from "next/link";
import styles from "../legal.module.css";
import { LEGAL } from "../datos-legales";
import NextImage from "next/image";

export default function PaginaLegal({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    // En local avisa si aún quedan datos por rellenar en datos-legales.ts
    const pendiente = Object.values(LEGAL).some((v) => v.startsWith("["));

    return (
        <div className={styles.pagina}>
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
                        <Link href="/" className={styles.volver}>
                            Volver al inicio
                        </Link>
                    </nav>
                </div>
            </header>


            <main className={styles.texto}>
                {pendiente && process.env.NODE_ENV !== "production" && (
                    <p className={styles.pendiente}>
                        Faltan datos por completar en <code>app/datos-legales.ts</code>.
                    </p>
                )}
                <h1 className={styles.h1}>{titulo}</h1>
                <p className={styles.fecha}>Última actualización: {LEGAL.fecha}</p>
                {children}
            </main>

            <footer className={styles.pie}>
                <div className={styles.pieIn}>
                    <span>© 2026 {LEGAL.nombreWeb}</span>
                    <nav className={styles.pieLinks} aria-label="Legal">
                        <Link href="/privacidad" className={styles.pieEnlace}>
                            Privacidad
                        </Link>
                        <Link href="/aviso-legal" className={styles.pieEnlace}>
                            Aviso legal
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}