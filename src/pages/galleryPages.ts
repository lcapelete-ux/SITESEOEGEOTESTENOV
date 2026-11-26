// Páginas do site que podem receber fotos da galeria (marcadas no painel).
// Usado pelo painel (caixinhas) e pelo build (seoPlugin.ts). Arquivo leve.
export interface GalleryPage {
  key: string; // valor gravado em gallery.pages no banco
  label: string; // nome da caixinha no painel
  slug: string; // página estática que mostra as fotos
  title: string; // título da seção de fotos na página
}

export const GALLERY_PAGES: GalleryPage[] = [
  { key: "mourao", label: "Mourões", slug: "produtos/mourao-de-eucalipto-tratado", title: "Cercas feitas com nossos mourões" },
  { key: "esticador", label: "Esticadores", slug: "produtos/esticador-de-eucalipto-tratado", title: "Esticadores instalados com nossa madeira" },
  { key: "palanque", label: "Palanques", slug: "produtos/palanque-de-eucalipto-tratado", title: "Obras com nossos palanques" },
  { key: "poste", label: "Postes", slug: "produtos/poste-de-eucalipto-tratado", title: "Obras com nossos postes" },
  { key: "vara", label: "Varas", slug: "produtos/vara-de-eucalipto-tratado", title: "Projetos com nossas varas" },
  { key: "serrada", label: "Madeira serrada", slug: "produtos/madeira-serrada-de-eucalipto", title: "Projetos com nossa madeira serrada" },
  { key: "cerca", label: "Cerca (guia)", slug: "cerca-de-eucalipto-tratado", title: "Cercas feitas com nossos mourões" },
  { key: "construcoes", label: "Construções (guia)", slug: "construcoes-com-eucalipto-tratado", title: "Construções com nossa madeira" },
];
