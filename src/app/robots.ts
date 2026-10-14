import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 0;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // a área da equipe não tem o que indexar
      disallow: ["/admin", "/admin/"],
    },
    sitemap: "https://teiasp.com.br/sitemap.xml",
  };
}
