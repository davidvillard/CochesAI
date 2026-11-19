import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El service worker siempre fresco, para que los cambios lleguen al momento
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  // Nombres de comunidad que la gente escribe a mano y que no son el slug de la calculadora
  async redirects() {
    return ["comunitat-valenciana", "comunidad-valenciana"].map((slug) => ({
      source: `/calculadora-itp/${slug}`,
      destination: "/calculadora-itp/valencia",
      permanent: true,
    }));
  },
};

export default nextConfig;
