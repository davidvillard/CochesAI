import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import AnalyticsConsent from "./components/AnalyticsConsent";
import "./globals.css";

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
  metadataBase: new URL("https://cochesai.vercel.app"),
  applicationName: "Coches AI",
  category: "automotive",
  keywords: [
    "identificar coche por foto",
    "reconocer coche por imagen",
    "qué coche es",
    "precio coche segunda mano",
    "ficha técnica coche",
    "inteligencia artificial coches",
  ],
  icons: {
    icon: "/CochesAI-Logo.svg",
  },
  title: {
    default: "Coches AI: identifica un coche por foto",
    template: "%s | Coches AI",
  },
  description:
    "Sube una foto de un coche y conoce su modelo, ficha técnica, precio aproximado y alternativas.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Coches AI",
    title: "Coches AI: identifica un coche por foto",
    description:
      "Reconoce coches con IA y consulta su ficha técnica, precio aproximado y alternativas.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Coches AI: identifica un coche por foto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coches AI: identifica un coche por foto",
    description:
      "Reconoce coches con IA y consulta su ficha técnica, precio aproximado y alternativas.",
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
  authors: [{ name: "Coches AI" }],
  creator: "Coches AI",
  publisher: "Coches AI",
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
    name: "Coches AI",
    url: "https://cochesai.vercel.app",
    description:
      "Servicio gratuito para identificar coches a partir de una foto y consultar datos orientativos sobre ellos.",
    applicationCategory: "AutomotiveApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: {
      "@type": "Organization",
      name: "Coches AI",
      url: "https://cochesai.vercel.app",
      logo: "https://cochesai.vercel.app/CochesAI-Logo.png",
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
        {children}
      </body>
    </html>
  );
}
