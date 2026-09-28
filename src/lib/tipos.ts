/**
 * Formato dos documentos no Firestore.
 *
 * Espelha exatamente o que já está gravado nas coleções `servicos`, `pontos`,
 * `pendentes`, `lixeira` e `mensagens` — o banco não é migrado, então os nomes
 * de campo (em português, como no site antigo) são mantidos.
 *
 * Quase tudo é opcional de propósito: os documentos foram criados ao longo do
 * tempo por formulários diferentes e nem todos têm os mesmos campos.
 */

import type { ChaveArea } from "@/lib/areas";

/** Campos comuns a dispositivos e pontos. */
interface Base {
  id: string;
  sigla?: string;
  nome?: string;
  area?: ChaveArea | string;
  endereco?: string;
  telefone?: string;
  lat?: number;
  lng?: number;
  /** data de criação, gravada como texto pt-BR (ex.: "04/03/2026") */
  data?: string;
}

/** Um dispositivo da aba Buscar — coleção `servicos`. */
export interface Servico extends Base {
  /** descrição longa; pode conter HTML simples vindo do editor do painel */
  desc?: string;
  funcao?: string;
  /** rótulos separados por vírgula, ex.: "Crianças, Famílias" */
  publico?: string;
  territorio?: string;
  secretaria?: string;
  ong?: string;
  tags?: string[];
  site?: string;
  autor?: string;
  status?: "aprovado" | "pendente";
}

/** Uma unidade no mapa — coleção `pontos`. */
export interface Ponto extends Base {
  lat: number;
  lng: number;
  /** marcado na auditoria de coordenadas quando alguém confere o endereço */
  coordConferida?: boolean;
}

/** Ponto já com a zona resolvida no servidor, como chega ao mapa. */
export interface PontoNoMapa extends Ponto {
  zona: string | null;
}

/** Sugestão aguardando moderação — coleção `pendentes`. */
export type Pendente = (Servico | Ponto) & {
  id: string;
  /** decide para onde vai ao ser aprovada: `servicos` ou `pontos` */
  tipo: "servico" | "ponto";
  status?: "pendente";
  /** quem enviou, quando a sugestão partiu do painel com alguém logado */
  enviadoPorAdmin?: boolean;
  enviadoPorEmail?: string;
};

/** Mensagem do chat público — coleção `mensagens`. */
export interface Mensagem {
  id: string;
  nome?: string;
  contato?: string;
  mensagem: string;
  /** data e hora em texto pt-BR */
  data?: string;
  lida?: boolean;
}

/**
 * Item na lixeira — coleção `lixeira`.
 * Guarda o documento original inteiro mais a trilha para restaurá-lo.
 */
export type ItemLixeira = Omit<Servico & Partial<Ponto>, "id"> & {
  id: string;
  _origColecao: "servicos" | "pontos";
  _origId: string;
  _excluidoEm?: string;
};

export const COLECOES = {
  servicos: "servicos",
  pontos: "pontos",
  pendentes: "pendentes",
  lixeira: "lixeira",
  mensagens: "mensagens",
} as const;

export type NomeColecao = (typeof COLECOES)[keyof typeof COLECOES];
