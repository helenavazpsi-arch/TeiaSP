import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cache Components: as leituras do Firestore ficam em `use cache` com tag,
   * e a moderação invalida a tag ao aprovar ou editar. É o que permite servir
   * a lista e o mapa prontos do servidor sem que a equipe precise esperar o
   * ciclo de revalidação para ver a mudança no ar.
   */
  cacheComponents: true,
};

export default nextConfig;
