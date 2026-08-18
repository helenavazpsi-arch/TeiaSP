"use client";

import { Loader2 } from "lucide-react";
import { Login } from "@/components/admin/login";
import { PainelAuditoria } from "@/components/admin/painel-auditoria";
import type { Auditoria } from "@/lib/dados/auditoria";
import { ProvedorSessao, useSessao } from "@/lib/firebase/sessao";

function Conteudo({ auditoria }: { auditoria: Auditoria }) {
  const { usuario, carregando } = useSessao();

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-tx-3">
        <Loader2 size={16} className="animate-spin" />
        Verificando acesso…
      </div>
    );
  }

  return usuario ? <PainelAuditoria auditoria={auditoria} /> : <Login />;
}

export function AuditoriaProtegida({ auditoria }: { auditoria: Auditoria }) {
  return (
    <ProvedorSessao>
      <Conteudo auditoria={auditoria} />
    </ProvedorSessao>
  );
}
