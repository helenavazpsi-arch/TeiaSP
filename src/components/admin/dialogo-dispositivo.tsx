"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { EditorDescricao } from "@/components/admin/editor-descricao";
import { Campo, entrada } from "@/components/ui/campo";
import { AREAS, PUBLICOS } from "@/lib/areas";
import type { Servico } from "@/lib/tipos";

/**
 * Edição de um dispositivo — tanto para revisar uma sugestão antes de aprovar
 * quanto para corrigir algo já publicado.
 */
export function DialogoDispositivo({
  servico,
  titulo,
  rotuloSalvar,
  aoFechar,
  aoSalvar,
}: {
  servico: Servico;
  titulo: string;
  rotuloSalvar: string;
  aoFechar: () => void;
  aoSalvar: (campos: Record<string, unknown>) => Promise<void>;
}) {
  const [desc, setDesc] = useState(servico.desc ?? "");
  const [publicos, setPublicos] = useState<string[]>(
    (servico.publico ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(dados: FormData) {
    const sigla = String(dados.get("sigla") ?? "").trim();
    const nome = String(dados.get("nome") ?? "").trim();
    const area = String(dados.get("area") ?? "");

    if (!sigla || !nome || !area || !desc.replace(/<[^>]*>/g, "").trim()) {
      setErro("Sigla, nome, área e descrição são obrigatórios.");
      return;
    }

    setErro("");
    setSalvando(true);
    try {
      await aoSalvar({
        sigla,
        nome,
        area,
        desc,
        publico: publicos.join(", "),
        territorio: String(dados.get("territorio") ?? "").trim(),
        funcao: String(dados.get("funcao") ?? "").trim(),
        endereco: String(dados.get("endereco") ?? "").trim(),
        secretaria: String(dados.get("secretaria") ?? "").trim(),
        ong: String(dados.get("ong") ?? "").trim(),
        site: String(dados.get("site") ?? "").trim(),
        tags: String(dados.get("tags") ?? "")
          .toLowerCase()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
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
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(46rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-teia-lg bg-sur shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-sur px-5 py-3.5">
            <Dialog.Title className="font-display text-base font-bold">{titulo}</Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="rounded-full p-1.5 text-tx-3 transition-colors hover:bg-sur-2 hover:text-tx"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <form action={enviar} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="e-sigla" rotulo="Sigla" obrigatorio>
                <input
                  id="e-sigla"
                  name="sigla"
                  defaultValue={servico.sigla ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-area" rotulo="Área" obrigatorio>
                <select
                  id="e-area"
                  name="area"
                  defaultValue={servico.area ?? ""}
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

            <Campo id="e-nome" rotulo="Nome completo" obrigatorio>
              <input
                id="e-nome"
                name="nome"
                defaultValue={servico.nome ?? ""}
                className={entrada()}
              />
            </Campo>

            <div>
              <span className="block text-xs font-medium text-tx-2">
                O que é <span className="text-erro">*</span>
              </span>
              <div className="mt-1">
                <EditorDescricao valorInicial={servico.desc ?? ""} aoMudar={setDesc} />
              </div>
            </div>

            <Campo id="e-funcao" rotulo="Como funciona">
              <textarea
                id="e-funcao"
                name="funcao"
                rows={3}
                defaultValue={servico.funcao ?? ""}
                className={entrada()}
              />
            </Campo>

            <fieldset>
              <legend className="text-xs font-medium text-tx-2">Público atendido</legend>
              <div className="mt-1.5 grid gap-x-4 gap-y-1.5 rounded-teia bg-sur-2 p-3 sm:grid-cols-2">
                {PUBLICOS.map((publico) => (
                  <label key={publico} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={publicos.includes(publico)}
                      onChange={(e) =>
                        setPublicos((atual) =>
                          e.target.checked
                            ? [...atual, publico]
                            : atual.filter((p) => p !== publico),
                        )
                      }
                      className="size-4 rounded border-black/20 accent-marca-600"
                    />
                    {publico}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="e-territorio" rotulo="Território">
                <input
                  id="e-territorio"
                  name="territorio"
                  defaultValue={servico.territorio ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-secretaria" rotulo="Secretaria">
                <input
                  id="e-secretaria"
                  name="secretaria"
                  defaultValue={servico.secretaria ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-ong" rotulo="ONG/OSC">
                <input
                  id="e-ong"
                  name="ong"
                  defaultValue={servico.ong ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-endereco" rotulo="Endereço">
                <input
                  id="e-endereco"
                  name="endereco"
                  defaultValue={servico.endereco ?? ""}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-tags" rotulo="Palavras-chave" dica="Separadas por vírgula.">
                <input
                  id="e-tags"
                  name="tags"
                  defaultValue={(servico.tags ?? []).join(", ")}
                  className={entrada()}
                />
              </Campo>
              <Campo id="e-site" rotulo="Site oficial">
                <input
                  id="e-site"
                  name="site"
                  defaultValue={servico.site ?? ""}
                  className={entrada()}
                />
              </Campo>
            </div>

            {erro && (
              <p className="rounded-teia bg-erro-bg px-3 py-2 text-[13px] text-erro" role="alert">
                {erro}
              </p>
            )}

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-black/10 bg-sur pt-3">
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
                {rotuloSalvar}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
