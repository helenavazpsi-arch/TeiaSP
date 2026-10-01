import Link from "next/link";
import { CREDITOS } from "@/data/conteudo";

/**
 * A data de atualização vem da última alteração no conteúdo, calculada em
 * src/lib/dados/servicos.ts. No site antigo era a constante `DATA_ATU`,
 * digitada à mão no código: em 18/08/2026 o rodapé anunciava 31/07/2026
 * porque alguém precisava lembrar de editar o arquivo.
 */
export function Rodape({ atualizadoEm }: { atualizadoEm?: string }) {
  return (
    <footer className="mt-auto border-t border-black/10 bg-sur/85 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6 text-center text-[11px] text-tx-3">
        {atualizadoEm && <p>Atualizado pela última vez em: {atualizadoEm}</p>}
        <Link
          href="/sugerir?tipo=mensagem"
          className="inline-block rounded-teia bg-marca-700 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-marca-800"
        >
          Enviar feedback
        </Link>
        <p>{CREDITOS.direitos}</p>
      </div>
    </footer>
  );
}
