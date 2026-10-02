import { createContext, useContext } from "react";

export const ModalContext = createContext<{
  fecharModal: () => void;
} | null>(null);

export function useFecharModal() {
  const context = useContext(ModalContext);
  return context?.fecharModal || (() => {});
}
