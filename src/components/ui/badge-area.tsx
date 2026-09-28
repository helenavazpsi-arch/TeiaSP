import { area } from "@/lib/areas";
import { cn } from "@/lib/utils";

/**
 * Etiqueta colorida da área temática.
 * As cores vêm de src/lib/areas.ts e são aplicadas inline porque são valores
 * hex vindos dos dados, não classes conhecidas em tempo de build.
 */
export function BadgeArea({
  chave,
  className,
  comIcone = true,
}: {
  chave: string | undefined;
  className?: string;
  comIcone?: boolean;
}) {
  const { chave: rotulo, badge, icone: Icone } = area(chave);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
      style={{ background: badge.bg, color: badge.fg }}
    >
      {comIcone && <Icone size={12} aria-hidden />}
      {rotulo}
    </span>
  );
}
