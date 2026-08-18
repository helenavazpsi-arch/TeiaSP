"use client";

import { Inbox, LogOut, MapPin, MessageSquare, Search, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SecaoLixeira } from "@/components/admin/secao-lixeira";
import { SecaoMensagens } from "@/components/admin/secao-mensagens";
import { SecaoPendentes } from "@/components/admin/secao-pendentes";
import { SecaoPontos } from "@/components/admin/secao-pontos";
import { SecaoPublicados } from "@/components/admin/secao-publicados";
import { useColecao } from "@/lib/firebase/tempo-real";
import { useSessao } from "@/lib/firebase/sessao";
import type { ItemLixeira, Mensagem, Pendente, Ponto, Servico } from "@/lib/tipos";
import { cn } from "@/lib/utils";

type Aba = "pendentes" | "publicados" | "pontos" | "mensagens" | "lixeira";

export function Painel() {
  const { usuario, sair } = useSessao();
  const [aba, setAba] = useState<Aba>("pendentes");
  const [busca, setBusca] = useState("");

  /**
   * As escutas sobem conforme a aba é aberta, e não todas de uma vez: `pontos`
   * tem quase 4.000 documentos e disputava a conexão com o resto no site
   * atual, deixando o painel lento para abrir.
   */
  const pendentes = useColecao<Pendente>("pendentes");
  const mensagens = useColecao<Mensagem>("mensagens");
  const servicos = useColecao<Servico>("servicos", aba === "publicados");
  const pontos = useColecao<Ponto>("pontos", aba === "pontos");
  const lixeira = useColecao<ItemLixeira>("lixeira", aba === "lixeira");

  const naoLidas = useMemo(
    () => mensagens.itens.filter((m) => !m.lida).length,
    [mensagens.itens],
  );

  const abas: Array<{ id: Aba; rotulo: string; icone: typeof Inbox; contagem?: number }> = [
    { id: "pendentes", rotulo: "Sugestões", icone: Inbox, contagem: pendentes.itens.length },
    { id: "publicados", rotulo: "Dispositivos", icone: Users },
    { id: "pontos", rotulo: "Pontos do mapa", icone: MapPin },
    { id: "mensagens", rotulo: "Mensagens", icone: MessageSquare, contagem: naoLidas },
    { id: "lixeira", rotulo: "Lixeira", icone: Trash2 },
  ];

  return (
    <main className="px-4 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-tx">Painel de moderação</h1>
          <p className="text-xs text-tx-3">{usuario?.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/auditoria"
            className="rounded-teia border border-black/10 px-3 py-1.5 text-xs font-medium text-tx transition-colors hover:bg-sur-2"
          >
            Auditoria de coordenadas
          </Link>
          <button
            type="button"
            onClick={() => void sair()}
            className="inline-flex items-center gap-1.5 rounded-teia border border-black/10 px-3 py-1.5 text-xs font-medium text-tx transition-colors hover:bg-sur-2"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>

      <div className="sem-barra -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4">
        {abas.map(({ id, rotulo, icone: Icone, contagem }) => (
          <button
            key={id}
            type="button"
            onClick={() => setAba(id)}
            aria-current={aba === id ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-teia border px-3 py-2 text-sm font-medium transition-colors",
              aba === id
                ? "border-marca-600 bg-marca-50 text-marca-800"
                : "border-black/10 bg-sur text-tx-2 hover:bg-sur-2",
            )}
          >
            <Icone size={15} />
            {rotulo}
            {contagem !== undefined && contagem > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  aba === id ? "bg-marca-600 text-white" : "bg-erro text-white",
                )}
              >
                {contagem}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tx-3"
          aria-hidden
        />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por sigla, nome ou palavra-chave..."
          aria-label="Filtrar itens do painel"
          className="w-full rounded-teia border border-black/10 bg-sur py-2 pr-3 pl-9 text-sm placeholder:text-tx-3 focus:border-marca-400 focus:outline-none"
        />
      </div>

      {aba === "pendentes" && (
        <SecaoPendentes
          pendentes={pendentes.itens}
          carregando={pendentes.carregando}
          busca={busca}
        />
      )}
      {aba === "publicados" && (
        <SecaoPublicados
          servicos={servicos.itens}
          carregando={servicos.carregando}
          busca={busca}
        />
      )}
      {aba === "pontos" && (
        <SecaoPontos pontos={pontos.itens} carregando={pontos.carregando} busca={busca} />
      )}
      {aba === "mensagens" && (
        <SecaoMensagens
          mensagens={mensagens.itens}
          carregando={mensagens.carregando}
          busca={busca}
        />
      )}
      {aba === "lixeira" && (
        <SecaoLixeira itens={lixeira.itens} carregando={lixeira.carregando} busca={busca} />
      )}
    </main>
  );
}
