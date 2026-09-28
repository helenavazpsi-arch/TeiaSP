"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormularioDispositivo } from "@/components/sugerir/formulario-dispositivo";
import { FormularioPonto } from "@/components/sugerir/formulario-ponto";
import { cn } from "@/lib/utils";

type Tipo = "dispositivo" | "ponto";

/**
 * As duas formas de contribuir. O "Adicionar ponto" do mapa chega aqui com
 * ?tipo=ponto e já abre na aba certa.
 */
export function AbasSugestao({ siglasExistentes }: { siglasExistentes: string[] }) {
  const parametros = useSearchParams();
  const [tipo, setTipo] = useState<Tipo>(() =>
    parametros.get("tipo") === "ponto" ? "ponto" : "dispositivo",
  );

  return (
    <>
      <div className="mb-5 grid gap-2 sm:grid-cols-2" role="tablist">
        <Opcao
          ativo={tipo === "dispositivo"}
          onClick={() => setTipo("dispositivo")}
          titulo="Um dispositivo novo"
          descricao="Um serviço, programa ou benefício que ainda não está no guia."
        />
        <Opcao
          ativo={tipo === "ponto"}
          onClick={() => setTipo("ponto")}
          titulo="O endereço de uma unidade"
          descricao="Uma unidade de algo que já existe no guia, para aparecer no mapa."
        />
      </div>

      {tipo === "dispositivo" ? (
        <FormularioDispositivo siglasExistentes={siglasExistentes} />
      ) : (
        <FormularioPonto />
      )}
    </>
  );
}

function Opcao({
  ativo,
  onClick,
  titulo,
  descricao,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={cn(
        "rounded-teia-lg border px-4 py-3 text-left transition-all",
        ativo
          ? "border-marca-600 bg-marca-50 ring-1 ring-marca-600"
          : "border-black/12 bg-sur hover:border-marca-200",
      )}
    >
      <span
        className={cn(
          "block text-sm font-semibold",
          ativo ? "text-marca-800" : "text-tx",
        )}
      >
        {titulo}
      </span>
      <span className="mt-0.5 block text-[12px] leading-snug text-tx-2">{descricao}</span>
    </button>
  );
}
