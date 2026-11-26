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

- `src/seoContent.ts`: fonte única de dados da empresa, produtos e FAQ. Edite aqui.
- `seoPlugin.ts`: no build, gera o JSON-LD (LocalBusiness, catálogo, FAQPage) e um
  HTML estático dentro de `#root` para robôs que não executam JavaScript.
- `public/robots.txt`: libera buscadores e robôs de IA; bloqueia `/cercas/`.
- `public/llms.txt`: resumo da empresa para assistentes de IA.
- `public/sitemap.xml`: atualize o `lastmod` ao mudar conteúdo.

## Deploy

Push na `main` dispara `.github/workflows/deploy-pages.yml` (GitHub Pages).
