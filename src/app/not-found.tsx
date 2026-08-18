import { Compass, Search } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NaoEncontrado() {
  return (
    <main className="px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Compass size={40} className="mx-auto text-marca-400" aria-hidden />

        <h1 className="mt-4 font-display text-2xl font-bold text-tx">
          Não encontramos esta página
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-tx-2">
          O endereço pode ter mudado, ou o dispositivo saiu do ar. Vale procurar pelo nome
          na busca — a maior parte dos serviços continua por aqui.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-teia bg-marca-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-800"
          >
            <Search size={16} />
            Ir para a busca
          </Link>
          <Link
            href="/sugerir"
            className="inline-flex items-center justify-center gap-2 rounded-teia border border-black/10 px-4 py-2.5 text-sm font-medium text-tx transition-colors hover:bg-sur-2"
          >
            Sugerir um dispositivo
          </Link>
        </div>
      </div>
    </main>
  );
}
