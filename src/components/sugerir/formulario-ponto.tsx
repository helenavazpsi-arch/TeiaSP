"use client";

import { Check, Loader2, MapPin, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { sugerirPonto, type Resultado } from "@/acoes/sugestoes";
import { Campo, entrada, Isca } from "@/components/ui/campo";
import { AREAS } from "@/lib/areas";
import { avisarEquipe } from "@/lib/notificar";

/**
 * Endereço de uma unidade para o mapa.
 * A coordenada é buscada no servidor durante o envio — se o endereço não cair
 * dentro do município, a sugestão volta com erro em vez de virar um pino
 * perdido no mapa.
 */
export function FormularioPonto() {
  const [resultado, enviar, enviando] = useActionState<Resultado | null, FormData>(
    sugerirPonto,
    null,
  );
  const enviado = useRef({ sigla: "", endereco: "" });

  const jaAvisou = useRef(false);
  useEffect(() => {
    if (resultado?.ok && !jaAvisou.current) {
      jaAvisou.current = true;
      void avisarEquipe(
        `Novo endereço sugerido: ${enviado.current.sigla}`,
        enviado.current.endereco,
      );
    }
  }, [resultado]);

  if (resultado?.ok) {
    return (
      <div className="rounded-teia-lg border border-ok/20 bg-ok-bg px-5 py-8 text-center">
        <Check size={32} className="mx-auto text-ok" aria-hidden />
        <p className="mt-3 font-display text-base font-semibold text-ok">
          {resultado.mensagem}
        </p>
        <p className="mt-1 text-sm text-tx-2">
          A unidade aparece no mapa assim que a equipe aprovar.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-teia border border-black/10 bg-sur px-4 py-2 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
        >
          Enviar outro endereço
        </button>
      </div>
    );
  }

  return (
    <form
      action={(dados) => {
        enviado.current = {
          sigla: String(dados.get("sigla") ?? ""),
          endereco: String(dados.get("endereco") ?? ""),
        };
        enviar(dados);
      }}
      className="relative space-y-4"
    >
      <Isca />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="p-sigla" rotulo="Nome ou sigla da unidade" obrigatorio erro={resultado?.erros?.sigla}>
          <input
            id="p-sigla"
            name="sigla"
            placeholder="Ex: CAPS AD - Lapa"
            className={entrada(resultado?.erros?.sigla)}
          />
        </Campo>

        <Campo id="p-area" rotulo="Área" obrigatorio erro={resultado?.erros?.area}>
          <select
            id="p-area"
            name="area"
            defaultValue=""
            className={entrada(resultado?.erros?.area)}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {AREAS.filter(({ chave }) => chave !== "Moradia").map(({ chave }) => (
              <option key={chave} value={chave}>
                {chave}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo id="p-nome" rotulo="Nome completo">
        <input id="p-nome" name="nome" className={entrada()} />
      </Campo>

      <Campo
        id="p-endereco"
        rotulo="Endereço completo"
        obrigatorio
        dica="Com número e bairro — é o que permite achar o ponto exato no mapa."
        erro={resultado?.erros?.endereco}
      >
        <input
          id="p-endereco"
          name="endereco"
          placeholder="Ex: Rua das Flores, 123 - Lapa"
          className={entrada(resultado?.erros?.endereco)}
        />
      </Campo>

      <Campo id="p-telefone" rotulo="Telefone">
        <input
          id="p-telefone"
          name="telefone"
          placeholder="(11) 1234-5678"
          className={entrada()}
        />
      </Campo>

      {resultado && !resultado.ok && (
        <p className="rounded-teia bg-erro-bg px-3 py-2 text-[13px] text-erro" role="alert">
          {resultado.mensagem}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex items-center justify-center gap-2 rounded-teia bg-marca-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800 disabled:opacity-70"
      >
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Localizando o endereço...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar endereço
          </>
        )}
      </button>

      <p className="flex items-start gap-1.5 text-[11px] text-tx-3">
        <MapPin size={12} className="mt-0.5 shrink-0" />
        Localizamos o endereço automaticamente. Endereços fora da cidade de São Paulo não
        são aceitos.
      </p>
    </form>
  );
}
