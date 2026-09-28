import { Map } from "lucide-react";
import { Suspense } from "react";
import { PainelMapa } from "@/components/mapa/painel-mapa";
import { listarMarcadores } from "@/lib/dados/mapa";
import { NOMES_ZONAS } from "@/lib/geo/poligonos";

export const metadata = {
  title: "Mapa",
  description:
    "Localize no mapa de São Paulo as unidades de saúde, assistência social, educação e demais serviços cadastrados na Teia SP.",
  alternates: { canonical: "/mapa" },
};

export default async function PaginaMapa() {
  const marcadores = await listarMarcadores();

  return (
    <main className="px-4 py-5">
      <div className="mb-4 flex items-start gap-2.5 rounded-teia-lg border border-info/20 bg-info-bg px-4 py-3 text-[13px] text-info">
        <Map size={17} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong>Mapa da Teia SP.</strong> Os pinos próximos se agrupam; aproxime para
          abrir cada unidade. Use a busca e os filtros para procurar por bairro, área ou
          região.
        </p>
      </div>

      <h1 className="sr-only">Mapa dos dispositivos de São Paulo</h1>

      <Suspense fallback={<div className="h-[68vh] min-h-[420px] rounded-teia-lg bg-sur-2" />}>
        <PainelMapa marcadores={marcadores} zonas={[...NOMES_ZONAS]} />
      </Suspense>
    </main>
  );
}
