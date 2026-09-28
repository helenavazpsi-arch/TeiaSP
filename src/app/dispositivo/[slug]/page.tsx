import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetalheDispositivo } from "@/components/guia/detalhe-dispositivo";
import { buscarServico, listarServicos } from "@/lib/dados/servicos";
import { resumir } from "@/lib/texto";

/**
 * Página própria de cada dispositivo.
 *
 * É a mudança mais visível para quem usa: no site antigo o conteúdo só existia
 * dentro de um modal, sem endereço próprio — não dava para mandar o link de um
 * CAPS pelo WhatsApp nem para o Google indexar cada serviço.
 */
export async function generateStaticParams() {
  const servicos = await listarServicos();
  return servicos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/dispositivo/[slug]">) {
  const { slug } = await params;
  const servico = await buscarServico(slug);
  if (!servico) return {};

  const titulo = [servico.sigla, servico.nome].filter(Boolean).join(" — ");
  const descricao = resumir(servico.desc ?? "", 155) || servico.nome || titulo;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/dispositivo/${servico.slug}` },
    openGraph: {
      type: "article",
      title: `${titulo} · Teia SP`,
      description: descricao,
      url: `/dispositivo/${servico.slug}`,
    },
  } satisfies Metadata;
}

export default async function PaginaDispositivo({
  params,
}: PageProps<"/dispositivo/[slug]">) {
  const { slug } = await params;
  const servico = await buscarServico(slug);

  if (!servico) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 rounded-teia px-1 py-1 text-sm text-marca-700 transition-colors hover:text-marca-900"
      >
        <ArrowLeft size={16} />
        Voltar para a busca
      </Link>

      <div className="overflow-hidden rounded-teia-lg border border-black/8 bg-sur/95 shadow-sm">
        <DetalheDispositivo servico={servico} temMapa={servico.temMapa} />
      </div>
    </main>
  );
}
