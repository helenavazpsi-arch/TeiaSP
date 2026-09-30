/**
 * Textos fixos do site — créditos, "Sobre o projeto", contatos da equipe.
 *
 * Vem tudo do site atual, preservado palavra por palavra. Ficam aqui, e não
 * espalhados pelo JSX, porque é conteúdo que a equipe eventualmente revisa:
 * um arquivo só para editar em vez de caçar string dentro de componente.
 */

export const CREDITOS = {
  subtitulo: "Guia colaborativo de dispositivos de São Paulo",
  idealizacao: "Projeto idealizado e desenvolvido por:",
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
    crp: "Psicóloga e Redutora de Danos - CRP 06/213277",
    email: "barbara.albertini.psi@gmail.com",
    whatsapp: "5511993258403",
    whatsappFormatado: "(11) 99325-8403",
  },
] as const;

export const SOBRE = {
  titulo: "A Teia Invisível que Possibilita o Cuidado",
  paragrafos: [
    "Embaixo do chão, os fungos ficam escondidos, contando segredos e criando laços com as raízes das plantas. Os dois mantêm uma relação de milhões de anos, na qual as plantas fornecem aos fungos açúcares gerados pela fotossíntese e os fungos estendem suas extensas redes de filamentos microscópicos - conhecido pela biologia por hifas, para muito além do alcance das raízes das plantas, fazendo com que elas consigam absorver uma quantidade drasticamente maior de água e nutrientes minerais.",
    "Quando vários desses pequenos fios (hifas) se juntam, formando um emaranhado, cria-se o micélio, que é a estrutura principal e invisível do fungo que age como uma espécie de transporte de informações, como a internet.",
    "O Reino dos Fungos ou Reino Fungi é um dos grandes grupos de seres vivos da natureza e, embora essa categoria seja mais conhecida pelos cogumelos, o cogumelo que vemos na superfície é apenas uma partezinha (a reprodutiva) desse grande conjunto de hifas, que se ficam cobertas pelo solo.",
    "Os micélios constituem mais de 100 quatrilhões de quilômetros quadrados, formando uma infraestrutura natural gigantesca e invisível. Por meio deles, as plantas compartilham recursos, respondem a mudanças no ambiente e se fortalecem mutuamente. O que a princípio parece um conjunto de organismos isolados é, na realidade, uma grande rede de cooperação.",
    "Foi a partir desse emaranhado, que traçamos um paralelo entre a rede de cuidado da cidade e a rede invisível dos fungos. Assim como na natureza a vida não acontece de forma isolada, na rede de cuidado, isto é, saúde, assistência social, educação, cultura, lazer, trabalho, habitação e justiça também é preciso fazer conexões, trocas e estabelecer relações. A vida do território depende do contato entre as pessoas para as redes se tecerem.",
    "Percebemos uma fragmentação nas informações sobre os serviços e com isso, uma dificuldade em encontrá-las de forma organizada e integrada e imaginamos que talvez outras pessoas pudessem sentir o mesmo. Foi dessa compreensão que nasceu a Teia SP: um guia colaborativo que reúne dispositivos, equipamentos e iniciativas da cidade de São Paulo.",
    "Os dispositivos do site incluem várias áreas e foram divididos em categorias pensadas para facilitar as buscas, como: Sistema Único de Saúde (SUS), Saúde Mental, Sistema Único da Assistência Social (SUAS), Educação, Moradia, Trabalho, Benefícios e Programas, Lazer e Cultura, Justiça, Direitos Humanos e Outros. Além disso, colocamos os públicos-alvo, por exemplo: população LGBTQIAPN+, pessoas em situação de calçada, pessoas com deficiência etc.",
    "Um dos princípios fundamentais do SUS é a integralidade, o qual, por sua vez, considera o sujeito como um todo, atendendo a todas as suas necessidades. \"Para que isso seja possível, é importante a integração de ações, incluindo a promoção da saúde, a prevenção de doenças, o tratamento e a reabilitação. Juntamente, o princípio de integralidade pressupõe a articulação da saúde com outras políticas públicas, para assegurar uma atuação intersetorial entre as diferentes áreas que tenham repercussão na saúde e qualidade de vida dos indivíduos\" (MINISTÉRIO DA SAÚDE, 2026).",
    "Embora essa analogia seja bonita, sabemos que a construção da rede está longe de ser simples. Pelo contrário, trata-se de um processo profundamente complexo, atravessado simultaneamente por tensões, desafios, encontros e trocas. Em um contexto marcado pelo sucateamento das políticas públicas e dos serviços, torna-se cada vez mais necessário fortalecer, sustentar e articular essa rede, para que o cuidado possa continuar acontecendo de forma viva e efetiva.",
    "Assim como os micélios não são facilmente percebidos, grande parte do trabalho em rede também acontece de maneira silenciosa, apesar de muito trabalhosa, nos espaços entre uma instituição e outra, nos matriciamentos, nas trocas entre trabalhadores. Só assim se faz o cuidado. É nessa trama de relações que o cuidado circula. E talvez seja justamente por isso que uma rede de cuidado, assim como a rede dos fungos, não seja apenas um conjunto de pontos conectados, mas uma estrutura viva, em movimento, e claro, no coletivo, já que para tecer a teia é preciso de muitos fios.",
    "Elencamos a Luta Antimanicomial como exemplo para ilustrar como a rede exige a presença de um coletivo; usuário, família, trabalhador da saúde, espaços de convivência, cultura, território, lazer, trabalho. A Luta Antimanicomial faz parte de um cuidado intersetorial, territorial e que acontece justamente por estar em rede. Nosso projeto foi fundamentado em uma postura ética-política pautada no cuidado em liberdade como eixo central, alinhada aos princípios da luta antimanicomial e da redução de danos e riscos, dessa maneira, todos os dispositivos presentes neste site seguem essa lógica.",
    "Nosso projeto não tem como objetivo solucionar os desafios envolvidos na articulação dessa teia de cuidado. A proposta é contribuir para a reunião e organização de informações que possam fortalecer esse processo, facilitando o tecer da rede por meio do conhecimento sobre os serviços existentes e da compreensão dos espaços que podemos ocupar, construir e compartilhar.",
    "O site funciona por meio de três seções principais, descritas a seguir:",
    "• Buscar: onde é possível consultar as informações de cada dispositivo cadastrado, horários de funcionamento, contatos oficiais (sites e redes sociais) e filtrar por público atendido, frente de atuação ou utilizar a barra de pesquisa com palavras-chave.",
    "• Mapa: onde é possível visualizar a distribuição das unidades, referentes aos dispositivos cadastrados, no território de São Paulo.",
    "• Sugestão: onde é possível cadastrar novos dispositivos que ainda não estão no guia por meio de um formulário simples.",
    "A ideia do site é que todes possam contribuir acrescentando dispositivos que ainda não estejam cadastrados, ajudando a construir um mapa cada vez mais completo, atualizado e útil para todes. Tanto a rede de cuidado como a rede de vida dos fungos necessitam desses fios, emaranhados e teias para gerar e manter a vida, ou melhor, para promover e proteger a saúde através de vínculos e relações.",
  ],
  referencias: [
    {
      texto:
        "BRASIL. Ministério da Saúde. Sistema Único de Saúde (SUS). Disponível em: ",
      link: { rotulo: "https://www.gov.br/saude/pt-br/sus", url: "https://www.gov.br/saude/pt-br/sus" },
    },
    {
      texto: "BASAGLIA, Franco. A instituição negada: relato de um hospital psiquiátrico. Rio de Janeiro: Graal, 1985.",
    },
    {
      texto:
        "REVISTA AVENTURAS NA HISTÓRIA. Redes subterrâneas de fungos somam mais de 100 quatrilhões de quilômetros. Disponível em: ",
      link: {
        rotulo: "aventurasnahistoria.com.br",
        url: "https://aventurasnahistoria.com.br/noticias/historia-hoje/redes-subterraneas-de-fungos-somam-mais-de-100-quatrilhoes-de-quilometros.phtml",
      },
    },
    {
      texto: "SMITH, S. E.; READ, D. J. Mycorrhizal Symbiosis. 3. ed. London: Academic Press, 2008.",
    },
    {
      texto:
        "SOCIETY FOR THE PROTECTION OF UNDERGROUND NETWORKS (SPUN). A Hidden Infrastructure: Mapping the World's Underground Fungal Networks. Disponível em: ",
      link: { rotulo: "spun.earth", url: "https://www.spun.earth/mapping/a-hidden-infrastructure" },
    },
    {
      texto: "STAMETS, Paul. Mycelium Running: How Mushrooms Can Help Save the World. Berkeley: Ten Speed Press, 2005.",
    },
    {
      texto:
        "SUMAÚMA. A força do invisível que alimenta a vida visível das florestas: isto é micélio. Disponível em: ",
      link: { rotulo: "sumauma.com", url: "https://sumauma.com/a-forca-do-invisivel-que-alimenta-a-vida-visivel-das-florestas-isto-e-micelio/" },
    },
    {
      texto: "TODOS PELA EDUCAÇÃO. Financiamento da educação. Anuário Brasileiro da Educação Básica 2026. [S. l.]: Todos Pela Educação, 2026.",
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
