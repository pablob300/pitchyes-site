-- Landing pages, configurações gerais do site e perfil comercial dos leads.
--
-- ATENÇÃO: ALTER TABLE ADD COLUMN não aceita "IF NOT EXISTS" no SQLite. Rodar este
-- arquivo duas vezes no mesmo banco dá erro na última parte — o resto é idempotente.

-- Landing pages (/conteudo/<slug>). O CONTEÚDO não mora aqui: fica em page_content no
-- caminho "/_lp/<id>", preso ao id e não ao slug — trocar o endereço não move o texto, e
-- o rascunho, a publicação e o histórico de versões vêm prontos do editor visual.
CREATE TABLE IF NOT EXISTS landing_pages (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  active          INTEGER NOT NULL DEFAULT 1,
  seo_title       TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  noindex         INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL,
  created_by      TEXT,
  created_by_name TEXT,
  updated_at      TEXT NOT NULL,
  updated_by      TEXT,
  updated_by_name TEXT
);

-- Endereço antigo de uma landing page: responde 301 para o atual (SEO.md §1.8).
CREATE TABLE IF NOT EXISTS landing_redirects (
  old_slug    TEXT PRIMARY KEY,
  page_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- Configuração geral do site (nome, logo, favicon, Google Tag Manager). Chave e valor:
-- campo novo não pede migração. Linha ausente = vale o padrão do código.
CREATE TABLE IF NOT EXISTS site_settings (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  updated_by_name TEXT
);

-- Perfil comercial do lead, pelo tamanho do time (lib/leads.ts, leadProfile):
-- 'comercial', 'sem_perfil' ou NULL (formulário sem a pergunta).
ALTER TABLE leads ADD COLUMN profile TEXT;
CREATE INDEX IF NOT EXISTS leads_profile_created ON leads (profile, created_at DESC);
