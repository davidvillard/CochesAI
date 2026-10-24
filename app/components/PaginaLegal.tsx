import styles from "../legal.module.css";
import { LEGAL } from "../datos-legales";
import MarcoPagina from "./MarcoPagina";

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
        <MarcoPagina>
            <div className={styles.texto}>
                {pendiente && process.env.NODE_ENV !== "production" && (
                    <p className={styles.pendiente}>
                        Faltan datos por completar en <code>app/datos-legales.ts</code>.
                    </p>
                )}
                <h1 className={styles.h1}>{titulo}</h1>
                <p className={styles.fecha}>Última actualización: {LEGAL.fecha}</p>
                {children}
            </div>
        </MarcoPagina>
    );
}
