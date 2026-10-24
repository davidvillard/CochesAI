import { NextResponse } from "next/server";
import { estadoFicha } from "../../lib/fichas";

// ¿Tiene ya ficha este coche? Lo consulta el resultado de la portada mientras
// la ficha se genera en segundo plano.
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const marca = params.get("marca")?.slice(0, 60) ?? "";
  const modelo = params.get("modelo")?.slice(0, 60) ?? "";
  if (!marca || !modelo) {
    return NextResponse.json({ pendiente: false }, { status: 400 });
  }
  return NextResponse.json(await estadoFicha(marca, modelo), {
    headers: { "Cache-Control": "no-store" },
  });
}
