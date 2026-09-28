import { Building2, ExternalLink, HandHeart, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { BadgeArea } from "@/components/ui/badge-area";
import { Etiqueta } from "@/components/ui/etiqueta";
import { area } from "@/lib/areas";
import type { ServicoComSlug } from "@/lib/dados/servicos";
import { paragrafos } from "@/lib/texto";

/**
 * Conteúdo do dispositivo, usado tanto na página própria quanto no modal que
 * abre por cima da listagem. Um componente só para os dois lugares — no site
 * antigo esse HTML era montado por concatenação de string dentro de
 * `detalhes()`.
 */
export function DetalheDispositivo({
  servico,
  temMapa,
}: {
  servico: ServicoComSlug;
  temMapa: boolean;
}) {
  const { cor } = area(servico.area);
  const corpo = paragrafos(servico.desc);

  return (
    <article>
      <div className="h-1.5 rounded-t-teia-lg" style={{ background: cor }} aria-hidden />

      <div className="p-6">
        <div className="flex flex-wrap gap-1.5">
          <BadgeArea chave={servico.area} />
          {servico.territorio && <Etiqueta icone={MapPin}>{servico.territorio}</Etiqueta>}
        </div>

        <h1 className="mt-3 font-display text-2xl leading-tight font-bold text-tx">
          {servico.sigla || servico.nome}
        </h1>
        {servico.sigla && servico.nome && (
          <p className="mt-1 text-sm text-tx-2">{servico.nome}</p>
        )}

        {corpo.length > 0 && (
          <section className="mt-5">
            <h2 className="text-[11px] font-semibold tracking-wide text-tx-3 uppercase">
              O que é
            </h2>
            <div className="mt-1.5 space-y-2.5 text-sm leading-relaxed text-tx">
              {corpo.map((paragrafo, i) => (
                // a ordem é a identidade: parágrafos não têm id próprio
                <p key={i} dangerouslySetInnerHTML={{ __html: paragrafo }} />
              ))}
            </div>
          </section>
        )}

        {servico.funcao && (
          <section className="mt-5">
            <h2 className="text-[11px] font-semibold tracking-wide text-tx-3 uppercase">
              Como funciona
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-tx">{servico.funcao}</p>
          </section>
        )}

        {(servico.publico || servico.secretaria || servico.ong) && (
          <dl className="mt-5 grid gap-3 border-t border-black/8 pt-5 sm:grid-cols-2">
            {servico.publico && (
              <Campo icone={Users} rotulo="Público atendido" valor={servico.publico} />
            )}
            {servico.secretaria && (
              <Campo icone={Building2} rotulo="Secretaria" valor={servico.secretaria} />
            )}
            {servico.ong && <Campo icone={HandHeart} rotulo="ONG/OSC" valor={servico.ong} />}
          </dl>
        )}

        {servico.tags && servico.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {servico.tags.map((tag) => (
              <Etiqueta key={tag}>{tag}</Etiqueta>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {servico.site && (
            <a
              href={servico.site}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-teia border border-black/10 px-4 py-2.5 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
            >
              <ExternalLink size={16} />
              Site oficial
            </a>
          )}

          {temMapa && (
            <Link
              href={`/mapa?busca=${encodeURIComponent(servico.sigla || servico.nome || "")}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-teia bg-marca-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800"
            >
              <MapPin size={16} />
              Ver as unidades no mapa
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Campo({
  icone: Icone,
  rotulo,
  valor,
}: {
  icone: React.ComponentType<{ size?: number; className?: string }>;
  rotulo: string;
  valor: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-tx-3 uppercase">
        <Icone size={12} />
        {rotulo}
      </dt>
      <dd className="mt-1 text-[13px] text-tx">{valor}</dd>
    </div>
  );
}
