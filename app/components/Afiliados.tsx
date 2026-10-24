import styles from "./Afiliados.module.css";
import { ofertasActivas } from "../lib/afiliados";

// Bloque "Antes de comprarlo" con los enlaces de afiliado configurados.
// Sin hooks: sirve tanto en páginas del servidor como dentro del identificador.
export default function Afiliados({ titulo = "Antes de comprarlo" }: { titulo?: string }) {
  const ofertas = ofertasActivas();
  if (!ofertas.length) return null;

  return (
    <aside className={styles.caja} aria-labelledby="afiliados-titulo">
      <h3 id="afiliados-titulo" className={styles.titulo}>
        {titulo}
      </h3>
      <ul className={styles.lista}>
        {ofertas.map((o) => (
          <li key={o.id} className={styles.oferta}>
            <div>
              <p className={styles.nombre}>{o.titulo}</p>
              <p className={styles.texto}>{o.texto}</p>
            </div>
            <a
              href={`/ir/${o.id}`}
              target="_blank"
              rel="sponsored nofollow noopener"
              className={styles.boton}
            >
              {o.boton}
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.aviso}>
        Enlaces de afiliado: si contratas algo, podemos recibir una comisión sin coste
        para ti.
      </p>
    </aside>
  );
}
