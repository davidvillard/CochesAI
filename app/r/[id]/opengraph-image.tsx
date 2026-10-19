import { ImageResponse } from "next/og";
import { leerResultado } from "../../lib/resultados";
import { eur } from "../../lib/formato";

export const alt = "Coche identificado con Coches AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen que se ve al compartir el enlace por WhatsApp o redes
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const r = await leerResultado((await params).id);

  const titulo = r ? `${r.marca} ${r.modelo}` : "Identifica un coche por foto";
  const detalle = r
    ? [r.generacion, r.anios].filter(Boolean).join(", ")
    : "Modelo, ficha técnica, precio y alternativas con IA";
  const precio = r?.precioSegundaManoEur
    ? `${eur(r.precioSegundaManoEur.min)} a ${eur(r.precioSegundaManoEur.max)}`
    : "";

  return new ImageResponse(
    <div
      style={{
        background: "#f7f8fc",
        color: "#0e1220",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ color: "#2d5bff", display: "flex", fontSize: 34, fontWeight: 700 }}>
        {r ? "Coches AI ha identificado este coche" : "Coches AI"}
      </div>
      <div style={{ display: "flex", fontSize: 84, fontWeight: 800, marginTop: 24, lineHeight: 1 }}>
        {titulo}
      </div>
      {detalle ? (
        <div style={{ color: "#5a6275", display: "flex", fontSize: 36, marginTop: 20 }}>
          {detalle}
        </div>
      ) : null}
      {precio ? (
        <div
          style={{
            alignSelf: "flex-start",
            background: "#2d5bff",
            borderRadius: 20,
            color: "#fff",
            display: "flex",
            fontSize: 38,
            fontWeight: 700,
            marginTop: 40,
            padding: "16px 28px",
          }}
        >
          Segunda mano: {precio}
        </div>
      ) : null}
    </div>,
    { ...size }
  );
}
