import { createContext, useContext } from "react";

export const ModalContext = createContext<{
  fecharModal: () => void;
} | null>(null);

export function useFecharModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useFecharModal deve ser usado dentro de ModalProvider");
  }
  return context.fecharModal;
}
