import { TABLAS, aCsv } from "../../../lib/datos-abiertos";

// /prensa/datos/<tabla>.csv: se generan al construir la web con los datos del JSON de la DGT
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TABLAS).map((archivo) => ({ archivo }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await ctx.params;
  const tabla = TABLAS[archivo];
  if (!tabla) return new Response("No encontrado", { status: 404 });
  return new Response(aCsv(tabla.filas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quecochees-${archivo}"`,
    },
  });
}
