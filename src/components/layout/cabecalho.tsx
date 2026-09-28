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
    <header className="relative isolate border-b border-black/5">
      {/* a arte de fundo, sob um véu branco para o texto ter contraste */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source type="image/avif" srcSet="/img/header-bg-600.avif" />
          <source type="image/webp" srcSet="/img/header-bg-600.webp" />
          <img
            src="/img/header-bg.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-white/91" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-4 sm:gap-6 sm:py-6">
        <Image
          src="/img/logo-teiasp.png"
          alt="Teia SP"
          width={594}
          height={385}
          priority
          className="h-16 w-auto shrink-0 sm:h-24"
        />

        <div className="min-w-0 flex-1">
          <p className="font-display text-base leading-tight font-bold text-marca-800 sm:text-xl">
            {CREDITOS.subtitulo}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-tx-2 sm:text-xs">
            {CREDITOS.idealizacao} <BotoesEquipe />
          </p>
        </div>

        <MenuLateral />
      </div>
    </header>
  );
}
