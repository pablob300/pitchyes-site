import "server-only";
import { hashPassword } from "./crypto";
import { getDb, newId, nowIso } from "./db";

// Usuários da área interna. Hoje todo mundo é "admin" com acesso total; o registro
// de papéis abaixo é o lugar onde "editor" e "leitor" entram depois, sem caçar
// condicionais espalhadas pelo código.

export type RoleId = "admin";

export const ROLES: Record<RoleId, { label: string; description: string }> = {
  admin: { label: "Admin", description: "Acesso total ao painel" },
};

/** Contas que não podem ser removidas, suspensas nem rebaixadas. */
export const SUPERADMIN_EMAILS = ["pablo@b300.com.br", "pablodavi@gmail.com"];

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  is_superadmin: number;
  status: "ativo" | "suspenso";
  password_hash: string | null;
  password_set_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

/** Tudo que o painel precisa saber de quem está logado — sem o hash da senha. */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  isSuperadmin: boolean;
};

export function toSessionUser(user: AdminUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isSuperadmin: user.is_superadmin === 1,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSuperadminEmail(email: string): boolean {
  return SUPERADMIN_EMAILS.includes(normalizeEmail(email));
}

/**
 * Toda permissão é `true` para admin hoje. A assinatura já recebe a capacidade
 * para que "editor" e "leitor" entrem sem caçar condicional espalhada.
 */
export function can(user: SessionUser, capability: string): boolean {
  return capability.length >= 0 && user.role === "admin";
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const db = await getDb();
  return db
    .prepare("SELECT * FROM admin_users WHERE email = ?")
    .bind(normalizeEmail(email))
    .first<AdminUser>();
}

export async function getUser(id: string): Promise<AdminUser | null> {
  const db = await getDb();
  return db.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first<AdminUser>();
}

export async function listUsers(): Promise<AdminUser[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM admin_users ORDER BY is_superadmin DESC, name COLLATE NOCASE")
    .all<AdminUser>();
  return results ?? [];
}

export async function createUser({
  email,
  name,
  role = "admin",
  createdBy,
}: {
  email: string;
  name: string;
  role?: RoleId;
  createdBy?: string;
}): Promise<AdminUser> {
  const db = await getDb();
  const at = nowIso();
  const id = newId("usr");
  await db
    .prepare(
      `INSERT INTO admin_users (id, email, name, role, is_superadmin, status, password_hash, created_at, updated_at, created_by)
       VALUES (?, ?, ?, ?, 0, 'ativo', NULL, ?, ?, ?)`,
    )
    .bind(id, normalizeEmail(email), name.trim(), role, at, at, createdBy ?? null)
    .run();
  return (await getUser(id))!;
}

export async function setPassword(userId: string, password: string): Promise<void> {
  const db = await getDb();
  const at = nowIso();
  await db
    .prepare("UPDATE admin_users SET password_hash = ?, password_set_at = ?, updated_at = ? WHERE id = ?")
    .bind(await hashPassword(password), at, at, userId)
    .run();
}

export async function markLogin(userId: string): Promise<void> {
  const db = await getDb();
  await db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").bind(nowIso(), userId).run();
}
