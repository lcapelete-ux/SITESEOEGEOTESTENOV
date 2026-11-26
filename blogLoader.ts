/**
 * Leitor do blog (roda só no build, em Node).
 *
 * Cada artigo é um arquivo Markdown em src/blog/posts/AAAA-MM-slug.md com um
 * cabeçalho simples (frontmatter) entre linhas "---". Arquivos que começam com
 * "_" (como o modelo) são ignorados.
 *
 * Uma seção "## Perguntas frequentes" com perguntas em "### " vira o FAQ do
 * artigo e o schema FAQPage automaticamente.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import type { PageFaq, SitePage } from './src/pages/content';

const POSTS_DIR = join(import.meta.dirname, 'src/blog/posts');

const REQUIRED = ['title', 'description', 'h1', 'date', 'category', 'whatsapp'] as const;

export interface BlogPost extends SitePage {
  article: { date: string; updated?: string; category: string; readMinutes: number };
}

function parseFrontmatter(raw: string, file: string): { meta: Record<string, string>; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`Blog: ${file} precisa começar com um cabeçalho entre linhas "---".`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) throw new Error(`Blog: linha inválida no cabeçalho de ${file}: "${line}"`);
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  for (const k of REQUIRED) if (!meta[k]) throw new Error(`Blog: ${file} está sem o campo "${k}".`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`Blog: data inválida em ${file} (use AAAA-MM-DD).`);
  return { meta, content: m[2] };
}

/** Separa "## Perguntas frequentes" do corpo e transforma em FAQ. */
function splitFaq(md: string): { body: string; faq: PageFaq[] } {
  const parts = md.split(/^## +Perguntas frequentes.*$/im);
  if (parts.length < 2) return { body: md, faq: [] };
  const [body, faqMd] = parts;
  const faq: PageFaq[] = [];
  for (const block of faqMd.split(/^### +/m).slice(1)) {
    const [q, ...rest] = block.split(/\r?\n/);
    const a = rest.join(' ').replace(/\s+/g, ' ').trim();
    if (q.trim() && a) faq.push({ q: q.trim(), a });
  }
  return { body, faq };
}

/** Markdown → HTML, mantendo os atalhos {{slug}} e aplicando o estilo das tabelas. */
function toHtml(md: string): string {
  return (marked.parse(md, { async: false }) as string)
    .replace(/%7B%7B([a-z0-9/-]+)%7D%7D/g, '{{$1}}')
    .replace(/<table>/g, '<div class="tabela-wrap" tabindex="0" role="region" aria-label="Tabela (role para os lados no celular)"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

export function loadBlogPosts(): BlogPost[] {
  let files: string[] = [];
  try {
    files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  } catch {
    return [];
  }
  const posts = files.map((file) => {
    const { meta, content } = parseFrontmatter(readFileSync(join(POSTS_DIR, file), 'utf8'), file);
    const slug = meta.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-/, '');
    const { body, faq } = splitFaq(content);
    // O primeiro parágrafo vira a introdução (resposta direta para Google e IAs).
    const paras = body.trim().split(/\r?\n\s*\r?\n/);
    const intro = paras[0].replace(/\s+/g, ' ').trim();
    const rest = paras.slice(1).join('\n\n');
    const words = content.split(/\s+/).length;
    const post: BlogPost = {
      slug: `blog/${slug}`,
      nav: meta.nav || meta.title,
      title: meta.title,
      description: meta.description,
      h1: meta.h1,
      intro: intro.replace(/\*\*|__|\*|_/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
      body: toHtml(rest),
      faq,
      parent: { name: 'Blog', slug: 'blog' },
      whatsappText: meta.whatsapp,
      related: (meta.related || 'blog,produtos').split(',').map((s) => s.trim()).filter(Boolean),
      article: {
        date: meta.date,
        updated: meta.updated,
        category: meta.category,
        readMinutes: Math.max(1, Math.round(words / 200)),
      },
    };
    return post;
  });
  const dupes = posts.map((p) => p.slug).filter((s, i, a) => a.indexOf(s) !== i);
  if (dupes.length) throw new Error(`Blog: endereços repetidos: ${dupes.join(', ')}`);
  return posts.sort((a, b) => b.article.date.localeCompare(a.article.date));
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const dataPorExtenso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
};

/** Página /blog/ com a lista de artigos. */
export function blogIndexPage(posts: BlogPost[]): SitePage {
  const cards = posts
    .map(
      (p) =>
        `<a class="card" href="{{${p.slug}}}"><p class="nota">${p.article.category} · ${dataPorExtenso(p.article.date)}</p><h2>${p.title.replace(/</g, '&lt;')}</h2><p>${p.description.replace(/</g, '&lt;')}</p></a>`,
    )
    .join('');
  return {
    slug: 'blog',
    nav: 'Blog',
    title: 'Blog Eucalyptus Tratados | Guias de Eucalipto Tratado',
    description:
      'Artigos práticos sobre eucalipto citriodora tratado: cercas, postes, tratamento em autoclave, medidas e como escolher a madeira certa para sua obra.',
    h1: 'Blog: guias práticos de eucalipto tratado',
    intro:
      'Respostas diretas às dúvidas que mais recebemos no WhatsApp: como escolher, calcular, instalar e conservar eucalipto citriodora tratado. Artigos novos todo mês.',
    body: posts.length ? `<div class="cards cards-blog">${cards}</div>` : '<p>Os primeiros artigos chegam em breve.</p>',
    whatsappText: 'Olá! Li o blog e tenho uma dúvida sobre eucalipto tratado.',
    related: ['produtos', 'perguntas-frequentes', 'cerca-de-eucalipto-tratado'],
  };
}
