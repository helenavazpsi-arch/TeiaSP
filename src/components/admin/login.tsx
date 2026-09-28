"use client";

import { Loader2, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { Campo, entrada } from "@/components/ui/campo";
import { useSessao } from "@/lib/firebase/sessao";

export function Login() {
  const { entrar } = useSessao();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(dados: FormData) {
    setErro("");
    setEnviando(true);
    try {
      await entrar(String(dados.get("email") ?? ""), String(dados.get("senha") ?? ""));
    } catch {
      setErro("E-mail ou senha incorretos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="rounded-teia-lg border border-black/10 bg-sur p-6 shadow-sm">
        <h1 className="text-center font-display text-lg font-bold">Área restrita</h1>

        <p className="mt-3 flex items-start gap-2 rounded-teia bg-info-bg px-3 py-2.5 text-[12px] leading-relaxed text-info">
          <Lock size={14} className="mt-0.5 shrink-0" />
          Aba reservada à equipe, para aprovar os dispositivos e endereços sugeridos pela
          comunidade.
        </p>

        <form action={aoEnviar} className="mt-5 space-y-3">
          <Campo id="email" rotulo="E-mail">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className={entrada()}
            />
          </Campo>

          <Campo id="senha" rotulo="Senha" erro={erro}>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              className={entrada(erro)}
            />
          </Campo>

          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-teia bg-marca-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800 disabled:opacity-70"
          >
            {enviando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
