"use client";

import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { revalidarConteudo } from "@/acoes/revalidar";
import { db } from "@/lib/firebase/publico";
import { COLECOES, type ItemLixeira, type Pendente, type Servico } from "@/lib/tipos";

/**
 * As ações da equipe sobre o conteúdo.
 *
 * Todas recebem o **id do documento**. No site atual os botões passavam a
 * posição do item na lista (`aprovar(3)`) e a função convertia posição em id no
 * momento do clique — com a lista atualizando ao vivo, uma sugestão nova
 * chegando entre o desenho e o clique deslocava tudo e a ação caía no
 * documento errado.
 *
 * A escrita sai do navegador da moderadora, autenticada; quem autoriza são as
 * regras do Firestore. Depois de cada alteração o cache das páginas públicas é
 * derrubado para o site refletir a mudança na hora.
 */

function referencia(colecao: string, id: string) {
  return doc(db(), colecao, id);
}

/** Aprova: copia para a coleção final e tira da fila. */
export async function aprovar(pendente: Pendente): Promise<void> {
  const { id, tipo, ...campos } = pendente;

  if (tipo === "ponto") {
    const ponto = campos as Partial<Pendente>;
    await addDoc(collection(db(), COLECOES.pontos), {
      sigla: ponto.sigla ?? "",
      nome: ponto.nome ?? "",
      area: ponto.area ?? "",
      endereco: ponto.endereco ?? "",
      telefone: ponto.telefone ?? "",
      lat: ponto.lat,
      lng: ponto.lng,
    });
  } else {
    await addDoc(collection(db(), COLECOES.servicos), {
      ...campos,
      status: "aprovado",
    });
  }

  await deleteDoc(referencia(COLECOES.pendentes, id));
  await revalidarConteudo();
}

/** Rejeita: sai da fila sem ir para a lixeira, como no site atual. */
export async function rejeitar(id: string): Promise<void> {
  await deleteDoc(referencia(COLECOES.pendentes, id));
}

export async function salvarServico(
  id: string,
  campos: Record<string, unknown>,
): Promise<void> {
  await updateDoc(referencia(COLECOES.servicos, id), campos);
  await revalidarConteudo();
}

export async function salvarPonto(
  id: string,
  campos: Record<string, unknown>,
): Promise<void> {
  await updateDoc(referencia(COLECOES.pontos, id), campos);
  await revalidarConteudo();
}

/** Aprova editando: grava a versão revisada e limpa a pendência. */
export async function aprovarComEdicao(
  pendenteId: string,
  campos: Record<string, unknown>,
): Promise<void> {
  await addDoc(collection(db(), COLECOES.servicos), { ...campos, status: "aprovado" });
  await deleteDoc(referencia(COLECOES.pendentes, pendenteId));
  await revalidarConteudo();
}

/** Exclusão reversível: o documento vai para a lixeira com a trilha de volta. */
export async function moverParaLixeira(
  origem: "servicos" | "pontos",
  documento: { id: string } & Record<string, unknown>,
): Promise<void> {
  const { id, ...campos } = documento;
  const agora = new Date();

  await addDoc(collection(db(), COLECOES.lixeira), {
    ...campos,
    _origColecao: origem,
    _origId: id,
    _excluidoEm: `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
  });

  await deleteDoc(referencia(origem, id));
  await revalidarConteudo();
}

export async function restaurarDaLixeira(item: ItemLixeira): Promise<void> {
  const { id, _origColecao, _origId, _excluidoEm, ...campos } = item;
  void _origId;
  void _excluidoEm;

  await addDoc(collection(db(), _origColecao), campos);
  await deleteDoc(referencia(COLECOES.lixeira, id));
  await revalidarConteudo();
}

/** Esvaziar de vez: só a lixeira permite, e sem volta. */
export async function excluirDaLixeira(id: string): Promise<void> {
  await deleteDoc(referencia(COLECOES.lixeira, id));
}

/** Tira um dispositivo da busca e o transforma em ponto do mapa. */
export async function converterEmPonto(servico: Servico): Promise<void> {
  await addDoc(collection(db(), COLECOES.pontos), {
    sigla: servico.sigla ?? "",
    nome: servico.nome ?? "",
    area: servico.area ?? "",
    endereco: servico.endereco ?? "",
    telefone: servico.telefone ?? "",
    lat: servico.lat,
    lng: servico.lng,
  });
  await deleteDoc(referencia(COLECOES.servicos, servico.id));
  await revalidarConteudo();
}

export async function marcarMensagemLida(id: string): Promise<void> {
  await updateDoc(referencia(COLECOES.mensagens, id), { lida: true });
}

export async function excluirMensagem(id: string): Promise<void> {
  await deleteDoc(referencia(COLECOES.mensagens, id));
}
