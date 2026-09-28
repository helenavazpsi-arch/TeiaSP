import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Etiqueta neutra usada nos cartões (público, território, palavras-chave). */
export function Etiqueta({
  children,
  className,
  icone: Icone,
}: {
  children: ReactNode;
  className?: string;
  icone?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-black/10 bg-sur-2 px-2.5 py-0.5 text-[11px] text-tx-2",
        className,
      )}
    >
      {Icone && <Icone size={11} className="shrink-0" />}
      {children}
    </span>
  );
}
