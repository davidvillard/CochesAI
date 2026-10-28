"use client";

import { useEffect, useState } from "react";

type AvisoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// "Instalar la app": solo aparece cuando el navegador permite instalar la web
// (Chrome, Edge, Samsung Internet). En iPhone se explica cómo hacerlo a mano.
export default function BotonInstalar({ className, ayudaClassName }: { className?: string; ayudaClassName?: string }) {
  const [aviso, setAviso] = useState<AvisoInstalar | null>(null);
  const [iphone, setIphone] = useState(false);

  useEffect(() => {
    const instalada = matchMedia("(display-mode: standalone)").matches;
    if (instalada) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIphone(/iphone|ipad/i.test(navigator.userAgent));
    const guardar = (e: Event) => {
      e.preventDefault();
      setAviso(e as AvisoInstalar);
    };
    const instalar = () => setAviso(null);
    addEventListener("beforeinstallprompt", guardar);
    addEventListener("appinstalled", instalar);
    return () => {
      removeEventListener("beforeinstallprompt", guardar);
      removeEventListener("appinstalled", instalar);
    };
  }, []);

  if (aviso) {
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          await aviso.prompt();
          await aviso.userChoice;
          setAviso(null);
        }}
      >
        Instalar la app (gratis, sin tienda)
      </button>
    );
  }
  if (iphone) {
    return (
      <p className={ayudaClassName}>
        Para tenerla como app: pulsa Compartir y luego «Añadir a pantalla de inicio».
      </p>
    );
  }
  return null;
}
