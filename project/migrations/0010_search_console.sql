-- Search Console no painel (Análise > Search Console) e aviso automático de indexação.
--
-- site_changes: cada criação, alteração ou exclusão de uma URL pública feita pelo painel
--   (ou detectada no deploy). Alimenta a "Última alteração (site)" da tela, o <lastmod> do
--   sitemap de páginas e decide qual sitemap reenviar ao Google.
-- gsc_inspections: último resultado da Inspeção de URL do Google para cada caminho.
-- gsc_pings: histórico do que foi enviado (sitemap ao Google, URLs ao IndexNow).
-- gsc_route_dates: a data `updated` de cada página de lib/routes.ts no último deploy,
--   para o deploy saber quais páginas mudaram no código.

CREATE TABLE IF NOT EXISTS site_changes (
  id          TEXT PRIMARY KEY,
  path        TEXT NOT NULL,
  kind        TEXT NOT NULL,           -- 'create' | 'update' | 'delete'
  sitemap     TEXT NOT NULL,           -- '/sitemap-paginas.xml' | '/sitemap-blog.xml' | '/sitemap-conteudo.xml'
  changed_at  TEXT NOT NULL,           -- ISO 8601 UTC
  changed_by  TEXT                     -- e-mail de quem mudou ('deploy' no deploy)
);
CREATE INDEX IF NOT EXISTS site_changes_path ON site_changes (path, changed_at DESC);
CREATE INDEX IF NOT EXISTS site_changes_at   ON site_changes (changed_at DESC);

CREATE TABLE IF NOT EXISTS gsc_inspections (
  path              TEXT PRIMARY KEY,
  inspected_at      TEXT NOT NULL,
  verdict           TEXT,              -- PASS | PARTIAL | FAIL | NEUTRAL | VERDICT_UNSPECIFIED
  coverage_state    TEXT,              -- texto do Google ("Submitted and indexed", ...)
  indexing_state    TEXT,
  last_crawl_time   TEXT,
  google_canonical  TEXT,
  robots_state      TEXT,
  page_fetch_state  TEXT,
  raw_json          TEXT
);

CREATE TABLE IF NOT EXISTS gsc_pings (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,           -- 'sitemap' | 'indexnow'
  target      TEXT NOT NULL,           -- sitemap enviado ou lista de URLs
  status      INTEGER,                 -- status HTTP da resposta (0 = falha de rede)
  message     TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS gsc_pings_at ON gsc_pings (created_at DESC);

CREATE TABLE IF NOT EXISTS gsc_route_dates (
  path     TEXT PRIMARY KEY,
  updated  TEXT NOT NULL
);
