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
      // Encontra o elemento "Sobre o projeto" pelo ID
      const sobreProjeto = document.getElementById("sobre");

      if (sobreProjeto) {
        // Calcula a posição: distância do topo da página até o final do "Sobre o projeto"
        const rect = sobreProjeto.getBoundingClientRect();
        const offsetFromTop = rect.bottom + window.scrollY;
        setTopOffset(Math.max(0, offsetFromTop));
      }
    }

    // Executa logo após render
    updatePosition();

    // Atualiza ao fazer resize
    window.addEventListener("resize", updatePosition);
    // Também atualiza durante scroll para manter sincronizado
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
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
