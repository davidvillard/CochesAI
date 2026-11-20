"use client";

import { useFormStatus } from "react-dom";

// Mientras se calcula (o se crea la ficha de un modelo nuevo, que tarda unos segundos)
export default function BotonCalcular({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" className={className} disabled={pending}>
        {pending ? "Calculando…" : "Calcular"}
      </button>
      {pending && (
        <p role="status" style={{ gridColumn: "1 / -1", margin: 0, color: "var(--suave)" }}>
          Si es la primera vez que alguien tasa este modelo, preparamos sus datos: puede tardar
          unos segundos.
        </p>
      )}
    </>
  );
}
