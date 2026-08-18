import { z } from "zod";
import { CHAVES_AREA } from "@/lib/areas";

/**
 * Validação dos formulários públicos.
 *
 * No site atual isso era um `if (!sigla || !nome)` no navegador — quem
 * chamasse a API direto podia gravar qualquer coisa em `pendentes`. Aqui a
 * checagem acontece no servidor, e as regras do Firestore repetem os limites
 * como segunda barreira.
 */

const areaValida = z.enum(CHAVES_AREA as [string, ...string[]], {
  message: "Escolha uma das áreas da lista.",
});

const textoCurto = z.string().trim().max(300);

export const esquemaDispositivo = z.object({
  sigla: z
    .string()
    .trim()
    .min(1, "Informe a sigla ou o nome curto.")
    .max(200, "Sigla muito longa."),
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome completo.")
    .max(300, "Nome muito longo."),
  area: areaValida,
  desc: z
    .string()
    .trim()
    .min(20, "Descreva o dispositivo em pelo menos 20 caracteres.")
    .max(20000, "Descrição muito longa."),
  publico: z.array(z.string().max(80)).max(20).optional().default([]),
  secretaria: textoCurto.optional().default(""),
  tags: textoCurto.optional().default(""),
  site: z
    .union([z.literal(""), z.url({ message: "Endereço de site inválido." }).max(500)])
    .optional()
    .default(""),
  autor: textoCurto.optional().default(""),
});

export const esquemaPonto = z.object({
  sigla: z
    .string()
    .trim()
    .min(1, "Informe o nome ou a sigla da unidade.")
    .max(200, "Nome muito longo."),
  nome: textoCurto.optional().default(""),
  area: areaValida,
  endereco: z
    .string()
    .trim()
    .min(8, "Informe o endereço completo, com número e bairro.")
    .max(400, "Endereço muito longo."),
  telefone: z.string().trim().max(60).optional().default(""),
});

export const esquemaMensagem = z.object({
  nome: textoCurto.optional().default(""),
  contato: textoCurto.optional().default(""),
  mensagem: z
    .string()
    .trim()
    .min(3, "Escreva a mensagem.")
    .max(5000, "Mensagem muito longa."),
});

export type DadosDispositivo = z.infer<typeof esquemaDispositivo>;
export type DadosPonto = z.infer<typeof esquemaPonto>;
export type DadosMensagem = z.infer<typeof esquemaMensagem>;
