import { MapPin, Users } from "lucide-react";
import Link from "next/link";
import { BadgeArea } from "@/components/ui/badge-area";
import { Etiqueta } from "@/components/ui/etiqueta";
import { area } from "@/lib/areas";
import type { ServicoResumo } from "@/lib/dados/servicos";

/**
 * Cartão de um dispositivo na listagem.
 *
 * É um <Link> de verdade — no site antigo era uma <div> com onclick, que não
 * recebia foco, não abria em nova aba e não podia ser compartilhada.
 */
export function CartaoDispositivo({ servico }: { servico: ServicoResumo }) {
  const { cor } = area(servico.area);
  const primeiroPublico = servico.publico.split(",")[0]?.trim();

  return (
    <li className="list-none">
      <Link
        href={`/dispositivo/${servico.slug}`}
        className="group block h-full overflow-hidden rounded-teia-lg border border-black/8 bg-sur/95 transition-all hover:-translate-y-0.5 hover:border-marca-200 hover:shadow-lg"
      >
        <div className="h-1.5" style={{ background: cor }} aria-hidden />

        <div className="p-4">
          <BadgeArea chave={servico.area} />

          <h3 className="mt-2.5 font-display text-base leading-tight font-bold text-tx group-hover:text-marca-800">
            {servico.sigla || servico.nome}
          </h3>
          {servico.sigla && servico.nome && (
            <p className="mt-0.5 text-xs leading-snug text-tx-2">{servico.nome}</p>
          )}

          {servico.resumo && (
            <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-tx-2">
              {servico.resumo}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {servico.territorio && <Etiqueta icone={MapPin}>{servico.territorio}</Etiqueta>}
            {primeiroPublico && <Etiqueta icone={Users}>{primeiroPublico}</Etiqueta>}
            {servico.tags.slice(0, 2).map((tag) => (
              <Etiqueta key={tag}>{tag}</Etiqueta>
            ))}
          </div>
        </div>
      </Link>
    </li>
  );
}
