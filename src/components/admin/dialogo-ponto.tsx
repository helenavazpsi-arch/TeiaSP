"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { Campo, entrada } from "@/components/ui/campo";
import { AREAS } from "@/lib/areas";
import type { Ponto } from "@/lib/tipos";

/**
 * Edição de um ponto do mapa.
 *
 * No site atual isto era uma sequência de seis `prompt()` do navegador — nome,
 * nome completo, número da área, endereço, telefone — e errar em qualquer um
 * significava começar tudo de novo. Aqui é um formulário, com tudo à vista.
 *
 * A coordenada não é editada aqui: quem cuida disso é a auditoria, que
 * recalcula a partir do endereço.
 */
export function DialogoPonto({
  ponto,
  aoFechar,
  aoSalvar,
}: {
  ponto: Ponto;
  aoFechar: () => void;
  aoSalvar: (campos: Record<string, unknown>) => Promise<void>;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(dados: FormData) {
    const sigla = String(dados.get("sigla") ?? "").trim();
    const area = String(dados.get("area") ?? "");
    const endereco = String(dados.get("endereco") ?? "").trim();

    if (!sigla || !area || !endereco) {
      setErro("Nome, área e endereço são obrigatórios.");
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await aoSalvar({
        sigla,
        area,
        endereco,
        nome: String(dados.get("nome") ?? "").trim(),
        telefone: String(dados.get("telefone") ?? "").trim(),
      });
      aoFechar();
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(v) => !v && !salvando && aoFechar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-teia-lg bg-sur shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5">
            <Dialog.Title className="font-display text-base font-bold">
              Editar ponto do mapa
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="rounded-full p-1.5 text-tx-3 transition-colors hover:bg-sur-2 hover:text-tx"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <form action={enviar} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="pt-sigla" rotulo="Nome / sigla" obrigatorio>
                <input
                  id="pt-sigla"
                  name="sigla"
                  defaultValue={ponto.sigla ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="pt-area" rotulo="Área" obrigatorio>
                <select
                  id="pt-area"
                  name="area"
                  defaultValue={ponto.area ?? ""}
                  className={entrada()}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {AREAS.map(({ chave }) => (
                    <option key={chave} value={chave}>
                      {chave}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo id="pt-nome" rotulo="Nome completo">
              <input
                id="pt-nome"
                name="nome"
                defaultValue={ponto.nome ?? ""}
                className={entrada()}
              />
            </Campo>

            <Campo id="pt-endereco" rotulo="Endereço" obrigatorio>
              <input
                id="pt-endereco"
                name="endereco"
                defaultValue={ponto.endereco ?? ""}
                className={entrada()}
              />
            </Campo>

            <Campo id="pt-telefone" rotulo="Telefone">
              <input
                id="pt-telefone"
                name="telefone"
                defaultValue={ponto.telefone ?? ""}
                className={entrada()}
              />
            </Campo>

            <p className="rounded-teia bg-sur-2 px-3 py-2 text-[11px] text-tx-2">
              Coordenada atual: {ponto.lat?.toFixed(5)}, {ponto.lng?.toFixed(5)}. Para
              corrigir a posição no mapa, use a auditoria de coordenadas.
            </p>

            {erro && (
              <p className="rounded-teia bg-erro-bg px-3 py-2 text-[13px] text-erro" role="alert">
                {erro}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={aoFechar}
                disabled={salvando}
                className="rounded-teia border border-black/10 px-4 py-2 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-teia bg-marca-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-marca-800 disabled:opacity-70"
              >
                {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Salvar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
