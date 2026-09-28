"use client";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { appFirebase } from "@/lib/firebase/publico";

/**
 * Sessão da equipe no painel.
 *
 * Continua sendo Firebase Auth por e-mail e senha, sem mudança de contas: toda
 * pessoa autenticada no projeto é moderadora. O que impede um visitante de
 * alterar conteúdo são as regras do Firestore, não esta tela.
 */

interface Sessao {
  usuario: User | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const ContextoSessao = createContext<Sessao | null>(null);

export function ProvedorSessao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(getAuth(appFirebase()), (quem) => {
      setUsuario(quem);
      setCarregando(false);
    });
  }, []);

  const valor = useMemo<Sessao>(
    () => ({
      usuario,
      carregando,
      entrar: async (email, senha) => {
        await signInWithEmailAndPassword(getAuth(appFirebase()), email, senha);
      },
      sair: async () => {
        await signOut(getAuth(appFirebase()));
      },
    }),
    [usuario, carregando],
  );

  return <ContextoSessao value={valor}>{children}</ContextoSessao>;
}

export function useSessao(): Sessao {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error("useSessao precisa estar dentro de ProvedorSessao");
  return contexto;
}
