import { AuditoriaProtegida } from "@/components/admin/auditoria-protegida";
import { auditarCoordenadas } from "@/lib/dados/auditoria";

export const metadata = {
  title: "Auditoria de coordenadas",
  robots: { index: false, follow: false },
};

/**
 * A análise dos ~3.900 pontos contra os polígonos de distrito acontece aqui,
 * no servidor: o navegador recebe só a lista de suspeitos. Também evita mandar
 * os 83 KB de polígonos de distrito para o cliente.
 */
export default async function PaginaAuditoria() {
  const auditoria = await auditarCoordenadas();

  return <AuditoriaProtegida auditoria={auditoria} />;
}
