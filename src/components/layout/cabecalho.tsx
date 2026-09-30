import Image from "next/image";
import { CREDITOS } from "@/data/conteudo";
import { BotoesEquipe } from "@/components/contato/botoes-equipe";
import { MenuLateral } from "@/components/layout/menu-lateral";

/**
 * Cabeçalho com a arte de Lilla Cirenza Lescher ao fundo.
 *
 * O original empilhava logo de 120px e três linhas de crédito, o que no
 * celular empurrava o conteúdo para bem abaixo da dobra. Aqui a logo encolhe
 * em telas pequenas e o crédito das artistas foi para o rodapé — continua
 * visível, sem custar a primeira tela de quem veio procurar um serviço.
 */
export function Cabecalho() {
  return (
    <header
      className="relative isolate"
      style={{
        backgroundImage: "url('/img/header-bg.jpg')",
        backgroundSize: "auto auto",
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
      }}
    >
      {/* véu branco sobre a arte para o texto ter contraste */}
      <div className="absolute inset-0 -z-10 bg-white/85" />

      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:py-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <Image
            src="/img/logo-teiasp.png"
            alt="Teia SP"
            width={594}
            height={385}
            priority
            className="h-14 w-auto shrink-0 sm:h-24"
          />

          <div className="min-w-0 flex-1">
            <p className="font-display text-sm leading-tight font-bold text-marca-800 sm:text-xl">
              {CREDITOS.subtitulo}
            </p>
            <div className="mt-1.5 space-y-0.5 text-xs leading-relaxed text-tx-2 sm:text-base">
              <p>
                {CREDITOS.idealizacao} <BotoesEquipe />
              </p>
              <p>{CREDITOS.logo}</p>
              <p>
                {CREDITOS.arte.rotulo}{" "}
                <a
                  href={CREDITOS.arte.url}
                  target="_blank"
                  rel="noopener"
                  className="underline hover:text-marca-700"
                >
                  {CREDITOS.arte.nome}
                </a>
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <MenuLateral />
          </div>
        </div>
      </div>
    </header>
  );
}
