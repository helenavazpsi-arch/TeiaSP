import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function BotaoFeedbackFlutuante() {
  return (
    <Link
      href="/sugerir?tipo=mensagem"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-marca-700 text-white shadow-lg transition-all hover:bg-marca-800 hover:scale-110"
      title="Enviar feedback"
      aria-label="Enviar feedback para os desenvolvedores"
    >
      <MessageCircle size={24} />
    </Link>
  );
}
