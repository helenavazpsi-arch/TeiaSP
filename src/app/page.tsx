import { Search } from "lucide-react";
import { ListaDispositivos } from "@/components/guia/lista-dispositivos";
import { TourBoasVindas } from "@/components/tour/tour-boas-vindas";
import { listarServicosResumo } from "@/lib/dados/servicos";

export default async function PaginaBuscar() {
  const servicos = await listarServicosResumo();

  return (
    <main className="px-4 py-5">
      <div className="mb-4 flex items-start gap-2.5 rounded-teia-lg border border-marca-100 bg-marca-50/95 px-4 py-3 text-[13px] text-marca-900">
        <Search size={17} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong>Conheça os dispositivos:</strong> acesse informações sobre função, sigla,
          site oficial, público atendido e demais detalhes.
        </p>
      </div>

      <h1 className="sr-only">Dispositivos, equipamentos e benefícios de São Paulo</h1>

      <ListaDispositivos servicos={servicos} />
      <TourBoasVindas />
    </main>
  );
}
