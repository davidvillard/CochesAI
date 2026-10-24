import { NextResponse } from "next/server";
import { OFERTAS } from "../../lib/afiliados";
import { contar } from "../../lib/contadores";

// /ir/<id>: cuenta el clic en un enlace de afiliado y redirige a su web.
// Solo redirige a las URLs de lib/afiliados.ts, nunca a una que llegue en la petición.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const oferta = OFERTAS.find((o) => o.id === id && o.url);
  if (!oferta) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await contar(`afiliado:${oferta.id}`);
  return NextResponse.redirect(oferta.url, {
    status: 302,
    headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  });
}
