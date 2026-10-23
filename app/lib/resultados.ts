import { redis } from "./redis";

export type Similar = { marca: string; modelo: string; motivo: string };

// Lo que devuelve /api/identify cuando hay un coche en la foto
export type Resultado = {
  esCoche: boolean;
  marca: string;
  modelo: string;
  generacion: string;
  anios: string;
  carroceria: string;
  combustibles: string[];
  potenciaCvRango: string;
  cambio: string;
  puertas: number;
  plazas: number;
  precioNuevoEurAprox: string;
  precioSegundaManoEur?: { min: number; max: number };
  similares: Similar[];
  confianza: number;
  notas: string;
  // Enlace para compartir (/r/<id>); no existe si Redis no está configurado
  id?: string;
  // URL de la ficha del modelo (/coches/...), si ya existe. No se guarda: se
  // calcula al mostrar el resultado porque la ficha puede crearse más tarde.
  ficha?: string;
};

// Los resultados compartidos caducan solos: solo hacen falta mientras circula el enlace
const DIAS_GUARDADO = 30;
const clave = (id: string) => `quecoche:res:${id}`;
const ID_VALIDO = /^[a-f0-9]{12}$/;

// Guarda el resultado (sin foto ni IP) y devuelve su id.
// Nunca lanza error: si Redis falla, el resultado se muestra igual pero sin enlace.
export async function guardarResultado(r: Resultado) {
  if (!redis) return undefined;
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  try {
    await redis.set(clave(id), r, { ex: 60 * 60 * 24 * DIAS_GUARDADO });
    return id;
  } catch (err) {
    console.error("Error al guardar el resultado:", err);
    return undefined;
  }
}

export async function leerResultado(id: string) {
  if (!redis || !ID_VALIDO.test(id)) return null;
  try {
    const r = await redis.get<Resultado>(clave(id));
    return r ? { ...r, id } : null;
  } catch (err) {
    console.error("Error al leer el resultado:", err);
    return null;
  }
}
