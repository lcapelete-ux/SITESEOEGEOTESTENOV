// Links do rodapé (site React e páginas estáticas). Arquivo leve, sem o catálogo.
export interface NavLink {
  slug: string;
  name: string;
}

export const FOOTER_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Produtos",
    links: [
      { slug: "produtos/mourao-de-eucalipto-tratado", name: "Mourões 2,20 m" },
      { slug: "produtos/esticador-de-eucalipto-tratado", name: "Esticadores 2,50 m" },
      { slug: "produtos/palanque-de-eucalipto-tratado", name: "Palanques 3,20 a 7 m" },
      { slug: "produtos/poste-de-eucalipto-tratado", name: "Postes 8 a 12 m" },
      { slug: "produtos/vara-de-eucalipto-tratado", name: "Varas" },
      { slug: "produtos/madeira-serrada-de-eucalipto", name: "Madeira serrada" },
      { slug: "produtos", name: "Todos os produtos" },
    ],
  },
  {
    title: "Guias",
    links: [
      { slug: "eucalipto-citriodora", name: "Eucalipto citriodora" },
      { slug: "tratamento-em-autoclave", name: "Tratamento em autoclave" },
      { slug: "norma-nbr-9480", name: "Norma NBR 9480" },
      { slug: "cerca-de-eucalipto-tratado", name: "Cerca de eucalipto" },
      { slug: "construcoes-com-eucalipto-tratado", name: "Construções com eucalipto" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { slug: "sobre-a-empresa", name: "Sobre a empresa" },
      { slug: "perguntas-frequentes", name: "Perguntas frequentes" },
      { slug: "contato", name: "Contato e orçamento" },
    ],
  },
];

/** Menu principal: o mesmo em todas as páginas (home React e páginas estáticas). */
export const HEADER_LINKS: NavLink[] = [
  { slug: "sobre-a-empresa", name: "Sobre" },
  { slug: "produtos", name: "Produtos" },
  { slug: "eucalipto-citriodora", name: "Citriodora" },
  { slug: "tratamento-em-autoclave", name: "Tratamento" },
  { slug: "norma-nbr-9480", name: "Normas" },
  { slug: "perguntas-frequentes", name: "Dúvidas" },
];
