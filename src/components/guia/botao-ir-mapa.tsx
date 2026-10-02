"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFecharModal } from "@/components/guia/modal-context";

export function BotaoIrMapa({ sigla, nome }: { sigla?: string; nome?: string }) {
  const router = useRouter();
  const fecharModal = useFecharModal();
  const busca = encodeURIComponent(sigla || nome || "");

  const handleClick = () => {
    router.push(`/mapa?busca=${busca}`);
    fecharModal();
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-teia bg-marca-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800"
    >
      <MapPin size={16} />
      Ver as unidades no mapa
    </button>
  );
}
