import { ChevronDown, Info } from "lucide-react";
import { SOBRE } from "@/data/conteudo";

/**
 * "Sobre o projeto", recolhido por padrão.
 *
 * Usa <details>/<summary> nativos: abre e fecha sem JavaScript, já vem
 * acessível por teclado e o conteúdo continua no HTML para o Google indexar —
 * no site antigo dependia de uma classe alternada por script.
 */
export function SobreProjeto() {
  return (
    <details
      id="sobre"
      className="group border-b border-marca-100 bg-marca-50/95 scroll-mt-16"
    >
      <summary className="mx-auto flex w-full max-w-5xl cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-marca-800 marker:content-none hover:text-marca-900">
        <Info size={16} className="shrink-0" />
        Sobre este projeto
        <ChevronDown
          size={16}
          className="ml-auto shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="mx-auto w-full max-w-5xl px-4 pb-5">
        <h2 className="font-display text-base font-bold text-marca-900">{SOBRE.titulo}</h2>

        <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-tx-2">
          {SOBRE.paragrafos.map((paragrafo) => (
            <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
          ))}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-marca-700 hover:text-marca-900">
            Referências
          </summary>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-tx-3">
            {SOBRE.referencias.map((ref) => (
              <li key={ref.texto.slice(0, 40)}>
                {ref.texto}
                {"link" in ref && ref.link && (
                  <a
                    href={ref.link.url}
                    target="_blank"
                    rel="noopener"
                    className="underline hover:text-marca-700"
                  >
                    {ref.link.rotulo}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </details>
  );
}
