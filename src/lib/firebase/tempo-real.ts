"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/publico";
import type { NomeColecao } from "@/lib/tipos";

/**
 * Acompanha uma coleção em tempo real.
 *
 * Só o painel usa isto. As páginas públicas passaram a ser servidas prontas
 * pelo servidor — no site atual todo visitante abria cinco escutas ao vivo,
 * inclusive a de `pontos`, com quase 4.000 documentos.
 */
export function useColecao<T>(nome: NomeColecao, ativo = true) {
  const [itens, setItens] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!ativo) return;

    return onSnapshot(
      collection(db(), nome),
      (retrato) => {
        setItens(retrato.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setCarregando(false);
      },
      () => setCarregando(false),
    );
  }, [nome, ativo]);

  return { itens, carregando };
}
