/**
 * Plugin Vite de SEO/GEO.
 *
 * No build:
 *  - index.html (home React): injeta JSON-LD da empresa e um HTML estático em #root
 *    para robôs que não executam JavaScript (o React substitui ao montar).
 *  - Gera as páginas estáticas de src/pages/content.ts em /<slug>/index.html,
 *    com HTML completo, schema por página, breadcrumbs e links internos.
 *  - Gera sitemap.xml e llms.txt a partir da mesma lista de páginas.
 *
 * SITE_NOINDEX=true marca tudo como noindex (versão de teste).
 */
import type { Plugin, ResolvedConfig } from 'vite';
import { BUSINESS as B, FAQ, PRODUCTS } from './src/seoContent';
import { PAGES, pageBySlug, whatsappLink, type PageFaq, type SitePage } from './src/pages/content';
import { FOOTER_GROUPS, HEADER_LINKS } from './src/pages/nav';

const SITE = B.url; // domínio oficial (canonical), com barra final
const LASTMOD = new Date().toISOString().slice(0, 10);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = (obj: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const BUSINESS_ID = `${SITE}#empresa`;

function businessLd() {
  return {
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': BUSINESS_ID,
    name: B.name,
    alternateName: 'Eucalyptus Tratados Laranjal Paulista',
    url: SITE,
    logo: `${SITE}logo-eucalyptus-original.png`,
    image: `${SITE}og-image.jpg`,
    description:
      'Fornecedor de eucalipto citriodora tratado em autoclave com CCA, conforme ABNT NBR 9480: postes, mourões, esticadores, palanques e madeira serrada, com 10 anos de garantia.',
    telephone: B.phone,
    email: B.email,
    foundingDate: B.foundingYear,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: B.street,
      addressLocality: B.city,
      addressRegion: B.region,
      addressCountry: 'BR',
    },
    hasMap: B.mapsUrl,
    areaServed: [
      { '@type': 'State', name: 'São Paulo' },
      { '@type': 'Country', name: 'Brasil' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${B.whatsapp}`,
      contactType: 'sales',
      availableLanguage: 'Portuguese',
      url: `https://wa.me/${B.whatsapp}`,
    },
    knowsAbout: [
      'Eucalyptus citriodora',
      'eucalipto tratado em autoclave',
      'tratamento CCA',
      'ABNT NBR 9480',
      'postes de eucalipto',
      'mourões para cerca',
      'construção rural',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Eucalipto citriodora tratado',
      itemListElement: PRODUCTS.map((p) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          material: 'Eucalyptus citriodora tratado em autoclave (CCA)',
          brand: { '@type': 'Brand', name: B.name },
        },
      })),
    },
  };
}

const faqLd = (url: string, items: PageFaq[]) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  inLanguage: 'pt-BR',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/** Todas as perguntas do site (home + páginas), sem duplicatas. */
function allFaq(): PageFaq[] {
  const seen = new Set<string>();
  return [...FAQ, ...PAGES.flatMap((p) => p.faq ?? [])].filter((f) =>
    seen.has(f.q) ? false : (seen.add(f.q), true),
  );
}

// ───────────────────────── Home (index.html) ─────────────────────────

function homeStatic(base: string): string {
  const products = PRODUCTS.map(
    (p) => `<li><strong>${esc(p.name)}</strong>: ${esc(p.description)}</li>`,
  ).join('');
  const faq = FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('');
  const links = FOOTER_GROUPS.map(
    (g) =>
      `<h3>${esc(g.title)}</h3><ul>${g.links
        .map((l) => `<li><a href="${base}${l.slug}/">${esc(l.name)}</a></li>`)
        .join('')}</ul>`,
  ).join('');
  return `<div class="seo-static">
<header><p>${esc(B.name)}, qualidade e confiabilidade desde ${B.foundingYear}</p></header>
<main>
<h1>Eucalipto Citriodora Tratado em Autoclave | Postes e Mourões em ${esc(B.city)} (SP)</h1>
<p>A ${esc(B.name)}, em ${esc(B.city)} (SP), fornece postes, mourões, palanques e madeira serrada de eucalipto citriodora tratado em autoclave com CCA, conforme a ABNT NBR 9480, com 10 anos de garantia. Mais de 30 anos de mercado e 100% madeira de reflorestamento.</p>
<h2>Por que eucalipto citriodora?</h2>
<ul><li>Fibras retorcidas que aumentam a resistência estrutural</li><li>Maior resistência a trincas e rachaduras</li><li>Densidade alta e resistência mecânica superior, suporta altas cargas</li><li>Melhor absorção do preservativo CCA</li><li>Ideal para ambientes externos e rurais</li><li>Durabilidade superior a 20 a 30 anos em contato com o solo e laudos de tratamento aprovados pelo IPT</li></ul>
<h2>Produtos</h2><ul>${products}</ul>
<h2>Perguntas frequentes</h2>${faq}
<h2>Contato e orçamento</h2>
<p>WhatsApp: <a href="https://wa.me/${B.whatsapp}">${esc(B.whatsappDisplay)}</a>. Telefone: ${esc(B.phoneDisplay)}. E-mail: <a href="mailto:${B.email}">${esc(B.email)}</a>. Endereço: ${esc(B.street)}, ${esc(B.city)} - ${B.region}.</p>
<nav aria-label="Páginas do site">${links}</nav>
</main>
</div>`;
}

function homeLd(): string {
  return ld({
    '@context': 'https://schema.org',
    '@graph': [
      businessLd(),
      {
        '@type': 'WebSite',
        '@id': `${SITE}#site`,
        url: SITE,
        name: B.name,
        inLanguage: 'pt-BR',
        publisher: { '@id': BUSINESS_ID },
      },
    ],
  });
}

// ───────────────────────── Páginas estáticas ─────────────────────────

const pageUrl = (slug: string) => `${SITE}${slug}/`;

function pageLd(p: SitePage, faq: PageFaq[]): string {
  const url = pageUrl(p.slug);
  const crumbs = [
    { name: 'Início', url: SITE },
    ...(p.parent ? [{ name: p.parent.name, url: pageUrl(p.parent.slug) }] : []),
    { name: p.h1, url },
  ];
  const graph: unknown[] = [
    {
      '@type': p.slug === 'contato' ? 'ContactPage' : p.slug === 'sobre-a-empresa' ? 'AboutPage' : p.slug === 'perguntas-frequentes' ? 'FAQPage' : 'WebPage',
      '@id': `${url}#pagina`,
      url,
      name: p.title,
      description: p.description,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${SITE}#site` },
      about: { '@id': BUSINESS_ID },
      dateModified: LASTMOD,
      ...(p.slug === 'perguntas-frequentes'
        ? {
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }
        : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    },
  ];
  if (p.slug === 'sobre-a-empresa' || p.slug === 'contato') graph.push(businessLd());
  if (p.product) {
    graph.push({
      '@type': 'Product',
      '@id': `${url}#produto`,
      name: p.product.name,
      category: p.product.category,
      description: p.description,
      image: `${SITE}og-image.jpg`,
      material: 'Eucalyptus citriodora tratado em autoclave (CCA)',
      brand: { '@type': 'Brand', name: B.name },
      manufacturer: { '@id': BUSINESS_ID },
    });
  }
  if (faq.length && p.slug !== 'perguntas-frequentes') graph.push(faqLd(url, faq));
  return ld({ '@context': 'https://schema.org', '@graph': graph });
}

const logoHtml = `<span class="flex items-center gap-3">
<span class="flex flex-col justify-between h-[28px] w-[32px]" aria-hidden="true"><span class="h-[6px] w-full bg-[#A1C913]"></span><span class="h-[6px] w-full bg-[#A1C913]"></span><span class="h-[6px] w-full bg-[#A1C913]"></span></span>
<span class="flex flex-col justify-center" style="font-family:Arial,sans-serif"><span class="text-[#FDF8E7] font-black text-[22px] leading-[0.85] tracking-wide">EUCALYPTUS</span><span class="text-[#D8B990] text-[10px] tracking-[0.45em] leading-none ml-[2px] mt-[3px]">TRATADOS</span></span>
</span>`;

function faqHtml(items: PageFaq[], title: string): string {
  if (!items.length) return '';
  return `<section class="faq" aria-labelledby="faq-titulo"><h2 id="faq-titulo">${esc(title)}</h2>${items
    .map((f) => `<details><summary><h3>${esc(f.q)}</h3></summary><p>${esc(f.a)}</p></details>`)
    .join('')}</section>`;
}

function renderPage(p: SitePage, ctx: { base: string; css: string[]; gtm: string; noindex: boolean }): string {
  const { base } = ctx;
  const href = (slug: string) => `${base}${slug}/`;
  const resolve = (html: string) => html.replace(/\{\{([a-z0-9/-]+)\}\}/g, (_, slug) => href(pageBySlug(slug).slug));
  const isFaqPage = p.slug === 'perguntas-frequentes';
  const faq = isFaqPage ? allFaq() : (p.faq ?? []);
  const wa = whatsappLink(p.whatsappText);
  const canonical = pageUrl(p.slug);

  const crumbs = [
    `<a href="${base}">Início</a>`,
    ...(p.parent ? [`<a href="${href(p.parent.slug)}">${esc(p.parent.name)}</a>`] : []),
    `<span aria-current="page">${esc(p.nav)}</span>`,
  ].join('<span aria-hidden="true"> › </span>');

  const nav = HEADER_LINKS.map(
    (l) =>
      `<a href="${href(l.slug)}"${l.slug === p.slug ? ' aria-current="page"' : ''} class="text-stone-200 hover:text-white font-medium transition-colors">${esc(l.name)}</a>`,
  ).join('');

  const related = p.related
    .map((slug) => pageBySlug(slug))
    .map((r) => `<a class="card" href="${href(r.slug)}"><h3>${esc(r.nav)}</h3><p>${esc(r.description)}</p></a>`)
    .join('');

  const footer = FOOTER_GROUPS.map(
    (g) => `<div><h2 class="text-white font-bold mb-3">${esc(g.title)}</h2><ul class="space-y-1">${g.links
      .map((l) => `<li><a class="inline-block py-1.5 hover:text-white" href="${href(l.slug)}">${esc(l.name)}</a></li>`)
      .join('')}</ul></div>`,
  ).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="robots" content="${ctx.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#183e26">
<meta property="og:type" content="${p.product ? 'product' : 'article'}">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${base}favicon.svg">
${ctx.css.map((c) => `<link rel="stylesheet" href="${base}${c}">`).join('\n')}
${pageLd(p, faq)}
${ctx.gtm}
</head>
<body class="bg-white text-stone-800 antialiased">
<a href="#conteudo" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white text-stone-900 px-4 py-2 rounded">Pular para o conteúdo</a>
<header class="sticky top-0 w-full z-50 bg-[#183e26]/95 backdrop-blur-md border-b border-[#183e26]">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
<a href="${base}" aria-label="Eucalyptus Tratados, página inicial">${logoHtml}</a>
<nav aria-label="Principal" class="hidden lg:flex space-x-8 items-center">${nav}<a href="${href('contato')}" class="bg-[#A1C913] text-[#183e26] px-5 py-2 rounded-full font-bold hover:bg-[#8eb311] transition-colors">Orçamento</a></nav>
<details class="lg:hidden relative menu-mobile"><summary class="list-none cursor-pointer text-stone-200 p-2.5 -mr-2.5 rounded-lg" aria-label="Abrir menu"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary>
<nav aria-label="Menu" class="absolute right-0 top-12 w-60 bg-[#183e26] rounded-xl shadow-xl p-3 flex flex-col gap-1">${HEADER_LINKS.map((l) => `<a class="block px-3 py-3 text-stone-100 hover:text-white" href="${href(l.slug)}">${esc(l.name)}</a>`).join('')}<a class="block px-3 py-3 text-[#A1C913] font-bold" href="${href('contato')}">Orçamento</a></nav></details>
</div>
</header>
<nav aria-label="Você está em" class="max-w-3xl mx-auto px-4 pt-6 text-sm text-stone-600 breadcrumbs">${crumbs}</nav>
<main id="conteudo" class="max-w-3xl mx-auto px-4 pb-16">
<article class="conteudo">
<h1>${esc(p.h1)}</h1>
<p class="lead">${esc(p.intro)}</p>
<p><a class="cta" href="${wa}">Pedir orçamento pelo WhatsApp</a></p>
${resolve(p.body)}
${faqHtml(faq, isFaqPage ? 'Todas as perguntas' : 'Perguntas frequentes')}
<aside class="cta-box" aria-label="Orçamento">
<h2>Peça seu orçamento</h2>
<p>Atendimento rápido pelo WhatsApp <strong>${esc(B.whatsappDisplay)}</strong>. Informe peças, medidas, quantidade e cidade de entrega.</p>
<p><a class="cta" href="${wa}">Chamar no WhatsApp</a></p>
</aside>
</article>
<section aria-labelledby="rel-titulo" class="mt-12"><h2 id="rel-titulo" class="text-2xl font-bold text-stone-900 mb-4">Veja também</h2><div class="cards">${related}</div></section>
</main>
<footer class="bg-[#183e26] text-stone-300 py-12">
<div class="max-w-6xl mx-auto px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
<div><a href="${base}" aria-label="Página inicial">${logoHtml}</a>
<p class="mt-4">${esc(B.street)}<br>${esc(B.city)} - ${B.region}</p>
<p class="mt-2 flex flex-col items-start"><a class="inline-block py-1.5 hover:text-white" href="https://wa.me/${B.whatsapp}">WhatsApp ${esc(B.whatsappDisplay)}</a><a class="inline-block py-1.5 hover:text-white" href="tel:${B.phone}">Tel. ${esc(B.phoneDisplay)}</a><a class="inline-block py-1.5 hover:text-white break-all" href="mailto:${B.email}">${esc(B.email)}</a></p></div>
${footer}
</div>
<p class="max-w-6xl mx-auto px-4 mt-10 text-xs text-stone-400">© ${new Date().getFullYear()} ${esc(B.name)}. Eucalipto citriodora tratado desde ${B.foundingYear}.</p>
</footer>
<aside aria-label="Contato rápido pelo WhatsApp"><a href="${wa}" class="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E]" aria-label="Falar no WhatsApp"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a></aside>
</body>
</html>`;
}

// ───────────────────────── sitemap e llms.txt ─────────────────────────

function sitemap(): string {
  const urls = [
    `<url><loc>${SITE}</loc><lastmod>${LASTMOD}</lastmod><image:image><image:loc>${SITE}og-image.jpg</image:loc></image:image><image:image><image:loc>${SITE}citriodora-optimized.webp</image:loc></image:image></url>`,
    ...PAGES.map((p) => `<url><loc>${pageUrl(p.slug)}</loc><lastmod>${LASTMOD}</lastmod></url>`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

function llms(): string {
  const section = (title: string, slugs: string[]) =>
    `## ${title}\n\n${slugs
      .map((s) => pageBySlug(s))
      .map((p) => `- [${p.nav}](${pageUrl(p.slug)}): ${p.description}`)
      .join('\n')}\n`;
  return `# ${B.name}

> Fornecedor de eucalipto citriodora (Corymbia citriodora, antes Eucalyptus citriodora) tratado em autoclave com CCA, conforme a norma ABNT NBR 9480. Postes, mourões, esticadores, palanques, varas e madeira serrada com 10 anos de garantia. No mercado desde ${B.foundingYear}, em ${B.city} (SP), Brasil.

## Fatos principais

- Espécie: só eucalipto citriodora nas peças roliças, a espécie de eucalipto que menos racha, com densidade alta e fibras retorcidas que suportam cargas altas.
- Tratamento: autoclave pelo processo de célula cheia, pressão de até 18 kg/cm², preservativo CCA. Secagem de 30 a 60 dias antes e 20 dias de fixação depois.
- Norma: ABNT NBR 9480. A medida de venda é o diâmetro do topo (ponta fina).
- Garantia: 10 anos. Durabilidade superior a 20 a 30 anos em contato com o solo.
- Laudos de tratamento aprovados pelo IPT (Instituto de Pesquisas Tecnológicas).
- Origem: 100% madeira de reflorestamento.

${section('Produtos', PAGES.filter((p) => p.slug.startsWith('produtos')).map((p) => p.slug))}
${section('Guias técnicos', ['eucalipto-citriodora', 'tratamento-em-autoclave', 'norma-nbr-9480', 'cerca-de-eucalipto-tratado', 'construcoes-com-eucalipto-tratado'])}
${section('Empresa', ['sobre-a-empresa', 'perguntas-frequentes', 'contato'])}
## Contato

- WhatsApp: +55 15 99685-4945 (https://wa.me/${B.whatsapp})
- Telefone: +55 15 3283-1253
- E-mail: ${B.email}
- Endereço: ${B.street}, ${B.city} - ${B.region}, Brasil
- Site: ${SITE}
`;
}

// ───────────────────────── Plugin ─────────────────────────

export function seoPlugin(): Plugin {
  let config: ResolvedConfig;
  let gtm = '';
  const noindex = () => process.env.SITE_NOINDEX === 'true';

  return {
    name: 'eucalyptus-seo',
    configResolved(c) {
      config = c;
    },
    transformIndexHtml(html) {
      const m = html.match(/<!-- Google Tag Manager \(adiado[\s\S]*?<!-- End Google Tag Manager -->/);
      gtm = m ? m[0] : '';
      if (noindex()) {
        html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow">');
      }
      return html
        .replace('<!--SEO_JSONLD-->', homeLd())
        .replace('<div id="root"></div>', `<div id="root">${homeStatic(config.base)}</div>`);
    },
    generateBundle(_, bundle) {
      const css = Object.keys(bundle).filter((f) => f.endsWith('.css') && f.startsWith('assets/index'));
      for (const p of PAGES) {
        this.emitFile({
          type: 'asset',
          fileName: `${p.slug}/index.html`,
          source: renderPage(p, { base: config.base, css, gtm, noindex: noindex() }),
        });
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llms() });
    },
  };
}
