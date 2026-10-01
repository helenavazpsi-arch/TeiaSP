"use client";

import { Mail } from "lucide-react";
import { useActionState } from "react";
import { enviarMensagem, type Resultado } from "@/acoes/sugestoes";

const INICIAL: Resultado = { ok: false, mensagem: "" };

export function FormularioMensagem() {
  const [resultado, submitAction, pendente] = useActionState<Resultado, FormData>(
    enviarMensagem,
    INICIAL,
  );

  return (
    <form action={submitAction} className="space-y-4">
      {resultado.ok && (
        <div className="rounded-teia border border-success/20 bg-success-bg px-4 py-3 text-sm text-success">
          {resultado.mensagem}
        </div>
      )}

      {resultado.mensagem && !resultado.ok && (
        <div className="rounded-teia border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
          {resultado.mensagem}
        </div>
      )}

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-tx">
          Seu nome (opcional)
        </label>
        <input
          id="nome"
          type="text"
          name="nome"
          placeholder="Como você prefere ser identificado"
          maxLength={100}
          className={`mt-1 w-full rounded-teia border px-3 py-2 text-sm placeholder:text-tx-3 focus:outline-none ${
            resultado.erros?.nome
              ? "border-error bg-error-bg focus:border-error"
              : "border-black/10 bg-sur focus:border-marca-400"
          }`}
          disabled={pendente}
        />
        {resultado.erros?.nome && (
          <p className="mt-1 text-xs text-error">{resultado.erros.nome}</p>
        )}
      </div>

      <div>
        <label htmlFor="contato" className="block text-sm font-medium text-tx">
          E-mail ou telefone (opcional)
        </label>
        <input
          id="contato"
          type="text"
          name="contato"
          placeholder="Deixe uma forma de contato se quiser resposta"
          maxLength={150}
          className={`mt-1 w-full rounded-teia border px-3 py-2 text-sm placeholder:text-tx-3 focus:outline-none ${
            resultado.erros?.contato
              ? "border-error bg-error-bg focus:border-error"
              : "border-black/10 bg-sur focus:border-marca-400"
          }`}
          disabled={pendente}
        />
        {resultado.erros?.contato && (
          <p className="mt-1 text-xs text-error">{resultado.erros.contato}</p>
        )}
      </div>

      <div>
        <label htmlFor="mensagem" className="block text-sm font-medium text-tx">
          Mensagem
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          placeholder="Diga à gente o que acha, sugestões, dúvidas, críticas construtivas..."
          maxLength={2000}
          rows={6}
          required
          className={`mt-1 w-full rounded-teia border px-3 py-2 text-sm placeholder:text-tx-3 focus:outline-none ${
            resultado.erros?.mensagem
              ? "border-error bg-error-bg focus:border-error"
              : "border-black/10 bg-sur focus:border-marca-400"
          }`}
          disabled={pendente}
        />
        {resultado.erros?.mensagem && (
          <p className="mt-1 text-xs text-error">{resultado.erros.mensagem}</p>
        )}
      </div>

      {/* Campo invisível: anti-spam */}
      <input type="hidden" name="website" />

      <button
        type="submit"
        disabled={pendente}
        className="inline-flex w-full items-center justify-center gap-2 rounded-teia bg-marca-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800 disabled:opacity-50"
      >
        <Mail size={16} />
        {pendente ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
