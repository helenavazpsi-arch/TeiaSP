import type { MetadataRoute } from "next";
import { listarServicos } from "@/lib/dados/servicos";

const BASE = "https://teiasp.com.br";

/**
 * Um endereço por dispositivo, além das seções.
 * O site antigo era uma página só: o Google não tinha o que indexar além da
 * home, e nenhum serviço aparecia em busca por nome.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const servicos = await listarServicos();

  const secoes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/mapa`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/sugerir`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...secoes,
    ...servicos.map((s) => ({
      url: `${BASE}/dispositivo/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
