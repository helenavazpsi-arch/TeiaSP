/**
 * As onze áreas temáticas da Teia SP.
 *
 * No site atual isso vivia em três objetos paralelos que precisavam ser
 * editados juntos (ACFG, BADGE e ICON, em legacy/index.html:1309) mais uma
 * dúzia de classes CSS. Aqui é uma estrutura só: a chave é exatamente a
 * string gravada no campo `area` de cada documento do Firestore, então nada
 * precisa ser migrado no banco.
 */

import {
  Brain,
  Briefcase,
  Ellipsis,
  Gavel,
  HeartHandshake,
  House,
  Palette,
  Scale,
  School,
  Stethoscope,
  Target,
  type LucideIcon,
} from "lucide-react";

export type ChaveArea =
  | "Assistência Social"
  | "Saúde"
  | "Saúde Mental"
  | "Educação"
  | "Benefícios/Programas"
  | "Trabalho"
  | "Moradia"
  | "Justiça"
  | "Direitos Humanos"
  | "Lazer/Cultura"
  | "Outros";

export interface Area {
  /** valor gravado no Firestore — não alterar sem migrar os dados */
  chave: ChaveArea;
  /** usado em URLs e parâmetros de filtro */
  slug: string;
  /** cor sólida: pino do mapa, barra do modal, chip ativo */
  cor: string;
  /** fundo e texto do badge */
  badge: { bg: string; fg: string };
  icone: LucideIcon;
}

export const AREAS: readonly Area[] = [
  {
    chave: "Assistência Social",
    slug: "assistencia-social",
    cor: "#F5C400",
    badge: { bg: "#FFF8C5", fg: "#5A3E00" },
    icone: HeartHandshake,
  },
  {
    chave: "Saúde",
    slug: "saude",
    cor: "#7EC8E3",
    badge: { bg: "#E3F4FA", fg: "#0A3D52" },
    icone: Stethoscope,
  },
  {
    chave: "Saúde Mental",
    slug: "saude-mental",
    cor: "#1B3A6B",
    badge: { bg: "#1B3A6B", fg: "#FFFFFF" },
    icone: Brain,
  },
  {
    chave: "Educação",
    slug: "educacao",
    cor: "#3A8C3F",
    badge: { bg: "#E6F4E7", fg: "#1B5E20" },
    icone: School,
  },
  {
    chave: "Benefícios/Programas",
    slug: "beneficios-programas",
    cor: "#9E9E9E",
    badge: { bg: "#F5F5F5", fg: "#424242" },
    icone: Target,
  },
  {
    chave: "Trabalho",
    slug: "trabalho",
    cor: "#E91E8C",
    badge: { bg: "#FCE4F3", fg: "#880050" },
    icone: Briefcase,
  },
  {
    chave: "Moradia",
    slug: "moradia",
    cor: "#FF6B00",
    badge: { bg: "#FFF0E0", fg: "#8B3000" },
    icone: House,
  },
  {
    chave: "Justiça",
    slug: "justica",
    cor: "#F4C2C2",
    badge: { bg: "#F4C2C2", fg: "#5C2A35" },
    icone: Scale,
  },
  {
    chave: "Direitos Humanos",
    slug: "direitos-humanos",
    cor: "#00838F",
    badge: { bg: "#00838F", fg: "#FFFFFF" },
    icone: Gavel,
  },
  {
    chave: "Lazer/Cultura",
    slug: "lazer-cultura",
    cor: "#D32F2F",
    badge: { bg: "#FFEBEE", fg: "#B71C1C" },
    icone: Palette,
  },
  {
    chave: "Outros",
    slug: "outros",
    cor: "#6D4C41",
    badge: { bg: "#EFEBE9", fg: "#4E342E" },
    icone: Ellipsis,
  },
] as const;

const AREA_FALLBACK: Area = {
  chave: "Outros",
  slug: "outros",
  cor: "#999999",
  badge: { bg: "#EFEBE9", fg: "#4E342E" },
  icone: Ellipsis,
};

const PORCHAVE = new Map<string, Area>(AREAS.map((a) => [a.chave, a]));
const PORSLUG = new Map<string, Area>(AREAS.map((a) => [a.slug, a]));

/** Documentos antigos podem trazer área vazia ou fora da lista. */
export function area(chave: string | undefined | null): Area {
  return (chave && PORCHAVE.get(chave)) || AREA_FALLBACK;
}

export function areaPorSlug(slug: string | undefined | null): Area | undefined {
  return slug ? PORSLUG.get(slug) : undefined;
}

export const CHAVES_AREA = AREAS.map((a) => a.chave);

/**
 * Opções do filtro "Público atendido".
 * Correspondem aos checkboxes do formulário de sugestão e ao `<select>` da
 * busca no site atual; o campo `publico` no Firestore guarda esses rótulos
 * separados por vírgula.
 */
export const PUBLICOS = [
  "Crianças",
  "Adolescentes/Jovens",
  "Adultos",
  "Idosos",
  "Famílias",
  "Mulheres em situação de violência",
  "População negra",
  "População indígena",
  "População LGBTQIAPN+",
  "Saúde Mental",
  "Pessoas em situação de calçada",
  "PCD",
  "Imigrantes e refugiados",
  "Público geral",
  "Usuários de substâncias",
] as const;
