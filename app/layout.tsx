import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import AnalyticsConsent from "./components/AnalyticsConsent";
import Visitas from "./components/Visitas";
import RegistrarSW from "./components/RegistrarSW";
import "./globals.css";
import { SITE_URL } from "./lib/seo";
import { NOMBRE_CORTO, NOMBRE_WEB } from "./lib/marca";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const text = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: NOMBRE_CORTO,
  appleWebApp: { capable: true, title: NOMBRE_CORTO, statusBarStyle: "default" },
  category: "automotive",
  keywords: [
    "identificar coche por foto",
    "reconocer coche por imagen",
    "qué coche es",
    "precio coche segunda mano",
    "ficha técnica coche",
    "inteligencia artificial coches",
  ],
  title: {
    default: "Identificar coche por foto gratis y sin descargar app | ¿Qué coche es?",
    template: "%s | ¿Qué coche es?",
  },
  description:
    "Reconoce cualquier coche por foto desde el navegador, sin instalar apps: descubre qué modelo es, su ficha técnica y su precio de segunda mano. Gratis.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: NOMBRE_WEB,
    title: "Identificar coche por foto gratis | ¿Qué coche es?",
    description:
      "Sube la foto de un coche y descubre qué modelo es, su ficha técnica y su precio de segunda mano.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "¿Qué coche es? Identifica un coche por foto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Identificar coche por foto gratis | ¿Qué coche es?",
    description:
      "Sube la foto de un coche y descubre qué modelo es, su ficha técnica y su precio de segunda mano.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  authors: [{ name: NOMBRE_WEB }],
  creator: NOMBRE_WEB,
  publisher: NOMBRE_WEB,
  verification: {
    google: "gFf5Yx-WKMqeVB9tL1ZoBHpDn84roE32XKY4qD2je2A",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F8FC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: NOMBRE_WEB,
    url: SITE_URL,
    description:
      "Web gratuita para identificar un coche por foto sin instalar ninguna app: reconoce la marca, el modelo y la generación, y muestra su ficha y su precio de segunda mano.",
    browserRequirements: "Funciona en cualquier navegador, sin instalación",
    featureList: [
      "Identificar coche por foto",
      "Buscar el modelo de un coche por foto",
      "Precio de segunda mano estimado",
      "Año y etiqueta ambiental por matrícula",
      "Calculadora de ITP",
    ],
    applicationCategory: "AutomotiveApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: {
      "@type": "Organization",
      name: NOMBRE_WEB,
      url: SITE_URL,
      logo: `${SITE_URL}/CochesAI-Logo.png`,
    },
  };

  return (
    <html lang="es" className={`${display.variable} ${text.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <AnalyticsConsent />
        <Visitas />
        <RegistrarSW />
        {children}
      </body>
    </html>
  );
}
