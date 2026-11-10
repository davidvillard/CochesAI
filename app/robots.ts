import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo";

// /comparar se indexa, pero sus combinaciones (/comparar?a=...&b=...) no: son
// miles de URLs que los robots recorrerían una a una, y cada una lee la base de
// datos. Ya llevan noindex; así además no se rastrean.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ir/", "/panel", "/comparar?"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
