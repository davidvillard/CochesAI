"use client";

import { useEffect, useState } from "react";
import {
  ChatRoundBoldIcon,
  CheckReadLinearIcon,
  CopyLinearIcon,
} from "@solar-icons/react";
import styles from "../page.module.css";
import { eur } from "../lib/formato";
import type { Resultado } from "../lib/resultados";
import { medir } from "../lib/medir";

const NOMBRE_WEB = "Coches AI"; // cámbialo aquí cuando decidas el nombre definitivo

// Con id enlaza a la ficha compartida; sin él (Redis sin configurar), a la portada
function textoCompartir(r: Resultado) {
  const nombre = [r.marca, r.modelo].filter(Boolean).join(" ");
  const detalle = [r.generacion, r.anios].filter(Boolean).join(", ");
  const precio = r.precioSegundaManoEur
    ? ` Precio aproximado de segunda mano: ${eur(r.precioSegundaManoEur.min)} a ${eur(r.precioSegundaManoEur.max)}.`
    : "";
  const enlace = r.id
    ? `${window.location.origin}/r/${r.id}`
    : window.location.origin;
  return `He descubierto qué coche es con ${NOMBRE_WEB}: ${nombre}${detalle ? ` (${detalle})` : ""}.${precio} Míralo aquí: ${enlace}`;
}

export default function Compartir({ r, style }: { r: Resultado; style?: React.CSSProperties }) {
  const [copiado, setCopiado] = useState(false);
  // El texto usa window, así que se calcula tras montar (no en el servidor)
  const [texto, setTexto] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexto(textoCompartir(r));
  }, [r]);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    medir(["compartir", "copiar"]);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      window.prompt("Copia el texto:", texto);
    }
  }

  return (
    <div className={`${styles.compartir} ${styles.entra}`} style={style}>
      <p className={styles.compartirTitulo}>Compártelo</p>
      <div className={styles.compartirBotones}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => medir(["compartir", "whatsapp"])}
          className={`${styles.btn} ${styles.btnP} ${styles.btnS}`}
        >
          <ChatRoundBoldIcon size={20} /> WhatsApp
        </a>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnS}`}
          onClick={copiar}
        >
          {copiado ? <CheckReadLinearIcon size={20} /> : <CopyLinearIcon size={20} />}
          <span aria-live="polite">{copiado ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
    </div>
  );
}
