# Eucalyptus Tratados — site

Site institucional da Eucalyptus Tratados (eucalipto citriodora tratado, Laranjal Paulista - SP).
Vite + React + TypeScript + Tailwind, com conteúdo dinâmico (galeria e banners) no Supabase.

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## SEO e GEO (buscas por IA)

- `src/seoContent.ts`: dados da empresa, linhas de produto e FAQ da home.
- `src/pages/content.ts`: as 15 páginas estáticas (produtos, guias, FAQ, sobre, contato).
  Para criar uma página nova, adicione um item em `PAGES` e o link em `src/pages/nav.ts`.
- `src/catalogData.ts`: catálogo de medidas e pesos (modal do site e tabelas das páginas).
- `seoPlugin.ts`: no build gera as páginas em HTML puro, o JSON-LD de cada uma
  (empresa, produto, breadcrumbs, FAQ), o HTML estático da home para robôs sem JS,
  o `sitemap.xml` e o `llms.txt`.
- `public/robots.txt`: libera buscadores e robôs de IA; bloqueia `/cercas/`.

As páginas estáticas existem só no build: use `npm run build && npm run preview` para vê-las.

## Blog (publicar um artigo por mês)

1. Copie `src/blog/posts/_modelo.md` para `src/blog/posts/AAAA-MM-endereco-do-artigo.md`.
2. Preencha o cabeçalho (`title`, `description`, `h1`, `date`, `category`, `whatsapp`, `related`).
3. O primeiro parágrafo vira a introdução em destaque: responda a pergunta logo de cara.
4. Uma seção `## Perguntas frequentes` com perguntas em `### ` vira o FAQ e o schema FAQPage.
5. Links internos: `[texto]({{produtos/mourao-de-eucalipto-tratado}})`.

O build gera a página do artigo (schema BlogPosting), a lista `/blog/`, os 3 mais
recentes na home, o `sitemap.xml`, o `llms.txt` e o feed `blog/feed.xml`.

## Deploy

Push na `main` dispara `.github/workflows/deploy-pages.yml` (GitHub Pages).

A versão de teste é publicada com `SITE_NOINDEX=true` (meta robots `noindex`).
No lançamento oficial, remova essa variável do workflow.
