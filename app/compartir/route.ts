// Normalmente la foto compartida la recoge public/sw.js antes de llegar aquí.
// Si el service worker aún no está activo, se abre la portada para subirla a mano.
export function POST(req: Request) {
  return Response.redirect(new URL("/", req.url), 303);
}
