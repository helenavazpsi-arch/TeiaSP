"use server";

import { addDoc, collection } from "firebase/firestore";
import { headers } from "next/headers";
import {
  esquemaDispositivo,
  esquemaMensagem,
  esquemaPonto,
} from "@/lib/esquemas";
import { db } from "@/lib/firebase/publico";
import { geocodificar } from "@/lib/geocode";
import { podeEnviar } from "@/lib/limite-envio";
import { COLECOES } from "@/lib/tipos";

/**
 * Recebimento das sugestões do público.
 *
 * Tudo cai em `pendentes` e espera moderação, como antes. O que muda é onde a
 * checagem acontece: validação, freio por IP e geocodificação passam a rodar
 * no servidor, e não no navegador de quem envia.
 */

export interface Resultado {
  ok: boolean;
  mensagem: string;
  /** erros por campo, para o formulário destacar */
  erros?: Record<string, string>;
}

/** Data no mesmo formato de texto que o restante do banco já usa. */
function agoraEmTexto(comHora = false): string {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  if (!comHora) return data;

  const hora = agora.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} ${hora}`;
}

async function identificacaoDoEnvio() {
  const cabecalhos = await headers();
  return (
    cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    cabecalhos.get("x-real-ip") ||
    "desconhecido"
  );
}

/** Campo invisível: só robô preenche. */
function ehRobo(dados: FormData): boolean {
  return Boolean(dados.get("website"));
}

function errosDoZod(erro: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const saida: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "");
    if (campo && !saida[campo]) saida[campo] = problema.message;
  }
  return saida;
}

export async function sugerirDispositivo(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  if (ehRobo(dados)) return { ok: true, mensagem: "Sugestão enviada!" };

  if (!podeEnviar(await identificacaoDoEnvio())) {
    return {
      ok: false,
      mensagem:
        "Você enviou várias sugestões seguidas. Aguarde alguns minutos antes de mandar outra.",
    };
  }

  const analise = esquemaDispositivo.safeParse({
    sigla: dados.get("sigla"),
    nome: dados.get("nome"),
    area: dados.get("area"),
    desc: dados.get("desc"),
    publico: dados.getAll("publico"),
    secretaria: dados.get("secretaria"),
    tags: dados.get("tags"),
    site: dados.get("site"),
    autor: dados.get("autor"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: "Confira os campos destacados.",
      erros: errosDoZod(analise.error),
    };
  }

  const entrada = analise.data;

  try {
    await addDoc(collection(db(), COLECOES.pendentes), {
      tipo: "servico",
      sigla: entrada.sigla,
      nome: entrada.nome,
      area: entrada.area,
      desc: entrada.desc,
      publico: entrada.publico.join(", "),
      secretaria: entrada.secretaria,
      tags: entrada.tags
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      site: entrada.site,
      autor: entrada.autor,
      territorio: "",
      funcao: "",
      endereco: "",
      ong: "",
      data: agoraEmTexto(),
      status: "pendente",
    });

    return {
      ok: true,
      mensagem: "Sugestão enviada! A equipe vai revisar antes de publicar.",
    };
  } catch {
    return {
      ok: false,
      mensagem: "Não conseguimos enviar agora. Tente de novo em instantes.",
    };
  }
}

export async function sugerirPonto(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  if (ehRobo(dados)) return { ok: true, mensagem: "Endereço enviado!" };

  if (!podeEnviar(await identificacaoDoEnvio())) {
    return {
      ok: false,
      mensagem:
        "Você enviou vários endereços seguidos. Aguarde alguns minutos antes de mandar outro.",
    };
  }

  const analise = esquemaPonto.safeParse({
    sigla: dados.get("sigla"),
    nome: dados.get("nome"),
    area: dados.get("area"),
    endereco: dados.get("endereco"),
    telefone: dados.get("telefone"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: "Confira os campos destacados.",
      erros: errosDoZod(analise.error),
    };
  }

  const entrada = analise.data;

  // sem coordenada não há ponto no mapa: o endereço é recusado na hora
  const coordenada = await geocodificar(entrada.endereco);
  if (!coordenada) {
    return {
      ok: false,
      mensagem:
        "Não encontramos esse endereço dentro da cidade de São Paulo. Confira o número e o bairro.",
      erros: { endereco: "Endereço não localizado." },
    };
  }

  try {
    await addDoc(collection(db(), COLECOES.pendentes), {
      tipo: "ponto",
      sigla: entrada.sigla,
      nome: entrada.nome,
      area: entrada.area,
      endereco: entrada.endereco,
      telefone: entrada.telefone,
      lat: coordenada.lat,
      lng: coordenada.lng,
      data: agoraEmTexto(),
      status: "pendente",
    });

    return {
      ok: true,
      mensagem: `Endereço localizado${coordenada.bairro ? ` em ${coordenada.bairro}` : ""} e enviado para aprovação!`,
    };
  } catch {
    return {
      ok: false,
      mensagem: "Não conseguimos enviar agora. Tente de novo em instantes.",
    };
  }
}

export async function enviarMensagem(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  if (ehRobo(dados)) return { ok: true, mensagem: "Mensagem enviada!" };

  if (!podeEnviar(await identificacaoDoEnvio())) {
    return {
      ok: false,
      mensagem: "Você enviou várias mensagens seguidas. Aguarde alguns minutos.",
    };
  }

  const analise = esquemaMensagem.safeParse({
    nome: dados.get("nome"),
    contato: dados.get("contato"),
    mensagem: dados.get("mensagem"),
  });

  if (!analise.success) {
    return {
      ok: false,
      mensagem: "Confira os campos destacados.",
      erros: errosDoZod(analise.error),
    };
  }

  const entrada = analise.data;

  try {
    await addDoc(collection(db(), COLECOES.mensagens), {
      nome: entrada.nome || "Anônimo",
      contato: entrada.contato,
      mensagem: entrada.mensagem,
      data: agoraEmTexto(true),
      lida: false,
    });

    return { ok: true, mensagem: "Mensagem enviada! A equipe vai ler em breve." };
  } catch {
    return {
      ok: false,
      mensagem: "Não conseguimos enviar agora. Tente de novo em instantes.",
    };
  }
}
