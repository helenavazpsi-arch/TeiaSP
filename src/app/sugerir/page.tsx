import { HeartHandshake } from "lucide-react";
import { Suspense } from "react";
import { AbasSugestao } from "@/components/sugerir/abas-sugestao";
import { normalizar } from "@/lib/busca";
import { listarServicos } from "@/lib/dados/servicos";

export const metadata = {
  title: "Sugerir um dispositivo",
  description:
    "Contribua com a Teia SP: sugira um dispositivo, serviço ou benefício que ainda não está no guia, ou o endereço de uma unidade para o mapa.",
  alternates: { canonical: "/sugerir" },
};

export default async function PaginaSugerir() {
  const servicos = await listarServicos();
  const siglasExistentes = [
    ...new Set(servicos.map((s) => normalizar(s.sigla)).filter(Boolean)),
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-start gap-2.5 rounded-teia-lg border border-marca-100 bg-marca-50/95 px-4 py-3 text-[13px] text-marca-900">
        <HeartHandshake size={17} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong>Contribua com a Teia.</strong> Toda sugestão passa pela revisão da equipe
          antes de aparecer no site — assim o guia continua confiável para quem procura
          atendimento.
        </p>
      </div>

      <h1 className="font-display text-xl font-bold text-tx">O que você quer sugerir?</h1>
      <p className="mt-1 mb-5 text-sm text-tx-2">
        Escolha abaixo. Leva poucos minutos, e você não precisa de cadastro.
      </p>

      <Suspense fallback={<div className="h-96 rounded-teia-lg bg-sur-2" />}>
        <AbasSugestao siglasExistentes={siglasExistentes} />
      </Suspense>
    </main>
  );
}
