// Páginas estáticas do site (geradas em HTML puro no build, ótimas para Google e IAs).
// Cada página mira uma busca específica. Edite os textos aqui.
import { catalogData, type CatalogCategory } from "../catalogData";
import { BUSINESS as B } from "../seoContent";

export interface PageFaq {
  q: string;
  a: string;
}

export interface SitePage {
  slug: string; // sem barras, ex.: "produtos/mourao-de-eucalipto-tratado"
  title: string; // <title> (até ~60 caracteres)
  description: string; // meta description (até ~155 caracteres)
  h1: string;
  intro: string; // parágrafo de abertura, responde direto à busca
  body: string; // HTML do conteúdo
  faq?: PageFaq[];
  parent?: { name: string; slug: string };
  product?: { name: string; category: string };
  whatsappText: string;
  related: string[]; // slugs de páginas relacionadas
  nav: string; // nome curto usado em links e no rodapé
  updated?: string; // AAAA-MM-DD da última revisão real do conteúdo (sitemap e schema)
  video?: PageVideo; // vídeo da página (arquivos em public/videos)
}

export interface PageVideo {
  file: string; // ex.: "videos/tratamento-em-autoclave.mp4" (dentro de public/)
  poster: string; // imagem de capa (dentro de public/)
  title: string;
  description: string;
  seconds: number; // duração
  uploadDate: string; // AAAA-MM-DD
  heading: string; // título da seção
  chapters: { time: string; title: string; text: string }[]; // passo a passo em texto (acessibilidade e SEO)
}

const wa = (text: string) => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(text)}`;
export const whatsappLink = wa;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Tabela de medidas a partir do catálogo, sem repetir nome nem comprimento. */
const PRODUTO_PALAVRAS = /^(mourão|mourao|esticador|palanque|poste|vara)\s+/i;
const nf = (n: number) => n.toLocaleString("pt-BR");
const NOTA_MEDIDAS = `<p class="nota">O diâmetro é medido na ponta (topo) da peça, conforme a ABNT NBR 9480; a base é naturalmente mais grossa. Pesos aproximados em kg por peça, variam com a umidade da madeira. "—" indica medida não fabricada.</p>`;

function sizeTable(categoryTitle: string): string {
  const cat = catalogData.find((c: CatalogCategory) => c.title.startsWith(categoryTitle));
  if (!cat) throw new Error(`Categoria não encontrada no catálogo: ${categoryTitle}`);
  type Linha = { tipo: string; comp: number | null; d1: number | null; d2: number | null; kg: number | null };
  const linhas: Linha[] = cat.items.map((item) => {
    const m = item.name.match(/^(.*?)\s*(?:(\d+(?:,\d+)?)\s*m?\s*)?\((\d+)\s*a\s*(\d+)\)\s*$/);
    const semDiametro = item.name.match(/^(.*?)\s*(\d+(?:,\d+)?)\s*m\s*$/);
    const kgNum = parseFloat(item.weight.replace("kg", ""));
    const kg = kgNum > 0 ? kgNum : null;
    if (m) {
      const tipo = m[1].replace(PRODUTO_PALAVRAS, "").replace(/\b[A-ZÁÂÃÉÊÍÓÔÕÚÇ]{2,}\b/g, (w) => w[0] + w.slice(1).toLowerCase()).trim();
      return { tipo, comp: m[2] ? parseFloat(m[2].replace(",", ".")) : null, d1: +m[3], d2: +m[4], kg };
    }
    return { tipo: (semDiametro ? semDiametro[1] : item.name).trim(), comp: null, d1: null, d2: null, kg };
  });
  const comprimentos = [...new Set(linhas.map((l) => l.comp).filter((c): c is number => c !== null))].sort((x, y) => x - y);
  const caption = `${esc(cat.title)}: diâmetro no topo e peso aproximado`;
  const wrap = (t: string) => `<div class="tabela-wrap" tabindex="0" role="region" aria-label="Tabela de medidas (role para os lados no celular)">${t}</div>`;

  // Vários comprimentos: matriz diâmetro (linhas) x comprimento (colunas), peso no cruzamento.
  if (comprimentos.length >= 2) {
    const faixas = [...new Map(linhas.filter((l) => l.d1 !== null).map((l) => [`${l.d1}-${l.d2}`, l])).values()].sort((x, y) => x.d1! - y.d1!);
    const peso = new Map(linhas.filter((l) => l.d1 !== null && l.comp !== null).map((l) => [`${l.d1}-${l.d2}|${l.comp}`, l.kg]));
    const cab = comprimentos.map((c) => `<th scope="col">${String(c).replace(".", ",").replace(/^(\d+),(\d)$/, "$1,$20")}m</th>`).join("");
    const corpo = faixas
      .map((f) => `<tr><th scope="row">${f.d1} a ${f.d2} cm</th>${comprimentos.map((c) => { const k = peso.get(`${f.d1}-${f.d2}|${c}`); return `<td>${k ? nf(k) : "—"}</td>`; }).join("")}</tr>`)
      .join("");
    return `${wrap(`<table class="tabela-matriz"><caption>${caption} (kg), por comprimento</caption>
<thead><tr><th scope="col">Diâmetro no topo</th>${cab}</tr></thead>
<tbody>${corpo}</tbody></table>`)}
${NOTA_MEDIDAS}
<p>Não achou a medida que procura? <a href="{{WA}}">Fale com a gente pelo WhatsApp</a>.</p>`;
  }

  // Um comprimento só: tabela curta com diâmetro, tipo e peso.
  const ordenadas = [...linhas].sort((x, y) => (x.d1 ?? 1e9) - (y.d1 ?? 1e9));
  const corpo = ordenadas
    .map((l) => `<tr><th scope="row">${l.d1 !== null ? `${l.d1} a ${l.d2} cm` : "—"}</th><td>${esc(l.tipo)}</td><td>${l.kg ? nf(l.kg) : "—"}</td></tr>`)
    .join("");
  return `${wrap(`<table><caption>${caption} (kg)</caption>
<thead><tr><th scope="col">Diâmetro no topo</th><th scope="col">Tipo</th><th scope="col">Peso (kg)</th></tr></thead>
<tbody>${corpo}</tbody></table>`)}
${NOTA_MEDIDAS}
<p>Não achou a medida que procura? <a href="{{WA}}">Fale com a gente pelo WhatsApp</a>.</p>`;
}

const porQueCitriodora = `<h2>Por que eucalipto citriodora?</h2>
<ul>
<li><strong>Praticamente não racha:</strong> as fibras retorcidas do citriodora seguram a madeira. Ele nem precisa de chapinhas metálicas anti-rachadura.</li>
<li><strong>Densidade alta:</strong> madeira mais pesada e resistente, que suporta cargas altas e impactos.</li>
<li><strong>Absorve bem o tratamento:</strong> o preservativo CCA penetra no alburno e protege contra cupins, fungos e apodrecimento.</li>
<li><strong>10 anos de garantia</strong> e durabilidade superior a 20 a 30 anos em contato com o solo.</li>
<li><strong>Laudo de retenção de CCA emitido pelo IPT</strong> (<a href="{{tratamento-em-autoclave}}#laudo">veja o laudo</a>).</li>
</ul>
<p>Saiba mais em <a href="{{eucalipto-citriodora}}">por que trabalhamos só com eucalipto citriodora</a> e em <a href="{{tratamento-em-autoclave}}">como é o tratamento em autoclave</a>.</p>`;

const comoMedimos = `<h2>Como medimos as peças</h2>
<p>Seguimos a <a href="{{norma-nbr-9480}}">norma ABNT NBR 9480</a>: a medida de venda é o <strong>diâmetro do topo</strong>, a ponta mais fina. Um mourão "10 a 12" tem entre 10 e 12 cm na ponta, e a base é ainda mais grossa. Assim você compra pela medida mínima garantida, sem surpresa na entrega.</p>`;

export const PAGES: SitePage[] = [
  // ───────────────────────── PRODUTOS ─────────────────────────
  {
    slug: "produtos",
    nav: "Todos os produtos",
    title: "Produtos de Eucalipto Tratado | Postes, Mourões e Palanques",
    description:
      "Catálogo de eucalipto citriodora tratado em autoclave: mourões, esticadores, palanques, postes, varas e madeira serrada, com medidas e pesos.",
    h1: "Produtos de eucalipto citriodora tratado",
    intro:
      "Todas as peças são de eucalipto citriodora, tratadas em autoclave com CCA conforme a ABNT NBR 9480 e com 10 anos de garantia. Escolha a linha abaixo para ver medidas, pesos e aplicações.",
    body: `<div class="cards">
<a class="card" href="{{produtos/mourao-de-eucalipto-tratado}}"><h2>Mourões (2,20 m)</h2><p>Para a linha da cerca rural. Do refugo ao super grosso, além de lasca.</p></a>
<a class="card" href="{{produtos/esticador-de-eucalipto-tratado}}"><h2>Esticadores (2,50 m)</h2><p>Para cantos, porteiras e pontos de tensão do arame. De 10 a 32 cm.</p></a>
<a class="card" href="{{produtos/palanque-de-eucalipto-tratado}}"><h2>Palanques (3,20 m a 7 m)</h2><p>Currais, mangueiras, porteiras, galpões e estruturas rurais.</p></a>
<a class="card" href="{{produtos/poste-de-eucalipto-tratado}}"><h2>Postes (8 m a 12 m)</h2><p>Galpões, coberturas, barracões e estruturas de grande carga.</p></a>
<a class="card" href="{{produtos/vara-de-eucalipto-tratado}}"><h2>Varas (2,50 m a 8 m)</h2><p>Peças finas para pergolados, cercas leves, paisagismo e cultivo.</p></a>
<a class="card" href="{{produtos/madeira-serrada-de-eucalipto}}"><h2>Madeira serrada e outros</h2><p>Caibro, viga, prancha, ripa, ripão, balancim e esteira de bambu.</p></a>
</div>
${porQueCitriodora}
${comoMedimos}`,
    whatsappText: "Olá! Gostaria de um orçamento de eucalipto tratado.",
    related: ["cerca-de-eucalipto-tratado", "construcoes-com-eucalipto-tratado", "perguntas-frequentes"],
  },
  {
    slug: "produtos/mourao-de-eucalipto-tratado",
    nav: "Mourões",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Mourão de eucalipto citriodora tratado 2,20 m", category: "Mourões" },
    title: "Mourão de Eucalipto Tratado 2,20 m | Citriodora | Para Cerca",
    description:
      "Mourão de eucalipto citriodora tratado em autoclave, 2,20 m, do fino ao super grosso. Ideal para cerca rural, praticamente não racha e tem 10 anos de garantia.",
    h1: "Mourão de eucalipto tratado para cerca (2,20 m)",
    intro:
      "O mourão de eucalipto citriodora tratado tem 2,20 m e forma a linha da cerca rural. Vendemos do refugo (4 a 6 cm) ao super grosso (12 a 14 cm), além de lasca, todos tratados em autoclave com CCA e com 10 anos de garantia.",
    body: `${sizeTable("Mourões")}
<h2>Qual mourão escolher?</h2>
<ul>
<li><strong>Fino (6 a 8 cm) e médio (8 a 10 cm):</strong> cercas de arame liso ou farpado para divisa e pastagem de menor pressão.</li>
<li><strong>Grosso (10 a 12 cm) e super grosso (12 a 14 cm):</strong> cercas para gado de maior porte, áreas com mais pressão dos animais e cercas que precisam durar mais com menos manutenção.</li>
<li><strong>Refugo (4 a 6 cm):</strong> uso leve, como hortas, jardins e cercas provisórias.</li>
<li><strong>Lasca:</strong> peça rachada, econômica para cercas de menor exigência.</li>
</ul>
<p>Nos cantos, porteiras e trechos de tensão use <a href="{{produtos/esticador-de-eucalipto-tratado}}">esticadores de 2,50 m</a>. Veja o passo a passo em <a href="{{cerca-de-eucalipto-tratado}}">como montar cerca de eucalipto tratado</a>.</p>
${porQueCitriodora}
${comoMedimos}`,
    faq: [
      {
        q: "Qual o tamanho do mourão de eucalipto para cerca?",
        a: "O mourão padrão tem 2,20 m de comprimento. Cerca de 50 a 60 cm ficam enterrados e o restante forma a altura da cerca. O diâmetro varia de 4 a 14 cm no topo, conforme a aplicação.",
      },
      {
        q: "Quanto dura um mourão de eucalipto tratado?",
        a: "Em contato com o solo, o mourão de eucalipto citriodora tratado em autoclave tem durabilidade superior a 20 a 30 anos, e damos 10 anos de garantia. O citriodora praticamente não racha e o tratamento com CCA protege contra cupins e apodrecimento, mesmo na parte enterrada.",
      },
    ],
    whatsappText: "Olá! Gostaria de um orçamento de mourão de eucalipto tratado 2,20 m.",
    related: ["produtos/esticador-de-eucalipto-tratado", "cerca-de-eucalipto-tratado", "norma-nbr-9480"],
  },
  {
    slug: "produtos/esticador-de-eucalipto-tratado",
    nav: "Esticadores",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Esticador de eucalipto citriodora tratado 2,50 m", category: "Esticadores" },
    title: "Esticador de Eucalipto Tratado 2,50 m | Citriodora",
    description:
      "Esticador de eucalipto citriodora tratado em autoclave, 2,50 m, de 10 a 32 cm de diâmetro. Para cantos, porteiras e tensão de cercas. 10 anos de garantia.",
    h1: "Esticador de eucalipto tratado (2,50 m)",
    intro:
      "O esticador é a peça mais grossa da cerca: tem 2,50 m e fica nos cantos, porteiras e pontos onde o arame é tensionado. Trabalhamos de 10 a 32 cm de diâmetro no topo, em eucalipto citriodora tratado em autoclave.",
    body: `${sizeTable("Esticadores")}
<h2>Onde usar esticador</h2>
<ul>
<li><strong>Cantos da cerca:</strong> recebem a força do arame em duas direções.</li>
<li><strong>Porteiras e colchetes:</strong> sustentam o peso e o movimento do portão.</li>
<li><strong>Trechos retos longos:</strong> pontos intermediários para esticar o arame.</li>
</ul>
<p>Por ser o ponto que mais sofre esforço, o esticador precisa de madeira densa que não rache. É exatamente onde o citriodora faz diferença. Para a linha da cerca, use <a href="{{produtos/mourao-de-eucalipto-tratado}}">mourões de 2,20 m</a>.</p>
${porQueCitriodora}
${comoMedimos}`,
    faq: [
      {
        q: "Qual a diferença entre mourão e esticador?",
        a: "O mourão tem 2,20 m e forma a linha da cerca. O esticador tem 2,50 m, é mais grosso e fica nos cantos, porteiras e pontos de tensão, onde o arame faz mais força.",
      },
    ],
    whatsappText: "Olá! Gostaria de um orçamento de esticador de eucalipto tratado 2,50 m.",
    related: ["produtos/mourao-de-eucalipto-tratado", "cerca-de-eucalipto-tratado", "produtos/palanque-de-eucalipto-tratado"],
  },
  {
    slug: "produtos/palanque-de-eucalipto-tratado",
    nav: "Palanques",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Palanque de eucalipto citriodora tratado 3,20 m a 7 m", category: "Palanques" },
    title: "Palanque de Eucalipto Tratado 3,20 m a 7 m | Citriodora",
    description:
      "Palanques de eucalipto citriodora tratado de 3,20 m, 4 m, 5 m, 6 m e 7 m, com 10 a 32 cm de diâmetro. Para currais, porteiras e galpões. 10 anos de garantia.",
    h1: "Palanque de eucalipto tratado (3,20 m a 7 m)",
    intro:
      "Palanques são peças longas e grossas para estruturas rurais: currais, mangueiras, embarcadouros, porteiras e galpões. Temos de 3,20 m a 7 m, com 10 a 32 cm de diâmetro no topo, em eucalipto citriodora tratado em autoclave.",
    body: `${sizeTable("Palanques")}
<h2>Aplicações do palanque</h2>
<ul>
<li><strong>3,20 m:</strong> currais, mangueiras e porteiras de grande porte.</li>
<li><strong>4 m e 5 m:</strong> estruturas de curral mais altas, troncos, embarcadouros e esteios de galpão.</li>
<li><strong>6 m e 7 m:</strong> esteios de galpões, barracões, coberturas e estruturas elevadas.</li>
</ul>
<p>Em currais o palanque recebe impacto direto dos animais. A densidade alta do citriodora e o fato de ele praticamente não rachar garantem segurança e durabilidade. Para alturas acima de 7 m, veja os <a href="{{produtos/poste-de-eucalipto-tratado}}">postes de 8 m a 12 m</a>.</p>
${porQueCitriodora}
${comoMedimos}`,
    whatsappText: "Olá! Gostaria de um orçamento de palanque de eucalipto tratado.",
    related: ["produtos/poste-de-eucalipto-tratado", "construcoes-com-eucalipto-tratado", "produtos/esticador-de-eucalipto-tratado"],
  },
  {
    slug: "produtos/poste-de-eucalipto-tratado",
    nav: "Postes",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Poste de eucalipto citriodora tratado 8 m a 12 m", category: "Postes" },
    title: "Poste de Eucalipto Tratado 8 a 12 m | Citriodora | NBR 9480",
    description:
      "Postes de eucalipto citriodora tratado em autoclave de 8, 9, 10, 11 e 12 m, até 32 cm de diâmetro. Para galpões e coberturas. NBR 9480, 10 anos de garantia.",
    h1: "Poste de eucalipto tratado (8 m a 12 m)",
    intro:
      "Os postes de eucalipto citriodora tratado são indicados para galpões, barracões, coberturas, quiosques e estruturas que suportam cargas altas. Temos de 8 m a 12 m, com 10 a 32 cm de diâmetro no topo, tratados em autoclave com CCA conforme a ABNT NBR 9480.",
    body: `${sizeTable("Postes")}
<h2>Por que citriodora em postes</h2>
<p>Em peças longas, a tendência a rachar e a resistência mecânica fazem toda a diferença. O citriodora tem densidade alta e fibras retorcidas, por isso suporta cargas altas e praticamente não racha, ao contrário de outras espécies de eucalipto. Um poste que racha perde resistência e deixa o tratamento exposto. Com o citriodora, esse risco é mínimo.</p>
<h2>Aplicações</h2>
<ul>
<li>Esteios de galpões, barracões e armazéns</li>
<li>Coberturas, quiosques e áreas de lazer</li>
<li>Estruturas rurais elevadas e construção civil</li>
</ul>
<p>Veja ideias e cuidados de instalação em <a href="{{construcoes-com-eucalipto-tratado}}">construções com eucalipto tratado</a>.</p>
${porQueCitriodora}
${comoMedimos}`,
    faq: [
      {
        q: "Qual o tamanho de poste de eucalipto para galpão?",
        a: "Depende da altura do pé-direito e da carga do telhado. Lembre que parte do poste fica enterrada. Para galpões rurais é comum usar postes de 6 m a 8 m; estruturas mais altas pedem postes de 9 m a 12 m. Envie o projeto pelo WhatsApp e indicamos a medida certa.",
      },
    ],
    whatsappText: "Olá! Gostaria de um orçamento de poste de eucalipto tratado.",
    related: ["produtos/palanque-de-eucalipto-tratado", "construcoes-com-eucalipto-tratado", "norma-nbr-9480"],
  },
  {
    slug: "produtos/vara-de-eucalipto-tratado",
    nav: "Varas",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Vara de eucalipto tratado 2,50 m a 8 m", category: "Varas" },
    title: "Vara de Eucalipto Tratado 2,50 m a 8 m | Pergolado e Cerca",
    description:
      "Varas de eucalipto tratado em autoclave de 2,50 m a 8 m, com 4 a 12 cm de diâmetro. Para pergolados, cercas leves, paisagismo e cultivo. Peça orçamento.",
    h1: "Vara de eucalipto tratado (2,50 m a 8 m)",
    intro:
      "Varas são peças roliças finas, de 4 a 12 cm de diâmetro no topo e 2,50 m a 8 m de comprimento. São tratadas em autoclave e ideais para pergolados, cercas leves, caramanchões, paisagismo e apoio de cultivos.",
    body: `${sizeTable("Varas")}
<h2>Aplicações das varas</h2>
<ul>
<li>Pergolados, caramanchões e coberturas leves</li>
<li>Cercas leves, cercados de horta e jardim</li>
<li>Paisagismo, bioconstrução e decoração</li>
<li>Apoio e tutoramento de cultivos</li>
</ul>
<p>Para estruturas que recebem carga, prefira <a href="{{produtos/palanque-de-eucalipto-tratado}}">palanques</a> ou <a href="{{produtos/poste-de-eucalipto-tratado}}">postes</a>.</p>
${comoMedimos}`,
    whatsappText: "Olá! Gostaria de um orçamento de vara de eucalipto tratado.",
    related: ["construcoes-com-eucalipto-tratado", "produtos/madeira-serrada-de-eucalipto", "produtos"],
  },
  {
    slug: "produtos/madeira-serrada-de-eucalipto",
    nav: "Madeira serrada",
    parent: { name: "Produtos", slug: "produtos" },
    product: { name: "Madeira serrada de eucalipto tratado", category: "Madeira serrada" },
    title: "Madeira Serrada de Eucalipto Tratado | Caibro, Viga, Prancha",
    description:
      "Madeira serrada de eucalipto tratado: caibro 5x5, caibrão 5x7, terça 5x11, viga 5x15, pranchas 5x20 a 5x30 e ripa. Também ripão, balancim e esteira de bambu.",
    h1: "Madeira serrada de eucalipto tratado",
    intro:
      "Além das peças roliças, fornecemos madeira serrada de eucalipto tratado vendida por metro: caibro, caibrão, terça, viga, pranchas e ripa. Também temos ripão, balancim de 1,20 m, birira e esteira de bambu tratado.",
    body: `<h2>Madeira serrada (vendida por metro)</h2>
<div class="tabela-wrap" tabindex="0" role="region" aria-label="Tabela de medidas (role para os lados no celular)"><table><caption>Bitolas disponíveis (em cm)</caption>
<thead><tr><th scope="col">Peça</th><th scope="col">Bitola</th><th scope="col">Uso comum</th></tr></thead>
<tbody>
<tr><td>Ripa</td><td>2,5 x 5</td><td>Telhados e acabamentos</td></tr>
<tr><td>Caibro</td><td>5 x 5</td><td>Estrutura de telhado</td></tr>
<tr><td>Caibrão</td><td>5 x 7</td><td>Estrutura de telhado com vãos maiores</td></tr>
<tr><td>Terça</td><td>5 x 11</td><td>Apoio de caibros e telhados</td></tr>
<tr><td>Viga</td><td>5 x 15</td><td>Vigamentos e estruturas</td></tr>
<tr><td>Prancha</td><td>5 x 20, 5 x 25 e 5 x 30</td><td>Decks, bancos, mesas e estruturas</td></tr>
</tbody></table></div>
<h2>Ripão, balancim e outros</h2>
<ul>
<li><strong>Ripão citriodora 3 x 15</strong> (por metro): fechamentos, cercas e acabamentos.</li>
<li><strong>Ripão 3 x 10, 3 x 12, 3 x 15 e 3 x 20</strong> (por metro).</li>
<li><strong>Balancim 1,20 m:</strong> espaçador de arame em cercas.</li>
<li><strong>Birira (2 a 4 cm)</strong> por metro linear.</li>
<li><strong>Esteira de bambu tratado 1 x 1,50 m:</strong> sombreamento e paisagismo.</li>
</ul>`,
    whatsappText: "Olá! Gostaria de um orçamento de madeira serrada de eucalipto tratado.",
    related: ["construcoes-com-eucalipto-tratado", "produtos/vara-de-eucalipto-tratado", "produtos"],
  },

  // ───────────────────────── CONTEÚDO TÉCNICO ─────────────────────────
  {
    slug: "eucalipto-citriodora",
    nav: "Eucalipto citriodora",
    title: "Eucalipto Citriodora: a Melhor Espécie para Madeira Tratada",
    description:
      "Por que o eucalipto citriodora é a melhor espécie para postes e mourões: praticamente não racha, tem densidade alta e suporta altas cargas. Compare com outros eucaliptos.",
    h1: "Eucalipto citriodora: por que é a melhor espécie para madeira tratada",
    intro:
      "O eucalipto citriodora (Corymbia citriodora, antes chamado Eucalyptus citriodora) é a espécie de eucalipto que praticamente não racha, tem densidade alta e suporta cargas altas. Por isso é a escolha mais segura para postes, mourões e estruturas expostas ao tempo, e é a única espécie que usamos nas peças roliças.",
    body: `<h2>O que torna o citriodora diferente</h2>
<ul>
<li><strong>Fibras retorcidas:</strong> as fibras entrelaçadas seguram a madeira, que praticamente não racha durante a secagem e o uso.</li>
<li><strong>Densidade alta:</strong> madeira pesada e dura, com resistência mecânica superior. Suporta cargas altas e impactos de animais.</li>
<li><strong>Boa absorção do CCA:</strong> o alburno recebe bem o preservativo no tratamento em autoclave.</li>
<li><strong>Uso externo:</strong> ideal para peças em contato com o solo e expostas a sol e chuva.</li>
</ul>
<h2>Citriodora x outros eucaliptos</h2>
<div class="tabela-wrap" tabindex="0" role="region" aria-label="Tabela de medidas (role para os lados no celular)"><table><caption>Comparação geral entre espécies usadas em madeira tratada</caption>
<thead><tr><th scope="col">Característica</th><th scope="col">Citriodora</th><th scope="col">Espécies de crescimento rápido (grandis, urograndis, saligna)</th></tr></thead>
<tbody>
<tr><td>Tendência a rachar</td><td>Praticamente não racha, nem precisa de chapas anti-rachadura</td><td>Maior, principalmente em peças grossas. A cloeziana é a espécie que mais racha, na nossa experiência.</td></tr>
<tr><td>Densidade</td><td>Alta</td><td>Menor</td></tr>
<tr><td>Resistência a cargas</td><td>Alta</td><td>Menor</td></tr>
<tr><td>Indicação</td><td>Postes, esticadores, currais e estruturas</td><td>Usos mais leves</td></tr>
</tbody></table></div>
<p>Rachaduras não são só estética: uma trinca profunda expõe o cerne não tratado e abre caminho para fungos e cupins. Entre as espécies que comparamos (grandis, urograndis, saligna e cloeziana), a cloeziana é a que mais racha na nossa experiência. Na nossa experiência, ela também pesa cerca de 3 vezes menos que o citriodora e é bem mais fraca. Escolher a espécie certa protege o investimento.</p>
<p>Muita gente tenta resolver o rachamento com chapinhas metálicas anti-rachadura. Na nossa experiência, elas não resolvem. O citriodora não precisa delas. Veja como isso aparece na prática em <a href="{{cerca-de-eucalipto-tratado}}">cerca de eucalipto tratado</a>.</p>
<h2>Como reconhecer</h2>
<p>A árvore de citriodora tem casca lisa, que se solta em placas, e folhas com aroma cítrico forte, de onde vem o nome. Na madeira tratada, a densidade se percebe no peso: uma peça de citriodora pesa mais que outra do mesmo tamanho de espécie mais leve.</p>
<p>Veja também <a href="{{tratamento-em-autoclave}}">como funciona o tratamento em autoclave</a> e <a href="{{produtos}}">todos os produtos em citriodora</a>.</p>`,
    faq: [
      {
        q: "Eucalipto citriodora é o mesmo que Corymbia citriodora?",
        a: "Sim. A espécie era chamada Eucalyptus citriodora e foi reclassificada no gênero Corymbia. No mercado brasileiro continua conhecida como eucalipto citriodora.",
      },
      {
        q: "Vale a pena pagar mais pelo citriodora?",
        a: "Para peças que recebem carga ou ficam enterradas, sim. O citriodora praticamente não racha e é mais resistente, então a cerca ou estrutura dura mais e precisa de menos troca de peças, o que compensa a diferença de preço.",
      },
    ],
    whatsappText: "Olá! Gostaria de um orçamento de eucalipto citriodora tratado.",
    related: ["tratamento-em-autoclave", "norma-nbr-9480", "produtos"],
  },
  {
    slug: "tratamento-em-autoclave",
    nav: "Tratamento em autoclave",
    video: {
      file: "videos/tratamento-em-autoclave.mp4",
      poster: "videos/tratamento-em-autoclave-capa.webp",
      title: "Como o eucalipto é tratado em autoclave: simulação 3D e imagens reais",
      description: "Animação 3D do tratamento do eucalipto em autoclave, em 7 passos (carregamento, vácuo inicial, entrada do preservativo, impregnação sob pressão, retorno da solução, vácuo final e fixação), seguida de imagens reais da saída da madeira da autoclave.",
      seconds: 85,
      uploadDate: "2026-11-27",
      heading: "Veja o tratamento em autoclave em vídeo",
      chapters: [
        { time: "0:05", title: "01 Preparação e carregamento", text: "Madeira descascada e seca entra na autoclave." },
        { time: "0:15", title: "02 Vácuo inicial", text: "O ar é retirado para facilitar a impregnação." },
        { time: "0:25", title: "03 Entrada do preservativo", text: "A solução preenche o cilindro fechado." },
        { time: "0:35", title: "04 Impregnação sob pressão", text: "O preservativo penetra nas regiões permeáveis da madeira. Na animação, o alburno é a região permeável e o cerne é o núcleo da madeira." },
        { time: "0:45", title: "05 Retorno da solução", text: "Após aliviar a pressão, o excedente volta ao reservatório." },
        { time: "0:55", title: "06 Vácuo final", text: "Redução do excesso de produto na superfície." },
        { time: "1:00", title: "07 Fixação e controle", text: "A madeira segue para fixação do produto e avaliação." },
        { time: "1:05", title: "Da simulação à vida real", text: "Imagens reais da saída da madeira da autoclave na Eucalyptus Tratados." },
      ],
    },
    title: "Tratamento de Eucalipto em Autoclave com CCA | Como Funciona",
    description:
      "Como é feito o tratamento do eucalipto em autoclave: secagem de 30 a 60 dias, vácuo, pressão de até 18 kg/cm² com CCA e 20 dias de fixação. 10 anos de garantia.",
    h1: "Tratamento de eucalipto em autoclave: como funciona",
    intro:
      "O tratamento em autoclave injeta o preservativo CCA sob vácuo e alta pressão dentro das células da madeira. É isso que protege o eucalipto contra cupins, fungos e apodrecimento por muitos anos, mesmo enterrado. Nosso processo tem quatro etapas e segue a ABNT NBR 9480.",
    body: `<h2>As 4 etapas do nosso tratamento</h2>
<ol>
<li><strong>Seleção e preparo:</strong> eucalipto citriodora de áreas de reflorestamento, cortado sob medida e descascado.</li>
<li><strong>Secagem:</strong> 30 a 60 dias ao ar livre até a umidade ideal. Madeira úmida não absorve bem o preservativo.</li>
<li><strong>Autoclave (célula cheia):</strong> o vácuo retira ar e umidade das células; em seguida, pressão de até 18 kg/cm² injeta o CCA na madeira.</li>
<li><strong>Fixação:</strong> 20 dias de repouso para o preservativo se fixar completamente antes da entrega.</li>
</ol>
<h2>O que é o CCA</h2>
<p>CCA é o preservativo à base de cobre, cromo e arsênio, o mais usado no Brasil para madeira em contato com o solo. O cobre e o arsênio protegem contra fungos e insetos, e o cromo fixa o produto na madeira. Por isso a madeira tratada fica com a cor esverdeada característica.</p>
<h2 id="laudo">Laudo de retenção de CCA emitido pelo IPT</h2>
<p>O Instituto de Pesquisas Tecnológicas (IPT) mediu a retenção do preservativo CCA em 4 amostras da nossa madeira de eucalipto citriodora. O método segue a ABNT NBR 6232:2013 (penetração e retenção de preservativos em madeira tratada sob pressão). O resultado está no Relatório de Ensaio nº 1 129 012-203, de 25 de novembro de 2026. O laudo conclui: "madeira apta a certificação, amostras bem acima do nível mínimo de solução preservativa na madeira".</p>
<div class="tabela-wrap" tabindex="0" role="region" aria-label="Resultados do laudo (role para os lados no celular)"><table>
<caption>Retenção dos ingredientes ativos do CCA (kg/m³), resultados médios</caption>
<thead><tr><th scope="col">Amostra (diâmetro)</th><th scope="col">CuO</th><th scope="col">CrO₃</th><th scope="col">As₂O₅</th><th scope="col">Total</th></tr></thead>
<tbody>
<tr><td>1 · 8 a 10 cm</td><td>2,8</td><td>2,3</td><td>2,6</td><td><strong>7,7</strong></td></tr>
<tr><td>2 · 14 a 16 cm</td><td>1,1</td><td>2,9</td><td>2,8</td><td><strong>6,8</strong></td></tr>
<tr><td>3 · 11 a 13 cm</td><td>3,2</td><td>2,1</td><td>3,3</td><td><strong>8,6</strong></td></tr>
<tr><td>4 · 25 a 30 cm</td><td>3,6</td><td>3,8</td><td>3,0</td><td><strong>10,4</strong></td></tr>
</tbody></table></div>
<p class="nota">Os resultados do laudo se aplicam somente às amostras ensaiadas. Documento reproduzido na íntegra abaixo.</p>
<div class="laudo-paginas">
<a href="{{BASE}}laudos/laudo-retencao-cca-ipt-2026-11.pdf" target="_blank" rel="noopener"><img src="{{BASE}}laudos/laudo-ipt-pagina-1.webp" alt="Laudo de ensaio do IPT, página 1: identificação do cliente, método ABNT NBR 6232:2013 e equipamentos usados" width="455" height="643" loading="lazy" decoding="async"></a>
<a href="{{BASE}}laudos/laudo-retencao-cca-ipt-2026-11.pdf" target="_blank" rel="noopener"><img src="{{BASE}}laudos/laudo-ipt-pagina-2.webp" alt="Laudo de ensaio do IPT, página 2: tabela de resultados de retenção de CuO, CrO3 e As2O5 em kg por metro cúbico" width="455" height="643" loading="lazy" decoding="async"></a>
</div>
<p><a class="cta" href="{{BASE}}laudos/laudo-retencao-cca-ipt-2026-11.pdf" target="_blank" rel="noopener">Baixar o laudo completo (PDF)</a></p>
<h2>Por que a fixação importa</h2>
<p>Pular ou encurtar o tempo de fixação é um atalho comum no mercado. Respeitamos os 20 dias para que o preservativo fique preso nas fibras e a proteção dure, o que sustenta nossa garantia de 10 anos.</p>
<h2>Cuidados com a madeira tratada</h2>
<ul>
<li>Use luvas ao manusear e lave as mãos depois.</li>
<li>Não queime sobras de madeira tratada.</li>
<li>Evite contato direto com alimentos e com água de consumo.</li>
</ul>
<p>Saiba por que usamos <a href="{{eucalipto-citriodora}}">só eucalipto citriodora</a> e como fazemos a <a href="{{norma-nbr-9480}}">medição pela NBR 9480</a>.</p>`,
    faq: [
      {
        q: "Como saber se o eucalipto foi tratado em autoclave?",
        a: "A madeira tratada com CCA tem cor esverdeada uniforme no alburno, a parte mais externa. Peças só pintadas ou mergulhadas ficam com cor superficial e irregular. Peça sempre a garantia por escrito.",
      },
    ],
    whatsappText: "Olá! Gostaria de um orçamento de eucalipto tratado em autoclave.",
    related: ["eucalipto-citriodora", "norma-nbr-9480", "perguntas-frequentes"],
  },
  {
    slug: "norma-nbr-9480",
    nav: "Norma NBR 9480",
    title: "NBR 9480: Como Medir Poste e Mourão de Eucalipto Tratado",
    description:
      "Entenda a ABNT NBR 9480 para peças roliças de eucalipto preservado: medição pelo diâmetro do topo, por que a base varia e como conferir sua compra.",
    h1: "ABNT NBR 9480: medição de postes e mourões de eucalipto",
    intro:
      "A ABNT NBR 9480 é a norma brasileira para peças roliças de eucalipto preservado usadas em construções rurais. Na prática, ela define que postes e mourões são vendidos pelo diâmetro do topo, a ponta mais fina da peça. Seguimos a norma em todas as nossas medidas.",
    body: `<h2>Medição pelo topo</h2>
<p>A medida de venda é o diâmetro do <strong>topo</strong>. Um poste "16 a 18" tem entre 16 e 18 cm na ponta fina. A base é naturalmente mais grossa e varia conforme o crescimento da árvore, por isso não serve como medida padrão.</p>
<figure class="figura-medicao">
<img src="{{BASE}}medicao-poste-nbr-9480.webp" alt="Ilustração de medição de um poste de eucalipto tratado de 6,00 m de comprimento: a ponta, que é a medida padrão de venda, tem 16 cm de diâmetro e a base, variável, cerca de 22 cm" width="1600" height="1078" loading="lazy" decoding="async">
<figcaption>Ilustração de medição: a ponta (topo) é a medida padrão de venda (16 cm neste exemplo); a base é variável (cerca de 22 cm); o comprimento total é de 6,00 m.</figcaption>
</figure>
<h2>Por que isso protege o comprador</h2>
<p>Medir pelo topo garante a espessura mínima da peça em todo o comprimento. Quem vende "pela base" pode entregar uma peça que afina demais na ponta e perde resistência justamente na parte de cima.</p>
<h2>Como conferir na entrega</h2>
<ol>
<li>Meça a circunferência na ponta fina com uma fita.</li>
<li>Divida por 3,14 para obter o diâmetro.</li>
<li>Confira se o valor está dentro da faixa comprada (por exemplo, 10 a 12 cm).</li>
</ol>
<h2>Faixas de diâmetro</h2>
<p>Nossas peças são vendidas em faixas de 2 a 3 cm (4 a 6, 6 a 8, 8 a 10 e assim por diante, até 30 a 32 cm). Veja as faixas de cada produto em <a href="{{produtos}}">produtos</a>.</p>
<p>Conheça também <a href="{{tratamento-em-autoclave}}">o processo de tratamento</a>.</p>`,
    whatsappText: "Olá! Gostaria de tirar uma dúvida sobre medidas de eucalipto tratado.",
    related: ["tratamento-em-autoclave", "produtos/poste-de-eucalipto-tratado", "produtos/mourao-de-eucalipto-tratado"],
  },

  // ───────────────────────── APLICAÇÕES ─────────────────────────
  {
    slug: "cerca-de-eucalipto-tratado",
    nav: "Cerca de eucalipto",
    title: "Cerca de Eucalipto Tratado: Como Fazer e Quais Peças Usar",
    description:
      "Guia de cerca de eucalipto tratado: mourões, esticadores e balancins, espaçamento, profundidade e por que o citriodora dura mais. Orçamento pelo WhatsApp.",
    h1: "Cerca de eucalipto tratado: como fazer e quais peças usar",
    intro:
      "Uma cerca rural de eucalipto tratado usa três peças: mourões de 2,20 m na linha, esticadores de 2,50 m nos cantos e porteiras, e balancins entre os mourões para manter o arame alinhado. Com eucalipto citriodora tratado em autoclave, a cerca dura muito mais e exige menos manutenção.",
    body: `<h2>Peças da cerca</h2>
<ul>
<li><a href="{{produtos/mourao-de-eucalipto-tratado}}"><strong>Mourões (2,20 m)</strong></a>: formam a linha da cerca.</li>
<li><a href="{{produtos/esticador-de-eucalipto-tratado}}"><strong>Esticadores (2,50 m)</strong></a>: nos cantos, porteiras e pontos de tensão.</li>
<li><a href="{{produtos/madeira-serrada-de-eucalipto}}"><strong>Balancins (1,20 m)</strong></a>: espaçadores de arame entre os mourões.</li>
<li><a href="{{produtos/palanque-de-eucalipto-tratado}}"><strong>Palanques</strong></a>: para currais e cercas de manejo.</li>
</ul>
<h2>Dicas de montagem</h2>
<ul>
<li><strong>Profundidade:</strong> enterre cerca de 50 a 60 cm do mourão e um pouco mais do esticador, compactando bem a terra.</li>
<li><strong>Espaçamento:</strong> o espaçamento entre mourões costuma ficar entre 2 e 3 m, conforme o tipo de arame e de animal. Com balancins, dá para aumentar o vão.</li>
<li><strong>Cantos firmes:</strong> o esticador do canto segura toda a tensão. Use peça grossa e escore bem.</li>
<li><strong>Ponta para cima:</strong> instale a base (mais grossa) enterrada e o topo para cima.</li>
</ul>
<h2>Como calcular a quantidade</h2>
<p>Divida o comprimento da cerca pelo espaçamento escolhido para saber quantos mourões usar e some os esticadores dos cantos e porteiras. Exemplo: 300 m com espaçamento de 2,5 m pedem cerca de 120 mourões, além dos esticadores. Envie a metragem pelo WhatsApp e montamos a lista para você.</p>
<h2>Por que citriodora na cerca</h2>
<p>A cerca sofre com sol, chuva, umidade do solo e pressão dos animais. O citriodora praticamente não racha e é mais resistente, e o tratamento em autoclave protege a parte enterrada contra cupins e apodrecimento. Resultado: menos mourão quebrado e menos retrabalho.</p>
<h2>Sem chapinhas anti-rachadura</h2>
<p>Em muitas espécies de eucalipto, o mourão racha na hora de fixar o arame com grampo, e é comum colocar chapinhas metálicas anti-rachadura. Na nossa experiência, elas não adiantam. O <a href="{{eucalipto-citriodora}}">citriodora</a> praticamente não racha e dispensa essas chapas: você grampeia o arame e a madeira segura.</p>
<p>É o contrário da cloeziana, que na nossa experiência pesa cerca de 3 vezes menos que o citriodora, é mais fraca e, numa cerca, racha só de encostar o grampo.</p>`,
    faq: [
      {
        q: "Preciso de chapinha anti-rachadura no mourão?",
        a: "Com o eucalipto citriodora, não. Ele praticamente não racha, então você grampeia o arame sem precisar de chapas metálicas. Em outras espécies, na nossa experiência, as chapinhas não resolvem o rachamento.",
      },
      {
        q: "Quantos mourões preciso para 100 metros de cerca?",
        a: "Com espaçamento de 2,5 m, cerca de 40 mourões, mais os esticadores dos cantos e porteiras. Com espaçamento de 2 m, cerca de 50 mourões. Mande a metragem pelo WhatsApp e calculamos com você.",
      },
    ],
    whatsappText: "Olá! Quero fazer uma cerca de eucalipto tratado. Pode me ajudar com o orçamento?",
    related: ["produtos/mourao-de-eucalipto-tratado", "produtos/esticador-de-eucalipto-tratado", "eucalipto-citriodora"],
  },
  {
    slug: "construcoes-com-eucalipto-tratado",
    nav: "Construções com eucalipto",
    title: "Construções com Eucalipto Tratado | Galpão, Pergolado, Deck",
    description:
      "Use eucalipto citriodora tratado em galpões, barracões, coberturas, pergolados, quiosques e decks. Veja quais peças usar em cada obra e peça orçamento.",
    h1: "Construções com eucalipto tratado",
    intro:
      "O eucalipto citriodora tratado é uma alternativa forte, econômica e sustentável para galpões, barracões, coberturas, pergolados, quiosques e decks. A densidade alta suporta cargas e o tratamento em autoclave garante durabilidade ao ar livre.",
    body: `<h2>Qual peça usar em cada obra</h2>
<div class="tabela-wrap" tabindex="0" role="region" aria-label="Tabela de medidas (role para os lados no celular)"><table><caption>Peças indicadas por tipo de construção</caption>
<thead><tr><th scope="col">Obra</th><th scope="col">Peças indicadas</th></tr></thead>
<tbody>
<tr><td>Galpão e barracão</td><td><a href="{{produtos/poste-de-eucalipto-tratado}}">Postes</a> ou <a href="{{produtos/palanque-de-eucalipto-tratado}}">palanques de 6 m a 7 m</a> como esteios, com terças e caibros serrados</td></tr>
<tr><td>Curral e mangueira</td><td><a href="{{produtos/palanque-de-eucalipto-tratado}}">Palanques de 3,20 m a 4 m</a> e pranchas</td></tr>
<tr><td>Cobertura e quiosque</td><td>Palanques ou postes, vigas e caibros</td></tr>
<tr><td>Pergolado</td><td><a href="{{produtos/vara-de-eucalipto-tratado}}">Varas</a> ou palanques finos e ripão</td></tr>
<tr><td>Deck e bancos</td><td><a href="{{produtos/madeira-serrada-de-eucalipto}}">Pranchas e vigas serradas</a></td></tr>
</tbody></table></div>
<h2>Vantagens do eucalipto tratado na construção</h2>
<ul>
<li>Custo menor que estruturas metálicas ou de concreto em muitas obras rurais.</li>
<li>Madeira de reflorestamento: recurso renovável que retém carbono.</li>
<li>Montagem rápida, com ferramentas simples.</li>
<li>Visual rústico e natural.</li>
</ul>
<h2>Cuidados</h2>
<ul>
<li>Dimensione a estrutura com um profissional para vãos e cargas maiores.</li>
<li>Prefira citriodora em esteios e peças que recebem carga, pois praticamente não racha.</li>
<li>Peças que ficam enterradas devem ser tratadas em autoclave.</li>
</ul>`,
    whatsappText: "Olá! Quero orçamento de eucalipto tratado para uma construção.",
    related: ["produtos/poste-de-eucalipto-tratado", "produtos/palanque-de-eucalipto-tratado", "produtos/madeira-serrada-de-eucalipto"],
  },

  // ───────────────────────── INSTITUCIONAL ─────────────────────────
  {
    slug: "perguntas-frequentes",
    nav: "Perguntas frequentes",
    title: "Perguntas Frequentes sobre Eucalipto Tratado | Citriodora",
    description:
      "Respostas sobre eucalipto citriodora tratado: durabilidade, garantia, tratamento em autoclave, NBR 9480, medidas, produtos, entrega e orçamento.",
    h1: "Perguntas frequentes sobre eucalipto tratado",
    intro:
      "Reunimos as dúvidas mais comuns de quem compra eucalipto tratado para cercas, currais e construções. Não encontrou sua pergunta? Chame no WhatsApp.",
    body: "", // preenchido com o FAQ completo no build
    whatsappText: "Olá! Tenho uma dúvida sobre eucalipto tratado.",
    related: ["eucalipto-citriodora", "tratamento-em-autoclave", "produtos"],
  },
  {
    slug: "sobre-a-empresa",
    nav: "Sobre a empresa",
    title: "Sobre a Eucalyptus Tratados | Desde 1992 em Laranjal Paulista",
    description:
      "Desde 1992 em Laranjal Paulista (SP), a Eucalyptus Tratados trabalha só com eucalipto citriodora tratado em autoclave, conforme a NBR 9480.",
    h1: "Sobre a Eucalyptus Tratados",
    intro: `Desde ${B.foundingYear}, a Eucalyptus Tratados fornece eucalipto tratado em ${B.city} (SP). São mais de 30 anos com um foco claro: trabalhar só com eucalipto citriodora, a espécie que praticamente não racha e mais resiste, tratada em autoclave conforme a ABNT NBR 9480.`,
    body: `<h2>Nossos compromissos</h2>
<ul>
<li><strong>Só citriodora</strong> nas peças roliças: postes, mourões, esticadores e palanques.</li>
<li><strong>Tratamento completo:</strong> secagem de 30 a 60 dias, autoclave com CCA e 20 dias de fixação. <a href="{{tratamento-em-autoclave}}">Veja o processo</a>.</li>
<li><strong>Medida honesta:</strong> medição pelo topo, conforme a <a href="{{norma-nbr-9480}}">NBR 9480</a>.</li>
<li><strong>Laudo de retenção de CCA emitido pelo IPT</strong> (Instituto de Pesquisas Tecnológicas), com retenção de 6,8 a 10,4 kg/m³ nas amostras ensaiadas. <a href="{{tratamento-em-autoclave}}#laudo">Veja o laudo</a>.</li>
<li><strong>10 anos de garantia</strong> nas peças tratadas e durabilidade superior a 20 a 30 anos em contato com o solo.</li>
<li><strong>100% reflorestamento:</strong> madeira de áreas plantadas, que retém carbono e poupa as matas nativas.</li>
</ul>
<h2>O que dizem nossos clientes</h2>
<p>Veja as <a href="${B.reviewsUrl}">avaliações da Eucalyptus Tratados no Google</a>. Comprou com a gente? Sua avaliação ajuda outros produtores a escolher madeira de qualidade.</p>
<h2>Atendimento</h2>
<p>Atendemos produtores rurais, construtoras, paisagistas e revendas. O orçamento é rápido pelo WhatsApp: informe as peças, medidas, quantidade e cidade de entrega.</p>`,
    whatsappText: "Olá! Gostaria de falar com a Eucalyptus Tratados.",
    related: ["eucalipto-citriodora", "contato", "produtos"],
  },
  {
    slug: "contato",
    nav: "Contato e orçamento",
    title: "Contato e Orçamento | Eucalyptus Tratados, Laranjal Paulista",
    description:
      "Orçamento de eucalipto citriodora tratado pelo WhatsApp (15) 99685-4945, telefone (15) 3283-1253 ou e-mail. Estrada do Moinho Km 2.1, Laranjal Paulista.",
    h1: "Contato e orçamento",
    intro:
      "O jeito mais rápido de pedir orçamento é pelo WhatsApp. Informe as peças, medidas, quantidade, aplicação e a cidade de entrega para receber o valor com frete.",
    body: `<div class="cards">
<a class="card" href="${wa("Olá! Gostaria de um orçamento de eucalipto tratado.")}"><h2>WhatsApp</h2><p>${B.whatsappDisplay}</p></a>
<a class="card" href="tel:${B.phone}"><h2>Telefone</h2><p>${B.phoneDisplay}</p></a>
<a class="card" href="mailto:${B.email}"><h2>E-mail</h2><p>${B.email}</p></a>
<a class="card" href="${B.mapsUrl}"><h2>Endereço</h2><p>${B.street}, ${B.city} - ${B.region}</p></a>
<a class="card" href="${B.reviewsUrl}"><h2>Avaliações no Google</h2><p>Veja o que nossos clientes dizem e deixe a sua avaliação.</p></a>
</div>
<h2>O que informar no orçamento</h2>
<ul>
<li>Tipo de peça (mourão, esticador, palanque, poste, vara ou serrada)</li>
<li>Comprimento e faixa de diâmetro (ex.: mourão 2,20 m, 10 a 12 cm)</li>
<li>Quantidade de cada peça</li>
<li>Aplicação (cerca, curral, galpão…)</li>
<li>Cidade e endereço de entrega</li>
</ul>
<p>Não sabe a medida? Conte o que vai construir e indicamos as peças. Veja os <a href="{{produtos}}">produtos</a> ou o guia de <a href="{{cerca-de-eucalipto-tratado}}">cerca de eucalipto</a>.</p>`,
    whatsappText: "Olá! Gostaria de um orçamento de eucalipto tratado.",
    related: ["produtos", "perguntas-frequentes", "sobre-a-empresa"],
  },
];

/** Data da última revisão do conteúdo das páginas fixas. Atualize ao mudar textos. */
export const CONTENT_UPDATED = "2026-11-26";

export const pageBySlug = (slug: string) => {
  const p = PAGES.find((x) => x.slug === slug);
  if (!p) throw new Error(`Página não encontrada: ${slug}`);
  return p;
};
