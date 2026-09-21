import { audit } from "@/lib/admin/audit";
import { issueCode } from "@/lib/admin/codes";
import { sendAdminMail } from "@/lib/admin/mail";
import { inviteEmail } from "@/lib/admin/mail-templates";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can, createUser, findUserByEmail, listUsersWithActivity, normalizeEmail, ROLES, type RoleId } from "@/lib/admin/users";
import { getSiteUrl } from "@/lib/site";

// Lista e cria usuários do painel. Quem é criado nasce sem senha e recebe um
// convite por e-mail para definir a dele — nenhuma senha trafega por aqui.
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "usuarios.gerenciar")) return jsonError("Sem permissão.", 403);

  const users = await listUsersWithActivity();
  return jsonOk({ usuarios: users.map((user) => ({ ...user, password_hash: undefined })) });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const actor = auth.session.user;
  if (!can(actor, "usuarios.gerenciar")) return jsonError("Sem permissão.", 403);

  const body = await readJson<{ nome?: string; email?: string; papel?: string }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const name = String(body.nome ?? "").trim();
  const email = normalizeEmail(String(body.email ?? ""));
  const role = (String(body.papel ?? "admin") as RoleId) in ROLES ? (body.papel as RoleId) : "admin";

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.nome = "Escreva o nome completo (mínimo de 3 caracteres).";
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) errors.email = "Informe um e-mail válido.";
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, message: "Confira os campos destacados.", errors }, { status: 422 });
  }

  if (await findUserByEmail(email)) {
    return Response.json(
      { ok: false, message: "Esse e-mail já tem acesso ao painel.", errors: { email: "E-mail já cadastrado." } },
      { status: 409 },
    );
  }

  const user = await createUser({ email, name, role, createdBy: actor.id });

  // Convite: mesmo mecanismo da recuperação de senha, com prazo de 7 dias.
  const token = await issueCode({ userId: user.id, kind: "convite", sentTo: user.email });
  const url = new URL(`/admin/definir-senha?u=${user.id}&t=${token}`, getSiteUrl()).toString();
  const mail = inviteEmail(user.name.split(/\s+/)[0], url);
  const sent = await sendAdminMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });

  await audit({
    action: "usuario.criado",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "usuario",
    targetId: user.id,
    detail: { email: user.email, convite: sent.ok },
    request,
  });

  return jsonOk({
    usuario: { ...user, password_hash: undefined },
    convite: sent.ok
      ? `Convite enviado para ${user.email}.`
      : `Usuário criado, mas o convite não saiu. Use "Reenviar convite" em instantes.`,
  });
}
