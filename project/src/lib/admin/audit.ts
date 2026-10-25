import "server-only";
import { getDb, newId, nowIso } from "./db";
import { clientIpHash } from "./request";

// Trilha de auditoria: quem fez o quê no painel. Nunca derruba a ação que estava
// sendo feita — se a gravação falhar, só registra no log do Worker.

export type AuditAction =
  | "login.ok"
  | "login.falha"
  | "login.bloqueado"
  | "codigo.enviado"
  | "codigo.ok"
  | "codigo.falha"
  | "senha.definida"
  | "sessao.encerrada"
  | "sessao.encerrada.todas"
  | "aparelho.revogado"
  | "usuario.criado"
  | "usuario.editado"
  | "usuario.removido"
  | "leads.exportados"
  | "pagina.meta.editada"
  | "midia.enviada"
  | "conteudo.salvo"
  | "conteudo.publicado"
  | "conteudo.descartado"
  | "conteudo.restaurado"
  | "pagespeed.analisada";

export async function audit({
  action,
  actorId,
  actorEmail,
  targetType,
  targetId,
  detail,
  request,
}: {
  action: AuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  detail?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO admin_audit_log (id, created_at, actor_id, actor_email, action, target_type, target_id, detail, ip_hash, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId("log"),
        nowIso(),
        actorId ?? null,
        actorEmail ?? null,
        action,
        targetType ?? null,
        targetId ?? null,
        detail ? JSON.stringify(detail) : null,
        request ? await clientIpHash(request) : null,
        request?.headers.get("user-agent") ?? null,
      )
      .run();
  } catch (error) {
    console.error("[admin] falha ao registrar auditoria", error);
  }
}
