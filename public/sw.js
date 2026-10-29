// Service worker de ¿Qué coche es?. Solo hace una cosa: recibir la foto que se
// comparte desde otra app (manifest -> share_target), guardarla un momento y
// abrir la portada, que la analiza (components/Identificador.tsx).
// No cachea páginas: todo lo demás va a la red como siempre.

const CACHE = "compartido";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/compartir") return;

  event.respondWith(
    (async () => {
      try {
        const datos = await event.request.formData();
        const foto = datos.get("foto");
        if (foto && typeof foto !== "string" && foto.type.startsWith("image/")) {
          const cache = await caches.open(CACHE);
          await cache.put("/foto-compartida", new Response(foto, { headers: { "Content-Type": foto.type } }));
          return Response.redirect("/?compartida=1", 303);
        }
      } catch {
        // Si algo falla, se abre la portada para subirla a mano
      }
      return Response.redirect("/", 303);
    })()
  );
});
