"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import styles from "../AnalyticsConsent.module.css";

const GA_ID = "G-GLN10TSQBL";
const CONSENT_KEY = "cochesai.analytics-consent";

type Consent = "accepted" | "rejected" | null;

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(saved);
      setShowBanner(false);
    } else {
      // No se carga ninguna etiqueta hasta que el usuario elija.
      setShowBanner(true);
    }
    setReady(true);
  }, []);

  function choose(value: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    setShowBanner(false);

    if (value === "rejected") {
      const win = window as typeof window & {
        gtag?: (...args: unknown[]) => void;
      };
      win.gtag?.("consent", "update", { analytics_storage: "denied" });

      // Revoca las cookies propias que GA4 haya creado durante esta sesión.
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        if (name === "_ga" || name.startsWith("_ga_")) {
          document.cookie = `${name}=; Max-Age=0; path=/`;
        }
      });
    }
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);}
              window.gtag('consent', 'default', { analytics_storage: 'denied' });
              window.gtag('consent', 'update', { analytics_storage: 'granted' });
              window.gtag('js', new Date());
              window.gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {ready && showBanner && (
        <aside className={styles.banner} aria-label="Preferencias de cookies">
          <strong className={styles.titulo}>Tu privacidad importa</strong>
          <p className={styles.texto}>
            Usamos cookies analíticas opcionales de Google Analytics para saber
            qué partes de la web funcionan mejor. Solo se activan si las aceptas;
            puedes rechazar o cambiar tu decisión cuando quieras.
          </p>
          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => choose("accepted")}
            >
              Aceptar analítica
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => choose("rejected")}
            >
              Rechazar analítica
            </button>
            <Link href="/privacidad#cookies" className={styles.enlace}>
              Más información
            </Link>
          </div>
        </aside>
      )}

      {ready && consent !== null && !showBanner && (
        <button
          type="button"
          className={styles.preferencias}
          onClick={() => setShowBanner(true)}
        >
          Cambiar preferencias de cookies
        </button>
      )}
    </>
  );
}
