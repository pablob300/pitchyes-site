-- Análises do PageSpeed Insights feitas pelo painel (Análise > PageSpeed).
--
-- Cada análise roda mobile e desktop ao mesmo tempo: são duas linhas com o mesmo
-- `batch_id`, que é o que a tela de relatório abre. As notas e métricas ficam em
-- colunas para o histórico listar sem abrir JSON; as auditorias que falharam (e a
-- lista das aprovadas) ficam em `audits_json`, já enxutas — a resposta crua do
-- Google passa de 500 KB e não é guardada.

CREATE TABLE IF NOT EXISTS pagespeed_runs (
  id                 TEXT PRIMARY KEY,
  batch_id           TEXT NOT NULL,
  url                TEXT NOT NULL,
  strategy           TEXT NOT NULL,      -- 'mobile' | 'desktop'
  created_at         TEXT NOT NULL,      -- ISO 8601 UTC
  created_by         TEXT,               -- e-mail de quem pediu
  lighthouse_version TEXT,
  perf               INTEGER,            -- notas 0–100
  a11y               INTEGER,
  best               INTEGER,
  seo                INTEGER,
  fcp_ms             REAL,               -- métricas de laboratório
  lcp_ms             REAL,
  tbt_ms             REAL,
  cls                REAL,
  si_ms              REAL,
  ttfb_ms            REAL,
  field_json         TEXT,               -- dados reais (CrUX), quando o Google tem
  audits_json        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS pagespeed_batch   ON pagespeed_runs (batch_id);
CREATE INDEX IF NOT EXISTS pagespeed_created ON pagespeed_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS pagespeed_url     ON pagespeed_runs (url, created_at DESC);
