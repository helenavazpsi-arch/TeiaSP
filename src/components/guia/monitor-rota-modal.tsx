"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MonitorRotaModal({ onSairDisositivo }: { onSairDisositivo: () => void }) {
  const pathname = usePathname();
  const pathnameAnterior = useRef<string>(pathname);

  useEffect(() => {
    if (!pathname.includes("/dispositivo/") && pathnameAnterior.current.includes("/dispositivo/")) {
      onSairDisositivo();
    }
    pathnameAnterior.current = pathname;
  }, [pathname, onSairDisositivo]);

  return null;
}
