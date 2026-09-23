-- Conteúdo editável por página (editor visual).
--
-- Mesma regra do page_meta: isto é SOBREPOSIÇÃO. O padrão continua no código
-- (components/home/content.ts, src/content/*.ts); aqui só vem o que alguém mudou
-- no painel. Apagar a linha devolve a página ao código.
--
-- Duas linhas por página: 'rascunho' (só o painel enxerga) e 'publicado' (o site).
-- `rev` é o trinco: quem salva manda o rev que carregou; se não bater, o painel
-- avisa que outra pessoa salvou antes e recarrega.
--
-- O caminho "/_site" é reservado para o conteúdo global (faixa de CTA final e parede
-- de logos): publicar ali revalida o site inteiro, não uma página.

CREATE TABLE IF NOT EXISTS page_content (
  path            TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('rascunho', 'publicado')),
  schema_version  INTEGER NOT NULL DEFAULT 1,
  rev             INTEGER NOT NULL DEFAULT 1,
  data            TEXT NOT NULL DEFAULT '{}',   -- JSON esparso: só o que foi editado
  updated_at      TEXT NOT NULL,
  updated_by      TEXT,
  updated_by_name TEXT,
  -- Trinco consultivo: mostra "Fulano está editando", nunca bloqueia de verdade.
  locked_by       TEXT,
  locked_by_name  TEXT,
  locked_at       TEXT,
  PRIMARY KEY (path, status)
);

-- Histórico de publicações (data, hora, quem). Append-only; a gaveta de versões lê
-- daqui, e "restaurar" copia a linha de volta para o rascunho.
CREATE TABLE IF NOT EXISTS page_content_versions (
  id              TEXT PRIMARY KEY,
  path            TEXT NOT NULL,
  schema_version  INTEGER NOT NULL DEFAULT 1,
  data            TEXT NOT NULL,
  note            TEXT,
  created_at      TEXT NOT NULL,
  created_by      TEXT,
  created_by_name TEXT
);

CREATE INDEX IF NOT EXISTS page_content_versions_path
  ON page_content_versions (path, created_at DESC);
