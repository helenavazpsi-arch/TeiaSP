import { MessageSquare } from "lucide-react";
import { Suspense } from "react";
import { AbasSugestao } from "@/components/sugerir/abas-sugestao";
import { listarServicos } from "@/lib/dados/servicos";

export const metadata = {
  title: "Sugestões",
  description:
    "Compartilhe novas informações com a Teia SP. Sugira novos dispositivos ou endereços de unidades.",
  alternates: { canonical: "/sugerir" },
};

async function SugestoesContent() {
  const servicos = await listarServicos();
  const siglasExistentes = servicos
    .map((s) => s.sigla)
    .filter(Boolean) as string[];

  return <AbasSugestao siglasExistentes={siglasExistentes} />;
}

export default async function PaginaSugestoes() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      <div className="mb-4 flex items-start gap-2.5 rounded-teia-lg border border-info/20 bg-info-bg px-4 py-3 text-[13px] text-info">
        <MessageSquare size={17} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong>Contribua com a Teia SP.</strong> Sugira novos dispositivos ou compartilhe o
          endereço de uma unidade que falta no mapa. Obrigado pelo seu aporte!
        </p>
      </div>

      <h1 className="sr-only">Sugestões de dispositivos e endereços</h1>

      <Suspense fallback={<div className="h-64 rounded-teia-lg bg-sur-2" />}>
        <SugestoesContent />
      </Suspense>
    </main>
  );
}
