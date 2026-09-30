"use client";

import { useEffect, useRef, useState } from "react";
import { Suspense } from "react";
import { NavegacaoTopoBase } from "@/components/layout/navegacao-base";
import { NavegacaoTopo } from "@/components/layout/navegacao";

/** Calcula dinamicamente a posição da barra de navegação após o "Sobre o projeto" */
export function NavegacaoFixa() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    function updatePosition() {
      // Encontra o elemento "Sobre o projeto" (último div/section antes desta nav)
      const sobreProjeto = document.querySelector('[class*="sobre"]');

      if (sobreProjeto && wrapperRef.current) {
        // Calcula a posição do elemento
        const rect = sobreProjeto.getBoundingClientRect();
        // A nav fica logo após "Sobre o projeto"
        const offsetFromViewport = rect.bottom;
        setTopOffset(Math.max(0, offsetFromViewport));
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none py-2"
      style={{
        position: "fixed",
        top: `${topOffset}px`,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <div className="pointer-events-auto">
        <Suspense fallback={<NavegacaoTopoBase caminho={null} />}>
          <NavegacaoTopo />
        </Suspense>
      </div>
    </div>
  );
}
