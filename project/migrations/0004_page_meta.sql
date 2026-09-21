-- Metadados editáveis por página (Page Editor).
--
-- Os valores padrão continuam em src/lib/routes.ts e nos arquivos de conteúdo: esta
-- tabela guarda apenas o que foi ALTERADO no painel. Campo em branco aqui significa
-- "usar o padrão do código", então apagar uma linha devolve a página ao estado original.
--
-- `path` é sempre um caminho conhecido de routes.ts — a API recusa qualquer outro.

CREATE TABLE IF NOT EXISTS page_meta (
  path            TEXT PRIMARY KEY,
  title           TEXT,   -- <title>, sem o sufixo "| PitchYes"
  description     TEXT,   -- <meta name="description">
  og_title        TEXT,   -- título para redes sociais, quando difere do <title>
  og_description  TEXT,
  image_url       TEXT,   -- imagem de compartilhamento (1200x630), caminho do próprio site
  image_alt       TEXT,
  noindex         INTEGER NOT NULL DEFAULT 0,
  updated         TEXT,   -- data da revisão de conteúdo (alimenta o <lastmod> do sitemap)
  updated_at      TEXT NOT NULL,
  updated_by      TEXT,
  updated_by_name TEXT
);

CREATE INDEX IF NOT EXISTS page_meta_updated ON page_meta (updated_at DESC);
