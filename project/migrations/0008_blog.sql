-- Blog próprio (sem WordPress): artigos, categorias, tags, autores, redirecionamentos,
-- versões e biblioteca de mídia. Editado no painel em Blog › Artigos / Categorias / Tags.
--
-- O conteúdo do artigo é HTML já sanitizado (lib/blog/html.ts) — é o que o editor visual
-- e o modo HTML do painel trabalham. Datas em ISO 8601 UTC.
--
-- Aplicar com: npx wrangler d1 execute pitchyes-leads --remote --file migrations/0008_blog.sql
-- (o D1 deste projeto não tem o histórico do `migrations apply`).

CREATE TABLE IF NOT EXISTS blog_authors (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT,                      -- cargo, aparece na caixa do autor
  bio         TEXT,
  avatar_url  TEXT,
  same_as     TEXT,                      -- JSON: perfis (LinkedIn etc.) para o schema Person
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,                -- introdução da página da categoria (conteúdo próprio)
  seo_title         TEXT,
  meta_description  TEXT,
  cta_path          TEXT,                -- página comercial ligada (CTA no fim dos artigos)
  position          INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_tags (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  seo_title         TEXT,
  meta_description  TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  seo_title         TEXT,                -- <title> sem o sufixo "| PitchYes"; vazio = title
  meta_description  TEXT,
  focus_keyword     TEXT,
  excerpt           TEXT,                -- resumo do card e da listagem
  content_html      TEXT NOT NULL DEFAULT '',
  cover_url         TEXT,                -- imagem destacada (/midia/blog/...)
  cover_alt         TEXT,
  cover_width       INTEGER,
  cover_height      INTEGER,
  author_id         TEXT REFERENCES blog_authors (id),
  category_id       TEXT REFERENCES blog_categories (id),
  status            TEXT NOT NULL DEFAULT 'rascunho'
                    CHECK (status IN ('rascunho', 'agendado', 'publicado')),
  published_at      TEXT,                -- data mostrada e usada no schema; futura = agendado
  updated_at        TEXT NOT NULL,       -- última edição de conteúdo (dateModified, lastmod)
  created_at        TEXT NOT NULL,
  reading_minutes   INTEGER NOT NULL DEFAULT 1,
  word_count        INTEGER NOT NULL DEFAULT 0,
  featured          INTEGER NOT NULL DEFAULT 0,
  noindex           INTEGER NOT NULL DEFAULT 0,
  created_by        TEXT,
  updated_by        TEXT,
  updated_by_name   TEXT,
  -- Trinco consultivo: mostra "Fulano está editando", nunca bloqueia.
  locked_by         TEXT,
  locked_by_name    TEXT,
  locked_at         TEXT
);

CREATE INDEX IF NOT EXISTS blog_posts_published ON blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_category  ON blog_posts (category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_author    ON blog_posts (author_id, published_at DESC);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id  TEXT NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  tag_id   TEXT NOT NULL REFERENCES blog_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS blog_post_tags_tag ON blog_post_tags (tag_id);

-- 301: slugs antigos (site anterior), slug editado no painel, termo renomeado ou fundido.
CREATE TABLE IF NOT EXISTS blog_redirects (
  from_path   TEXT PRIMARY KEY,
  to_path     TEXT NOT NULL,
  reason      TEXT,
  created_at  TEXT NOT NULL
);

-- Uma versão por publicação (e por "salvar versão"), para restaurar.
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id               TEXT PRIMARY KEY,
  post_id          TEXT NOT NULL,
  data             TEXT NOT NULL,         -- JSON com os campos editáveis do artigo
  note             TEXT,
  created_at       TEXT NOT NULL,
  created_by       TEXT,
  created_by_name  TEXT
);
CREATE INDEX IF NOT EXISTS blog_post_versions_post ON blog_post_versions (post_id, created_at DESC);

-- Biblioteca de mídia do blog (imagens no R2, servidas em /midia/<key>).
CREATE TABLE IF NOT EXISTS blog_media (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  url         TEXT NOT NULL,
  alt         TEXT,
  caption     TEXT,
  width       INTEGER,
  height      INTEGER,
  bytes       INTEGER,
  mime        TEXT,
  created_at  TEXT NOT NULL,
  created_by  TEXT
);
CREATE INDEX IF NOT EXISTS blog_media_created ON blog_media (created_at DESC);
