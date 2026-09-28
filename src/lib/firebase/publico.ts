import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

/**
 * Acesso de leitura ao Firestore, usado tanto no servidor (para o ISR das
 * páginas públicas) quanto no navegador (painel e mensagens em tempo real).
 *
 * Vale para o conteúdo que já é público: `servicos` e `pontos` são liberados
 * para leitura nas regras, então isso funciona sem nenhuma credencial — o que
 * mantém o projeto rodando localmente sem service account. Escrita
 * administrativa é outra história e passa por autenticação.
 */
export function appFirebase() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function db() {
  return getFirestore(appFirebase());
}
