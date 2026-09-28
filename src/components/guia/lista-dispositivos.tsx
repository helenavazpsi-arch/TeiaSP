"use client";

import { Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { CartaoDispositivo } from "@/components/guia/cartao-dispositivo";
import { AREAS, PUBLICOS } from "@/lib/areas";
import { normalizar } from "@/lib/busca";
import type { ServicoResumo } from "@/lib/dados/servicos";
import { cn } from "@/lib/utils";

/**
 * Busca e filtros da aba Buscar.
 *
 * Os ~200 dispositivos chegam prontos do servidor e a filtragem acontece em
 * memória — é o que mantém a resposta instantânea a cada tecla. O campo
 * `busca` já vem normalizado do servidor, então aqui não há trabalho de
 * limpeza por item a cada digitação.
 */
export function ListaDispositivos({ servicos }: { servicos: ServicoResumo[] }) {
  const [termo, setTermo] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [publico, setPublico] = useState("");

  // mantém a digitação fluida quando a lista é longa
  const termoAdiado = useDeferredValue(termo);

  const filtrados = useMemo(() => {
    /**
     * Busca por todos os termos, em qualquer ordem — não pela frase inteira.
     * O site antigo casava a frase literal, então "crianças em situação de
     * rua" não achava o NCA/CARUA, cuja descrição diz "crianças e
     * adolescentes em situação de rua". Palavras de uma ou duas letras saem
     * do teste: aparecem em qualquer texto e não ajudam a discriminar.
     */
    const termos = normalizar(termoAdiado)
      .split(" ")
      .filter((palavra) => palavra.length > 2);
    const alvoPublico = normalizar(publico);

    return servicos.filter((s) => {
      if (areaSelecionada && s.area !== areaSelecionada) return false;
      if (alvoPublico && !normalizar(s.publico).includes(alvoPublico)) return false;
      if (termos.length && !termos.every((termo) => s.busca.includes(termo))) return false;
      return true;
    });
  }, [servicos, termoAdiado, areaSelecionada, publico]);

  const temFiltro = Boolean(termo || areaSelecionada || publico);

  function limpar() {
    setTermo("");
    setAreaSelecionada("");
    setPublico("");
  }

  return (
    <>
      {/* chips de área: rolam no celular, quebram em linha nas telas maiores */}
      <div className="sem-barra -mx-4 mb-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
        <div
          className="flex gap-2 sm:flex-wrap"
          role="group"
          aria-label="Filtrar por área"
        >
          <Chip
            ativo={areaSelecionada === ""}
            corAtiva="#444444"
            onClick={() => setAreaSelecionada("")}
          >
            Todos
          </Chip>
          {AREAS.map(({ chave, cor, icone: Icone }) => (
            <Chip
              key={chave}
              ativo={areaSelecionada === chave}
              corAtiva={cor}
              onClick={() => setAreaSelecionada(areaSelecionada === chave ? "" : chave)}
            >
              <Icone size={13} aria-hidden />
              {chave}
            </Chip>
          ))}
        </div>
      </div>

      {/* busca e filtros */}
      <div className="rounded-teia-lg border border-black/8 bg-sur/95 p-4" id="busca">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tx-3"
              aria-hidden
            />
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar por nome, sigla ou palavra-chave..."
              aria-label="Buscar dispositivos"
              className="w-full rounded-teia border border-black/10 bg-sur py-2.5 pr-3 pl-9 text-sm placeholder:text-tx-3 focus:border-marca-400 focus:outline-none"
            />
          </div>

          <select
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
            aria-label="Filtrar por público atendido"
            className="rounded-teia border border-black/10 bg-sur px-3 py-2.5 text-sm text-tx-2 focus:border-marca-400 focus:outline-none"
          >
            <option value="">Todos os públicos</option>
            {PUBLICOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-tx-2" aria-live="polite">
            <strong className="text-tx">{filtrados.length}</strong>{" "}
            {filtrados.length === 1 ? "dispositivo" : "dispositivos"}
            {temFiltro && ` de ${servicos.length}`}
          </p>

          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="inline-flex items-center gap-1 rounded-teia px-2 py-1 text-xs font-medium text-marca-700 transition-colors hover:bg-marca-50"
            >
              <X size={13} />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* resultados */}
      {filtrados.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((servico) => (
            <CartaoDispositivo key={servico.id} servico={servico} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-teia-lg border border-dashed border-black/15 bg-sur/80 px-6 py-12 text-center">
          <SearchX size={32} className="mx-auto text-tx-3" aria-hidden />
          <p className="mt-3 font-display text-base font-semibold text-tx">
            Nenhum dispositivo encontrado
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-tx-2">
            Tente outra palavra ou remova algum filtro. Se o que você procura não estiver
            aqui, você pode{" "}
            <Link href="/sugerir" className="font-medium text-marca-700 underline">
              sugerir um dispositivo novo
            </Link>
            .
          </p>
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="mt-4 rounded-teia bg-marca-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-marca-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Chip({
  children,
  ativo,
  corAtiva,
  onClick,
}: {
  children: React.ReactNode;
  ativo: boolean;
  corAtiva: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        ativo
          ? "border-transparent text-white shadow-sm"
          : "border-black/15 bg-sur/95 text-tx-2 hover:border-marca-300 hover:text-tx",
      )}
      style={ativo ? { background: corAtiva, color: corContraste(corAtiva) } : undefined}
    >
      {children}
    </button>
  );
}

/**
 * Preto ou branco sobre a cor da área, pelo brilho percebido.
 * O site antigo tinha esse par escrito à mão em cada classe CSS de chip.
 */
function corContraste(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const brilho =
    (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  return brilho > 145 ? "#1a1a1a" : "#ffffff";
}
