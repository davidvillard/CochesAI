"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-GLN10TSQBL";
const CONSENT_KEY = "cochesai.analytics-consent";

type Consent = "accepted" | "rejected" | null;

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      // La decisión se lee del almacenamiento del navegador después de hidratar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(saved);
    }
  }, []);

  function choose(value: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
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
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {consent === null && (
        <aside
          aria-label="Preferencias de cookies"
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 100,
            maxWidth: 720,
            margin: "0 auto",
            padding: 20,
            border: "1px solid #d0d5dd",
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 10px 30px rgba(16, 24, 40, .15)",
          }}
        >
          <strong>Tu privacidad importa</strong>
          <p style={{ margin: "8px 0 14px", lineHeight: 1.5 }}>
            Usamos Google Analytics solo si aceptas las cookies analíticas, para
            saber qué partes de la web funcionan mejor. No enviamos tus fotos ni
            los resultados de las identificaciones.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={() => choose("accepted")}>
              Aceptar analítica
            </button>
            <button type="button" onClick={() => choose("rejected")}>
              Rechazar
            </button>
            <Link href="/privacidad#cookies">Más información</Link>
          </div>
        </aside>
      )}
    </>
  );
}
