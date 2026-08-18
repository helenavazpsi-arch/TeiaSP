/**
 * Configuração do projeto Firebase `teia-sp`.
 *
 * Estes valores são públicos por definição — identificam o projeto, não
 * autenticam ninguém, e já estavam visíveis no HTML do site antigo. Quem
 * controla o acesso são as regras do Firestore (firestore.rules).
 *
 * Ficam como padrão no código para o projeto rodar sem configuração; qualquer
 * um deles pode ser sobrescrito por variável de ambiente, o que permite
 * apontar para um projeto de teste sem tocar no código.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCcGNSfnFlyjA6vbDZB3XGdx-Ca0FE7uhg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "teia-sp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "teia-sp",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "teia-sp.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "599584374882",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:599584374882:web:e8883e473fbdda11f9d13b",
} as const;
