-- Área interna (/admin): usuários com acesso, aparelhos reconhecidos, sessões,
-- códigos de verificação por e-mail, limite de tentativas e trilha de auditoria.
-- Mesmo banco dos leads (binding LEADS_DB). Datas em ISO 8601 UTC, como em 0001.
--
-- Nenhuma senha entra aqui: os superadmins nascem com password_hash NULL e definem
-- a senha pelo fluxo "esqueci minha senha" (código por e-mail).

CREATE TABLE IF NOT EXISTS admin_users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,                   -- sempre em minúsculas
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin',   -- 'admin' hoje; 'editor'/'leitor' depois
  is_superadmin   INTEGER NOT NULL DEFAULT 0,      -- 1 = não pode ser apagado nem rebaixado
  status          TEXT NOT NULL DEFAULT 'ativo',   -- ativo | suspenso
  password_hash   TEXT,                            -- NULL = ainda não definiu senha
  password_set_at TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  created_by      TEXT,
  last_login_at   TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email  ON admin_users (email);
CREATE INDEX        IF NOT EXISTS admin_users_status ON admin_users (status);

-- Um "aparelho" é, na prática, um cookie de longa duração (py_dispositivo): nenhum
-- navegador expõe identificador de máquina. Limpar cookies = aparelho novo.
CREATE TABLE IF NOT EXISTS admin_devices (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,        -- HMAC-SHA256(segredo, valor do cookie)
  label        TEXT NOT NULL,        -- "Chrome no Windows", derivado do user-agent
  ua_hash      TEXT,                 -- HMAC do user-agent: cookie em outro navegador pede código
  user_agent   TEXT,
  created_at   TEXT NOT NULL,
  trusted_at   TEXT,                 -- quando o código de verificação foi aceito
  last_seen_at TEXT,
  last_ip_hash TEXT,                 -- HMAC do IP, nunca o IP em claro
  revoked_at   TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_devices_token ON admin_devices (token_hash);
CREATE INDEX        IF NOT EXISTS admin_devices_user  ON admin_devices (user_id, revoked_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id           TEXT PRIMARY KEY,     -- HMAC-SHA256(segredo, token do cookie)
  user_id      TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  device_id    TEXT REFERENCES admin_devices(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT,
  ip_hash      TEXT,
  user_agent   TEXT
);
CREATE INDEX IF NOT EXISTS admin_sessions_user    ON admin_sessions (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS admin_sessions_expires ON admin_sessions (expires_at);

-- Códigos de 6 dígitos (kind='dispositivo') e tokens longos de convite/recuperação.
-- Guardados como HMAC com segredo fora do banco: 10^6 combinações seriam quebradas
-- na hora se fosse um hash simples num vazamento de banco.
CREATE TABLE IF NOT EXISTS admin_codes (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,         -- dispositivo | convite | recuperacao
  code_hash   TEXT NOT NULL,
  device_id   TEXT REFERENCES admin_devices(id) ON DELETE CASCADE,
  sent_to     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  consumed_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_codes_hash   ON admin_codes (code_hash);
CREATE INDEX        IF NOT EXISTS admin_codes_lookup ON admin_codes (user_id, kind, consumed_at, expires_at DESC);
CREATE INDEX        IF NOT EXISTS admin_codes_purge  ON admin_codes (expires_at);

-- Limite de tentativas. Janela fixa; a chave nunca guarda e-mail ou IP em claro.
CREATE TABLE IF NOT EXISTS admin_rate_limits (
  bucket        TEXT PRIMARY KEY,    -- 'login:email:<hmac>', 'codigo:envio:user:<id>', ...
  window_start  TEXT NOT NULL,
  count         INTEGER NOT NULL,
  blocked_until TEXT
);
CREATE INDEX IF NOT EXISTS admin_rate_limits_window ON admin_rate_limits (window_start);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  actor_id    TEXT,
  actor_email TEXT,                  -- copiado no momento do evento: sobrevive à exclusão
  action      TEXT NOT NULL,         -- login.ok | login.falha | codigo.enviado | codigo.ok |
                                     -- usuario.criar | usuario.editar | usuario.remover |
                                     -- aparelho.revogar | sessao.revogar | leads.exportar
  target_type TEXT,
  target_id   TEXT,
  detail      TEXT,                  -- JSON curto, sem dado sensível
  ip_hash     TEXT,
  user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS admin_audit_created ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_actor   ON admin_audit_log (actor_id, created_at DESC);

-- Proteção do superadmin no próprio banco, além da checagem no código.
CREATE TRIGGER IF NOT EXISTS admin_users_no_delete_superadmin
BEFORE DELETE ON admin_users FOR EACH ROW WHEN OLD.is_superadmin = 1
BEGIN SELECT RAISE(ABORT, 'superadmin nao pode ser removido'); END;

CREATE TRIGGER IF NOT EXISTS admin_users_no_demote_superadmin
BEFORE UPDATE ON admin_users FOR EACH ROW
WHEN OLD.is_superadmin = 1
 AND (NEW.is_superadmin <> 1 OR NEW.status <> 'ativo' OR NEW.role <> 'admin')
BEGIN SELECT RAISE(ABORT, 'superadmin nao pode ser rebaixado nem suspenso'); END;

-- Superadmins fixos. INSERT OR IGNORE: rodar a migração de novo não duplica nem
-- sobrescreve a senha já definida.
INSERT OR IGNORE INTO admin_users
  (id, email, name, role, is_superadmin, status, password_hash, created_at, updated_at)
VALUES
  ('usr_sa_pablo_b300', 'pablo@b300.com.br',   'Pablo',      'admin', 1, 'ativo', NULL,
   '2026-09-21T00:00:00.000Z', '2026-09-21T00:00:00.000Z'),
  ('usr_sa_pablo_davi', 'pablodavi@gmail.com', 'Pablo Davi', 'admin', 1, 'ativo', NULL,
   '2026-09-21T00:00:00.000Z', '2026-09-21T00:00:00.000Z');
