/**
 * Plugin Vite de SEO/GEO.
 *
 * No build, injeta no index.html:
 *  - JSON-LD completo (LocalBusiness, WebSite, catálogo de produtos e FAQPage)
 *  - Conteúdo HTML estático e semântico dentro de #root, para robôs que não
 *    executam JavaScript (GPTBot, ClaudeBot, PerplexityBot e similares).
 *    O React substitui esse conteúdo ao montar, então o visitante vê o site normal.
 *
 * Todo o texto vem de src/seoContent.ts, a mesma fonte da seção de FAQ visível.
 */
import type { Plugin } from 'vite';
import { BUSINESS as B, FAQ, PRODUCTS } from './src/seoContent';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function jsonLd(): string {
  const id = `${B.url}#empresa`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
        '@id': id,
        name: B.name,
        alternateName: 'Eucalyptus Tratados Laranjal Paulista',
        url: B.url,
        logo: `${B.url}logo-eucalyptus-original.png`,
        image: `${B.url}hero-1200.webp`,
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
      },
      {
        '@type': 'WebSite',
        '@id': `${B.url}#site`,
        url: B.url,
        name: B.name,
        inLanguage: 'pt-BR',
        publisher: { '@id': id },
      },
      {
        '@type': 'FAQPage',
        '@id': `${B.url}#perguntas`,
        inLanguage: 'pt-BR',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
}

function staticContent(): string {
  const products = PRODUCTS.map(
    (p) => `<li><strong>${esc(p.name)}</strong>: ${esc(p.description)}</li>`,
  ).join('');
  const faq = FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('');
  return `<div class="seo-static">
<header><p>${esc(B.name)}, qualidade e confiabilidade desde ${B.foundingYear}</p></header>
<main>
<h1>Eucalipto Citriodora Tratado em Autoclave | Postes e Mourões em ${esc(B.city)} (SP)</h1>
<p>A ${esc(B.name)}, em ${esc(B.city)} (SP), fornece postes, mourões, palanques e madeira serrada de eucalipto citriodora tratado em autoclave com CCA, conforme a ABNT NBR 9480, com 10 anos de garantia. Mais de 30 anos de mercado e 100% madeira de reflorestamento.</p>
<h2>Por que eucalipto citriodora?</h2>
<ul><li>Fibras retorcidas que aumentam a resistência estrutural</li><li>Maior resistência a trincas e rachaduras</li><li>Densidade alta e resistência mecânica superior, suporta altas cargas</li><li>Melhor absorção do preservativo CCA</li><li>Ideal para ambientes externos e rurais</li></ul>
<h2>Produtos</h2><ul>${products}</ul>
<h2>Perguntas frequentes</h2>${faq}
<h2>Contato e orçamento</h2>
<p>WhatsApp: <a href="https://wa.me/${B.whatsapp}">${esc(B.whatsappDisplay)}</a>. Telefone: ${esc(B.phoneDisplay)}. E-mail: <a href="mailto:${B.email}">${esc(B.email)}</a>. Endereço: ${esc(B.street)}, ${esc(B.city)} - ${B.region}.</p>
</main>
</div>`;
}

export function seoPlugin(): Plugin {
  return {
    name: 'eucalyptus-seo',
    transformIndexHtml(html) {
      // SITE_NOINDEX=true: versão de teste fica fora dos buscadores (não concorre com o site oficial).
      if (process.env.SITE_NOINDEX === 'true') {
        html = html.replace(
          /<meta name="robots"[^>]*>/,
          '<meta name="robots" content="noindex, nofollow">',
        );
      }
      return html
        .replace('<!--SEO_JSONLD-->', jsonLd())
        .replace('<div id="root"></div>', `<div id="root">${staticContent()}</div>`);
    },
  };
}
