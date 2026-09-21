import "server-only";
import { getDb, MINUTE } from "./db";

// Limite de tentativas em D1 (não há KV no projeto). O D1 é um SQLite único com
// escrita serializada, então o contador é exato — sem corrida.
// A chave nunca guarda e-mail ou IP em claro: quem chama passa um HMAC.

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

function windowLabel(windowMinutes: number): string {
  const size = windowMinutes * MINUTE;
  return new Date(Math.floor(Date.now() / size) * size).toISOString();
}

export async function checkRateLimit(
  bucket: string,
  { limit, windowMinutes, blockMinutes = windowMinutes }: { limit: number; windowMinutes: number; blockMinutes?: number },
): Promise<RateLimitResult> {
  const db = await getDb();
  const label = windowLabel(windowMinutes);

  const row = await db
    .prepare(
      `INSERT INTO admin_rate_limits (bucket, window_start, count, blocked_until)
       VALUES (?1, ?2, 1, NULL)
       ON CONFLICT(bucket) DO UPDATE SET
         count = CASE WHEN admin_rate_limits.window_start = ?2 THEN admin_rate_limits.count + 1 ELSE 1 END,
         window_start = ?2,
         blocked_until = CASE WHEN admin_rate_limits.window_start = ?2 THEN admin_rate_limits.blocked_until ELSE NULL END
       RETURNING count, blocked_until`,
    )
    .bind(bucket, label)
    .first<{ count: number; blocked_until: string | null }>();

  const blockedUntil = row?.blocked_until ? new Date(row.blocked_until).getTime() : 0;
  if (blockedUntil > Date.now()) {
    return { ok: false, retryAfterSeconds: Math.ceil((blockedUntil - Date.now()) / 1000) };
  }

  if ((row?.count ?? 0) > limit) {
    const until = new Date(Date.now() + blockMinutes * MINUTE).toISOString();
    await db.prepare("UPDATE admin_rate_limits SET blocked_until = ? WHERE bucket = ?").bind(until, bucket).run();
    return { ok: false, retryAfterSeconds: blockMinutes * 60 };
  }

  return { ok: true };
}

/** Zera o contador depois de um acerto, para não punir quem só errou a senha antes. */
export async function clearRateLimit(bucket: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM admin_rate_limits WHERE bucket = ?").bind(bucket).run();
}

/**
 * Faxina oportunista: roda de vez em quando ao fim de um login, sem cron.
 * Remove janelas velhas, códigos vencidos e sessões expiradas há mais de 30 dias.
 */
export async function purgeExpired(): Promise<void> {
  if (Math.random() > 0.02) return;
  const db = await getDb();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * MINUTE).toISOString();
  try {
    await db.batch([
      db.prepare("DELETE FROM admin_rate_limits WHERE window_start < ?").bind(cutoff),
      db.prepare("DELETE FROM admin_codes WHERE expires_at < ?").bind(cutoff),
      db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").bind(cutoff),
    ]);
  } catch (error) {
    console.error("[admin] falha na faxina", error);
  }
}
