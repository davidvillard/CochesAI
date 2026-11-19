<img src="public/logo-quecochees.svg" alt="¿Qué coche es?" width="72">

# ¿Qué coche es?

**[quecochees.es](https://quecochees.es)** · Identifica cualquier coche por foto desde el navegador, sin instalar apps: modelo, ficha técnica y precio de segunda mano.

Además del identificador, la web reúne herramientas para comprar o vender un coche en España: matrícula y etiqueta, última matrícula de hoy, decodificador de bastidor (VIN), coches más vendidos según la DGT, comparador, checklist de compra, calculadora de ITP, coste de la transferencia, contrato de compraventa y cuándo toca la ITV.

## Tecnología

- **Next.js** (App Router) + **TypeScript**, estilos con CSS Modules y Tailwind CSS
- **Gemini API** para reconocer el coche de la foto, con varios modelos de respaldo (`GEMINI_MODELS`) por si uno se queda sin cuota
- **Upstash Redis** para limitar peticiones por IP y por día, y para las estadísticas
- **Zod** para validar las respuestas del modelo
- PWA instalable, publicada en **Vercel**
- **GitHub Actions** (`.github/workflows/datos-dgt.yml`) actualiza cada lunes los datos de matrículas y ventas de la DGT

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

### Variables de entorno

Crea un `.env.local` (no se sube al repositorio):

| Variable | Para qué |
|---|---|
| `GEMINI_API_KEY` | Clave de la API de Gemini |
| `GEMINI_MODELS` | Opcional: modelos a probar en orden, separados por comas |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis de Upstash (también valen `KV_REST_API_URL` / `KV_REST_API_TOKEN`) |
| `LIMITE_POR_IP` / `LIMITE_DIARIO_GLOBAL` | Opcional: límites de identificaciones |
| `STATS_KEY` | Clave del panel de estadísticas |

### Datos de la DGT

```bash
npm run matriculas   # actualiza las fechas de matrículas y las ventas por modelo
```

Los datos proceden de la DGT según sus condiciones de reutilización; la web no tiene relación oficial con la DGT.
