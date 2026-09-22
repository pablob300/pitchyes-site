-- Assinaturas da newsletter do rodapé, separadas dos leads.
--
-- Até aqui o formulário do rodapé gravava em `leads` como qualquer outro, e as
-- assinaturas apareciam misturadas na Central de leads. São coisas diferentes: lead
-- é um contato para o comercial trabalhar, com empresa, telefone e interesse;
-- assinatura é um e-mail numa lista que tende a ficar longa. Tabela própria deixa a
-- listagem, a busca e a exportação de cada uma no formato certo.
--
-- O e-mail é único: assinar duas vezes não cria duas linhas, e a data que fica é a
-- da primeira assinatura.

CREATE TABLE IF NOT EXISTS newsletter (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  created_at TEXT NOT NULL,        -- ISO 8601 UTC
  source_url TEXT,
  user_agent TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email   ON newsletter (email);
CREATE INDEX        IF NOT EXISTS newsletter_created ON newsletter (created_at DESC);

-- Leva para cá o que já tinha sido gravado como lead do formulário "newsletter"...
INSERT OR IGNORE INTO newsletter (id, email, created_at, source_url, user_agent)
SELECT id, email, created_at, source_url, user_agent
  FROM leads
 WHERE form = 'newsletter';

-- ...e tira da Central de leads.
DELETE FROM leads WHERE form = 'newsletter';
