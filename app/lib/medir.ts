// Avisos a nuestra analítica propia (app/api/m/route.ts): sin cookies, sin
// guardar nada en el navegador y sin identificadores. Solo suma contadores.

type Vista = { ruta: string; entrada: boolean; ref?: string; utm?: string };

export function enviar(datos: { vista?: Vista; ev?: [string, string][] }) {
  try {
    const cuerpo = JSON.stringify(datos);
    const blob = new Blob([cuerpo], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/m", blob)) return;
    fetch("/api/m", {
      method: "POST",
      body: cuerpo,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {
    // La medición nunca debe romper la web
  }
}

// Ej.: medir(["itp", "madrid"]). Los eventos válidos están en app/api/m/route.ts
export function medir(...pares: [string, string][]) {
  if (pares.length) enviar({ ev: pares });
}

// Tramos para no guardar cifras exactas: tramo(7500, [3000, 6000, 10000]) -> "6000-10000"
export function tramo(n: number, cortes: number[], unidad = "") {
  for (let i = 0; i < cortes.length; i++) {
    if (n < cortes[i]) {
      return i === 0 ? `menos-${cortes[0]}${unidad}` : `${cortes[i - 1]}-${cortes[i]}${unidad}`;
    }
  }
  return `mas-${cortes.at(-1)}${unidad}`;
}
