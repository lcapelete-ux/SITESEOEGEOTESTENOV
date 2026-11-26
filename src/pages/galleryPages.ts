// Páginas do site que podem receber fotos da galeria (marcadas no painel).
// Usado pelo painel (caixinhas) e pelo build (seoPlugin.ts). Arquivo leve.
export interface GalleryPage {
  key: string; // valor gravado em gallery.pages no banco
  label: string; // nome da caixinha no painel
  slug: string; // página estática que mostra as fotos
  title: string; // título da seção de fotos na página
  altBase: string; // descrição usada quando a foto não tem descrição no painel
}

export const GALLERY_PAGES: GalleryPage[] = [
  { key: "mourao", label: "Mourões", slug: "produtos/mourao-de-eucalipto-tratado", title: "Cercas feitas com nossos mourões", altBase: "Obra rural com mourões de eucalipto citriodora tratado" },
  { key: "esticador", label: "Esticadores", slug: "produtos/esticador-de-eucalipto-tratado", title: "Esticadores instalados com nossa madeira", altBase: "Esticador de eucalipto citriodora tratado instalado" },
  { key: "palanque", label: "Palanques", slug: "produtos/palanque-de-eucalipto-tratado", title: "Obras com nossos palanques", altBase: "Obra com palanques de eucalipto citriodora tratado" },
  { key: "poste", label: "Postes", slug: "produtos/poste-de-eucalipto-tratado", title: "Obras com nossos postes", altBase: "Obra com postes de eucalipto citriodora tratado" },
  { key: "vara", label: "Varas", slug: "produtos/vara-de-eucalipto-tratado", title: "Projetos com nossas varas", altBase: "Projeto com varas de eucalipto tratado" },
  { key: "serrada", label: "Madeira serrada", slug: "produtos/madeira-serrada-de-eucalipto", title: "Projetos com nossa madeira serrada", altBase: "Projeto com madeira serrada de eucalipto tratado" },
  { key: "cerca", label: "Cerca (guia)", slug: "cerca-de-eucalipto-tratado", title: "Cercas feitas com nossos mourões", altBase: "Cerca rural com mourões de eucalipto tratado" },
 { key: "norma", label: "Normas (NBR 9480)", slug: "norma-nbr-9480", title: "Medição pelo topo na prática", altBase: "Medição de poste de eucalipto tratado" },
  { key: "sobre", label: "Sobre a empresa", slug: "sobre-a-empresa", title: "Da nossa madeira até a entrega", altBase: "Madeira e entrega da Eucalyptus Tratados" },
  { key: "contato", label: "Contato", slug: "contato", title: "Madeira carregada e pronta para entrega", altBase: "Carga de eucalipto tratado da Eucalyptus Tratados" },
  { key: "construcoes", label: "Construções (guia)", slug: "construcoes-com-eucalipto-tratado", title: "Construções com nossa madeira", altBase: "Construção com eucalipto citriodora tratado" },
];
