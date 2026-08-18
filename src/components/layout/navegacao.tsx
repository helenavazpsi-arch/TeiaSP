"use client";

import { usePathname } from "next/navigation";
import { BarraInferiorBase, NavegacaoTopoBase } from "@/components/layout/navegacao-base";

/** Só acrescenta o destaque do item atual sobre o visual de navegacao-base. */

export function NavegacaoTopo() {
  return <NavegacaoTopoBase caminho={usePathname()} />;
}

export function BarraInferior() {
  return <BarraInferiorBase caminho={usePathname()} />;
}
