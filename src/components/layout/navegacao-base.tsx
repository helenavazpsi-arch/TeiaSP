import { Lock, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { SECOES } from "@/data/conteudo";
import { cn } from "@/lib/utils";

/**
 * O visual da navegação, sem hooks.
 *
 * Fica separado porque o destaque do item ativo depende do caminho atual, que
 * só existe no cliente. Com Cache Components, ler isso durante o prerender
 * bloquearia a página inteira; assim o HTML estático já sai com a navegação
 * desenhada (`caminho = null`, nada destacado) e o destaque aparece na
 * hidratação, sem atraso perceptível.
 */

const ICONES = { busca: Search, mapa: MapPin, sugerir: Plus, admin: Lock } as const;

export function ehAtivo(href: string, caminho: string | null) {
  if (!caminho) return false;
  return href === "/" ? caminho === "/" : caminho.startsWith(href);
}

export function NavegacaoTopoBase({ caminho }: { caminho: string | null }) {
  return (
    <nav
      aria-label="Seções do site"
      className="sticky top-0 z-30 hidden border-b border-black/5 bg-sur/85 backdrop-blur-md sm:block"
    >
      <div className="mx-auto flex w-full max-w-5xl gap-1 px-4">
        {SECOES.map((secao) => {
          const Icone = ICONES[secao.icone];
          const ativo = ehAtivo(secao.href, caminho);

          return (
            <Link
              key={secao.href}
              href={secao.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                ativo
                  ? "border-marca-600 text-marca-800"
                  : "border-transparent text-tx-2 hover:border-marca-200 hover:text-tx",
              )}
            >
              <Icone size={17} aria-hidden />
              {secao.rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BarraInferiorBase({ caminho }: { caminho: string | null }) {
  return (
    <nav
      aria-label="Seções do site"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-sur/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <div className="flex">
        {SECOES.map((secao) => {
          const Icone = ICONES[secao.icone];
          const ativo = ehAtivo(secao.href, caminho);

          return (
            <Link
              key={secao.href}
              href={secao.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                ativo ? "text-marca-700" : "text-tx-3",
              )}
            >
              <Icone size={20} aria-hidden />
              {secao.rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
