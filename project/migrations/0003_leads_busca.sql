-- Busca e filtros na Central de leads.
--
-- `search_text` guarda nome, e-mail e empresa já em minúsculas e SEM ACENTO, porque
-- o LIKE do SQLite não dobra acentuação — sem isso, procurar por "jose" não acha
-- "José". A aplicação preenche a coluna ao gravar o lead (ver lib/leads.ts).
--
-- ATENÇÃO: ALTER TABLE ADD COLUMN não aceita "IF NOT EXISTS" no SQLite. Rodar este
-- arquivo duas vezes no mesmo banco dá erro na primeira linha — o resto é idempotente.

ALTER TABLE leads ADD COLUMN search_text TEXT;

-- Linhas antigas: dá para dobrar maiúsculas, mas não acento (o SQLite não tem função
-- para isso). Quem foi gravado antes fica pesquisável sem acento apenas onde já não
-- tinha; leads novos entram com a dobra completa.
UPDATE leads
   SET search_text = lower(name || ' ' || email || ' ' || coalesce(company, ''))
 WHERE search_text IS NULL;

CREATE INDEX IF NOT EXISTS leads_form_created ON leads (form, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_search       ON leads (search_text);
