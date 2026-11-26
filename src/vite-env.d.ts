/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Gerado no build por seoPlugin.ts: os 3 artigos mais recentes do blog. */
declare module "virtual:blog-latest" {
  const posts: { slug: string; title: string; description: string; category: string; date: string; dateLabel: string }[];
  export default posts;
}
