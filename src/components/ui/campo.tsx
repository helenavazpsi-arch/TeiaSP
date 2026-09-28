import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ESTILO_CONTROLE =
  "w-full rounded-teia border border-black/12 bg-sur px-3 py-2.5 text-sm text-tx placeholder:text-tx-3 focus:border-marca-400 focus:outline-none disabled:opacity-60";

export function Campo({
  id,
  rotulo,
  obrigatorio,
  dica,
  erro,
  children,
  className,
}: {
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  dica?: string;
  erro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-tx-2">
        {rotulo}
        {obrigatorio && (
          <span className="text-erro" aria-hidden>
            {" *"}
          </span>
        )}
      </label>
      {dica && <p className="mt-0.5 text-[11px] text-tx-3">{dica}</p>}
      <div className="mt-1">{children}</div>
      {erro && (
        <p className="mt-1 text-[11px] text-erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export function entrada(erro?: string) {
  return cn(ESTILO_CONTROLE, erro && "border-erro");
}

/**
 * Campo isca contra robôs: invisível para gente, preenchido por preenchedores
 * automáticos. Se vier com conteúdo, o envio é descartado em silêncio.
 */
export function Isca() {
  return (
    <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
      <label htmlFor="website">Não preencha este campo</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
