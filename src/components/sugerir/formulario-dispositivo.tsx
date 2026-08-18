"use client";

import { AlertTriangle, Check, Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { sugerirDispositivo, type Resultado } from "@/acoes/sugestoes";
import { Campo, entrada, Isca } from "@/components/ui/campo";
import { AREAS, PUBLICOS } from "@/lib/areas";
import { normalizar } from "@/lib/busca";
import { avisarEquipe } from "@/lib/notificar";

export function FormularioDispositivo({ siglasExistentes }: { siglasExistentes: string[] }) {
  const [resultado, enviar, enviando] = useActionState<Resultado | null, FormData>(
    sugerirDispositivo,
    null,
  );
  const [sigla, setSigla] = useState("");
  const nomeEnviado = useRef("");

  // avisa a equipe uma vez, depois que o envio deu certo
  const jaAvisou = useRef(false);
  useEffect(() => {
    if (resultado?.ok && !jaAvisou.current) {
      jaAvisou.current = true;
      void avisarEquipe(
        `Nova sugestão de dispositivo: ${nomeEnviado.current}`,
        "enviada pelo formulário do site",
      );
    }
  }, [resultado]);

  /**
   * Aviso de sigla repetida enquanto a pessoa digita — mesma ajuda do site
   * atual, e não bloqueia: às vezes o dispositivo é diferente mesmo com nome
   * parecido. Quem decide é a moderação.
   */
  const jaExiste =
    sigla.trim().length > 1 && siglasExistentes.includes(normalizar(sigla));

  if (resultado?.ok) {
    return (
      <div className="rounded-teia-lg border border-ok/20 bg-ok-bg px-5 py-8 text-center">
        <Check size={32} className="mx-auto text-ok" aria-hidden />
        <p className="mt-3 font-display text-base font-semibold text-ok">
          {resultado.mensagem}
        </p>
        <p className="mt-1 text-sm text-tx-2">
          Obrigada por contribuir com a Teia — a rede fica mais completa com você.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-teia border border-black/10 bg-sur px-4 py-2 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
        >
          Sugerir outro dispositivo
        </button>
      </div>
    );
  }

  return (
    <form
      action={(dados) => {
        nomeEnviado.current = String(dados.get("sigla") ?? "");
        enviar(dados);
      }}
      className="relative space-y-4"
    >
      <Isca />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="sigla" rotulo="Sigla ou nome curto" obrigatorio erro={resultado?.erros?.sigla}>
          <input
            id="sigla"
            name="sigla"
            value={sigla}
            onChange={(e) => setSigla(e.target.value)}
            placeholder="Ex: CAPS AD III"
            className={entrada(resultado?.erros?.sigla)}
          />
        </Campo>

        <Campo id="area" rotulo="Área" obrigatorio erro={resultado?.erros?.area}>
          <select id="area" name="area" defaultValue="" className={entrada(resultado?.erros?.area)}>
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

      {jaExiste && (
        <p className="flex items-start gap-2 rounded-teia bg-alerta-bg px-3 py-2 text-[12px] text-alerta">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Já existe um dispositivo cadastrado com essa sigla. Se for outro serviço, siga em
          frente — a equipe confere na revisão.
        </p>
      )}

      <Campo id="nome" rotulo="Nome completo" obrigatorio erro={resultado?.erros?.nome}>
        <input
          id="nome"
          name="nome"
          placeholder="Ex: Centro de Atenção Psicossocial Álcool e Drogas"
          className={entrada(resultado?.erros?.nome)}
        />
      </Campo>

      <Campo
        id="desc"
        rotulo="O que é e para que serve"
        obrigatorio
        dica="Explique o serviço, quem pode acessar e como funciona o atendimento."
        erro={resultado?.erros?.desc}
      >
        <textarea
          id="desc"
          name="desc"
          rows={6}
          className={entrada(resultado?.erros?.desc)}
        />
      </Campo>

      <fieldset>
        <legend className="text-xs font-medium text-tx-2">Público atendido</legend>
        <div className="mt-2 grid gap-x-4 gap-y-1.5 rounded-teia bg-sur-2 p-3 sm:grid-cols-2">
          {PUBLICOS.map((publico) => (
            <label key={publico} className="flex items-center gap-2 text-[13px] text-tx">
              <input
                type="checkbox"
                name="publico"
                value={publico}
                className="size-4 rounded border-black/20 accent-marca-600"
              />
              {publico}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="secretaria" rotulo="Secretaria ou órgão responsável">
          <input id="secretaria" name="secretaria" className={entrada()} />
        </Campo>

        <Campo id="tags" rotulo="Palavras-chave" dica="Separadas por vírgula.">
          <input id="tags" name="tags" placeholder="saúde mental, acolhimento" className={entrada()} />
        </Campo>

        <Campo id="site" rotulo="Site oficial" erro={resultado?.erros?.site}>
          <input
            id="site"
            name="site"
            type="url"
            placeholder="https://"
            className={entrada(resultado?.erros?.site)}
          />
        </Campo>

        <Campo id="autor" rotulo="Seu nome" dica="Opcional — para a equipe saber quem indicou.">
          <input id="autor" name="autor" className={entrada()} />
        </Campo>
      </div>

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
            Enviando...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar sugestão
          </>
        )}
      </button>
    </form>
  );
}
