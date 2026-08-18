/**
 * Textos fixos do site — créditos, "Sobre o projeto", contatos da equipe.
 *
 * Vem tudo do site atual, preservado palavra por palavra. Ficam aqui, e não
 * espalhados pelo JSX, porque é conteúdo que a equipe eventualmente revisa:
 * um arquivo só para editar em vez de caçar string dentro de componente.
 */

export const CREDITOS = {
  subtitulo: "Guia colaborativo de dispositivos de São Paulo",
  idealizacao: "Projeto idealizado e desenvolvido pelas psicólogas:",
  logo: "Logo e composição visual do cabeçalho: Lilla Cirenza Lescher",
  arte: {
    rotulo: "Arte - Corpo do site:",
    nome: "@mun_dopurpura",
    url: "https://www.instagram.com/mun_dopurpura?igsh=MTM4NTV5Y2wxOW50YQ==",
  },
  direitos: "© Direitos autorais reservados",
} as const;

export interface Contato {
  id: string;
  nome: string;
  crp: string;
  email: string;
  /** número com código do país, para o link do WhatsApp */
  whatsapp: string;
  whatsappFormatado: string;
}

export const EQUIPE: readonly Contato[] = [
  {
    id: "helena",
    nome: "Helena Ricioli Vaz Gonçalves",
    crp: "Psicóloga - CRP 06/229680",
    email: "helenavaz.psi@gmail.com",
    whatsapp: "5511913290464",
    whatsappFormatado: "(11) 91329-0464",
  },
  {
    id: "barbara",
    nome: "Bárbara Albertini Silva",
    crp: "Psicóloga - CRP 06/213277",
    email: "barbara.albertini.psi@gmail.com",
    whatsapp: "5511993258403",
    whatsappFormatado: "(11) 99325-8403",
  },
] as const;

export const SOBRE = {
  titulo: "A Teia Invisível que Possibilita o Cuidado",
  paragrafos: [
    "Os fungos são organismos vivos que formam um reino próprio da natureza. Embora muitos sejam conhecidos pelos cogumelos, a maior parte dos fungos vive escondida sob o solo, formando uma extensa rede de filamentos microscópicos. Essa rede conecta as raízes das plantas, transportando água, nutrientes e informações, fortalecendo os ecossistemas e tornando a vida mais resiliente.",
    "Essas redes subterrâneas somam mais de 100 quatrilhões de quilômetros, constituindo uma verdadeira infraestrutura natural invisível. Por meio delas, as plantas compartilham recursos, respondem a mudanças no ambiente e se fortalecem mutuamente.",
    "O que parece um conjunto de organismos isolados é, na realidade, uma grande rede de cooperação.",
    "Foi dessa compreensão que nasceu a Teia SP. A partir desse emaranhado, pensamos em olhar para a cidade de forma semelhante. Assim como os fungos conectam diferentes seres vivos, uma cidade também depende do contato entre pessoas para criar as redes e garantir acessibilidades. Saúde, assistência social, educação, cultura, trabalho, habitação e justiça não funcionam de maneira isolada: quando esses serviços estão articulados, fortalecem a proteção social e ampliam o acesso aos direitos.",
    "A Teia SP é fruto da percepção de uma dificuldade concreta enfrentada pela população: a fragmentação da rede de serviços e a dificuldade de encontrar informações de forma organizada e integrada.",
    "Somos um guia colaborativo que reúne dispositivos, equipamentos e iniciativas da cidade de São Paulo e contamos com você para contribuir acrescentando dispositivos que ainda não estejam cadastrados, ajudando a construir um mapa cada vez mais completo, atualizado e útil para toda a comunidade.",
  ],
  referencias: [
    {
      texto:
        "Society for the Protection of Underground Networks (SPUN). A Hidden Infrastructure: Mapping the World's Underground Fungal Networks. Disponível em: ",
      link: { rotulo: "spun.earth", url: "https://spun.earth" },
    },
    {
      texto:
        "Revista Aventuras na História. Redes subterrâneas de fungos somam mais de 100 quatrilhões de quilômetros. Disponível em: ",
      link: {
        rotulo: "aventurasnahistoria.com.br",
        url: "https://aventurasnahistoria.com.br",
      },
    },
    {
      texto:
        "Smith, S. E.; Read, D. J. Mycorrhizal Symbiosis. 3. ed. London: Academic Press, 2008.",
    },
    {
      texto:
        "Paul Stamets. Mycelium Running: How Mushrooms Can Help Save the World. Berkeley: Ten Speed Press, 2005.",
    },
  ],
} as const;

/** Seções da navegação — abas no site antigo, rotas de verdade agora. */
export const SECOES = [
  {
    href: "/",
    rotulo: "Buscar",
    descricao: "Dispositivos, equipamentos e benefícios",
    icone: "busca",
  },
  {
    href: "/mapa",
    rotulo: "Mapa",
    descricao: "Localizar unidades em São Paulo",
    icone: "mapa",
  },
  {
    href: "/sugerir",
    rotulo: "Sugestões",
    descricao: "Contribuir com novos dispositivos",
    icone: "sugerir",
  },
  {
    href: "/admin",
    rotulo: "Área restrita",
    descricao: "Aprovação da equipe",
    icone: "admin",
  },
] as const;
