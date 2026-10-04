import { ImageResponse } from "next/og";

export const alt = "Coches AI: identifica un coche por foto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f8fc",
        color: "#101828",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ color: "#3155d9", display: "flex", fontSize: 34, fontWeight: 700 }}>
        Coches AI
      </div>
      <div style={{ display: "flex", fontSize: 68, fontWeight: 800, marginTop: 28 }}>
        Identifica un coche por foto
      </div>
      <div style={{ color: "#475467", display: "flex", fontSize: 32, marginTop: 24 }}>
        Modelo, ficha técnica, precio y alternativas con IA
      </div>
    </div>,
    { ...size }
  );
}
