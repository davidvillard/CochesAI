import { Redis } from "@upstash/redis";

// Acepta las variables de Upstash o las que crea la integración de Vercel.
// Si faltan (por ejemplo en local) vale null y cada uso lo tiene en cuenta.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
