// Coste total de tener un coche durante varios años: compra menos ayudas y
// reventa, más energía, seguro, mantenimiento e impuesto de circulación.
// Todos los valores por defecto son orientativos y el usuario los puede cambiar.

export type Tipo = "gasolina" | "diesel" | "hibrido" | "enchufable" | "electrico";

export const TIPOS: { id: Tipo; nombre: string }[] = [
  { id: "gasolina", nombre: "Gasolina" },
  { id: "diesel", nombre: "Diésel" },
  { id: "hibrido", nombre: "Híbrido (HEV)" },
  { id: "enchufable", nombre: "Híbrido enchufable (PHEV)" },
  { id: "electrico", nombre: "Eléctrico (BEV)" },
];

export const usaLitros = (t: Tipo) => t !== "electrico";
export const usaKwh = (t: Tipo) => t === "electrico" || t === "enchufable";

// Valores típicos de un compacto en uso real (no los homologados WLTP)
export const POR_TIPO: Record<
  Tipo,
  { litros: number; kwh: number; seguro: number; mantenimiento: number; impuesto: number }
> = {
  gasolina: { litros: 6.5, kwh: 0, seguro: 450, mantenimiento: 450, impuesto: 70 },
  diesel: { litros: 5.2, kwh: 0, seguro: 450, mantenimiento: 500, impuesto: 70 },
  hibrido: { litros: 4.8, kwh: 0, seguro: 450, mantenimiento: 400, impuesto: 35 },
  // En el enchufable, "litros" es el gasto cuando la batería está vacía
  enchufable: { litros: 6, kwh: 18, seguro: 480, mantenimiento: 400, impuesto: 20 },
  electrico: { litros: 0, kwh: 17, seguro: 500, mantenimiento: 250, impuesto: 20 },
};

// Pérdidas al cargar: lo que pasa por el contador es más que lo que entra en la batería
export const PERDIDAS_CARGA = 1.1;

export type Coche = {
  tipo: Tipo;
  precio: number; // precio final de compra, con impuestos
  ayudas: number; // Plan Auto+, ayudas autonómicas o descuentos
  litros: number; // l/100 km
  kwh: number; // kWh/100 km
  seguro: number; // € al año
  mantenimiento: number; // € al año
  impuesto: number; // impuesto de circulación, € al año
  depreciacion: number; // % de valor que pierde cada año
};

export type Uso = {
  km: number; // al año
  anios: number;
  gasolina: number; // €/l
  diesel: number; // €/l
  luzCasa: number; // €/kWh
  luzFuera: number; // €/kWh en cargadores públicos
  enCasa: number; // % de la carga hecha en casa
  electricoPhev: number; // % de km en eléctrico del enchufable
};

export const USO_INICIAL: Uso = {
  km: 15000,
  anios: 8,
  gasolina: 1.5,
  diesel: 1.45,
  luzCasa: 0.15,
  luzFuera: 0.5,
  enCasa: 80,
  electricoPhev: 50,
};

export const DEPRECIACION = 7;

export function cocheInicial(tipo: Tipo, precio: number): Coche {
  const d = POR_TIPO[tipo];
  return {
    tipo,
    precio,
    ayudas: 0,
    litros: d.litros,
    kwh: d.kwh,
    seguro: d.seguro,
    mantenimiento: d.mantenimiento,
    impuesto: d.impuesto,
    depreciacion: DEPRECIACION,
  };
}

// Energía de un año, en euros
export function energiaAnual(c: Coche, u: Uso) {
  const litro = c.tipo === "diesel" ? u.diesel : u.gasolina;
  const kwh = ((u.enCasa / 100) * u.luzCasa + (1 - u.enCasa / 100) * u.luzFuera) * PERDIDAS_CARGA;
  const cien = u.km / 100;
  if (c.tipo === "electrico") return cien * c.kwh * kwh;
  if (c.tipo === "enchufable") {
    const e = u.electricoPhev / 100;
    return cien * (e * c.kwh * kwh + (1 - e) * c.litros * litro);
  }
  return cien * c.litros * litro;
}

export const valorReventa = (c: Coche, anios: number) =>
  c.precio * Math.pow(1 - c.depreciacion / 100, anios);

export const gastoAnual = (c: Coche, u: Uso) =>
  energiaAnual(c, u) + c.seguro + c.mantenimiento + c.impuesto;

// Dinero pagado tras t años (t puede tener decimales), sin contar la reventa:
// es lo que la gente entiende por "en cuánto tiempo se amortiza"
export const pagado = (c: Coche, u: Uso, t: number) =>
  c.precio - c.ayudas + gastoAnual(c, u) * t;

export function desglose(c: Coche, u: Uso) {
  const n = u.anios;
  const partes = {
    compra: c.precio - c.ayudas - valorReventa(c, n),
    energia: energiaAnual(c, u) * n,
    seguro: c.seguro * n,
    mantenimiento: c.mantenimiento * n,
    impuesto: c.impuesto * n,
  };
  const total = Object.values(partes).reduce((a, b) => a + b, 0);
  return { partes, total, porKm: u.km > 0 ? total / (u.km * n) : 0, reventa: valorReventa(c, n) };
}

// Meses (hasta 20 años) que tarda el coche más caro de comprar en recuperar la
// diferencia con lo que ahorra al usarlo. null si no la recupera nunca.
export function cruce(a: Coche, b: Coche, u: Uso) {
  const signo = (t: number) => Math.sign(pagado(a, u, t) - pagado(b, u, t));
  const inicio = signo(0);
  if (inicio === 0) return null;
  for (let m = 1; m <= 240; m++) {
    if (signo(m / 12) === -inicio) return m;
  }
  return null;
}
