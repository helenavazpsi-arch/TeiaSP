import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetalheDispositivo } from "@/components/guia/detalhe-dispositivo";
import { ModalDispositivo } from "@/components/guia/modal-dispositivo";
import { buscarServico } from "@/lib/dados/servicos";

/**
 * Mesma rota de /dispositivo/[slug], interceptada quando a navegação parte da
 * listagem — aí abre como modal em vez de trocar a página.
 *
 * A casca do modal é estática e aparece no mesmo instante do clique; o
 * conteúdo entra por streaming logo atrás, já quente no cache do servidor.
 */
export default async function ModalRota({ params }: PageProps<"/dispositivo/[slug]">) {
  return (
    <ModalDispositivo>
      <Suspense fallback={<Esqueleto />}>
        <Conteudo params={params} />
      </Suspense>
    </ModalDispositivo>
  );
}

async function Conteudo({ params }: { params: PageProps<"/dispositivo/[slug]">["params"] }) {
  const { slug } = await params;
  const servico = await buscarServico(slug);

  if (!servico) notFound();

  return <DetalheDispositivo servico={servico} temMapa={servico.temMapa} />;
}

function Esqueleto() {
  return (
    <div className="animate-pulse p-6" aria-label="Carregando dispositivo">
      <div className="h-5 w-32 rounded-full bg-sur-3" />
      <div className="mt-4 h-7 w-2/3 rounded bg-sur-3" />
      <div className="mt-2 h-4 w-1/2 rounded bg-sur-2" />
      <div className="mt-6 space-y-2">
        <div className="h-3.5 w-full rounded bg-sur-2" />
        <div className="h-3.5 w-full rounded bg-sur-2" />
        <div className="h-3.5 w-4/5 rounded bg-sur-2" />
      </div>
    </div>
  );
}
