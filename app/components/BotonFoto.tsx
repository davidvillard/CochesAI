"use client";

// Abre la cámara o la galería del identificador desde cualquier parte de la
// portada. Los <input type="file"> viven en Identificador con estos ids.
export const ENTRADA = { camara: "entrada-camara", galeria: "entrada-galeria" };

export default function BotonFoto({
  tipo,
  subir = false,
  className,
  children,
}: {
  tipo: keyof typeof ENTRADA;
  subir?: boolean; // vuelve arriba, donde aparece el resultado
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (subir) window.scrollTo({ top: 0, behavior: "smooth" });
        document.getElementById(ENTRADA[tipo])?.click();
      }}
    >
      {children}
    </button>
  );
}
