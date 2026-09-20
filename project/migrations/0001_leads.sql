-- Leads enviados pelos formulários do site. Um registro por envio.
-- `fields` guarda a resposta completa em JSON, para que um campo novo no formulário
-- não exija migração; as colunas soltas existem só para a listagem em /admin/leads.
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,           -- ISO 8601 em UTC
  form        TEXT NOT NULL,           -- qual formulário originou (ex.: "contato")
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  fields      TEXT NOT NULL,           -- JSON com todos os campos preenchidos
  source_url  TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS leads_created_at ON leads (created_at DESC);
