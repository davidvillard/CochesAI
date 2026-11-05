export const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: "always", // en español, sin esto sale "9000 €"
  }).format(n);

// Con céntimos solo cuando los hay: 55,70 € / 240 €
export const eurExacto = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(n);

// "2026-10-28" o una fecha ISO completa -> "28 de octubre de 2026"
export const fechaLarga = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
