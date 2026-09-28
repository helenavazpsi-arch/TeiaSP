"use client";

import { Loader2 } from "lucide-react";
import { Login } from "@/components/admin/login";
import { Painel } from "@/components/admin/painel";
import { ProvedorSessao, useSessao } from "@/lib/firebase/sessao";

/** Decide entre a tela de entrada e o painel, conforme a sessão. */
function Conteudo() {
  const { usuario, carregando } = useSessao();

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-tx-3">
        <Loader2 size={16} className="animate-spin" />
        Verificando acesso…
      </div>
    );
  }

  return usuario ? <Painel /> : <Login />;
}

export function AreaRestrita() {
  return (
    <ProvedorSessao>
      <Conteudo />
    </ProvedorSessao>
  );
}
