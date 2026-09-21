import { audit } from "@/lib/admin/audit";
import { issueCode } from "@/lib/admin/codes";
import { sendAdminMail } from "@/lib/admin/mail";
import { inviteEmail } from "@/lib/admin/mail-templates";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession, revokeAllSessions } from "@/lib/admin/session";
import { can, deleteUser, getUser, ROLES, updateUser, type RoleId } from "@/lib/admin/users";
import { getSiteUrl } from "@/lib/site";

// Editar, reenviar convite e remover um usuário.
// Nenhum campo vem do corpo direto para o SQL: só nome, papel e situação são lidos,
// e is_superadmin não é aceito de jeito nenhum.
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const actor = auth.session.user;
  if (!can(actor, "usuarios.gerenciar")) return jsonError("Sem permissão.", 403);

  const { id } = await params;
  const body = await readJson<{ nome?: string; papel?: string; situacao?: string; reenviarConvite?: boolean }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const alvo = await getUser(id);
  if (!alvo) return jsonError("Usuário não encontrado.", 404);

  // Reenvio de convite para quem ainda não definiu senha.
  if (body.reenviarConvite) {
    if (alvo.password_hash) return jsonError("Esse usuário já definiu a senha.", 409);
    const token = await issueCode({ userId: alvo.id, kind: "convite", sentTo: alvo.email });
    const url = new URL(`/admin/definir-senha?u=${alvo.id}&t=${token}`, getSiteUrl()).toString();
    const mail = inviteEmail(alvo.name.split(/\s+/)[0], url);
    const sent = await sendAdminMail({ to: alvo.email, subject: mail.subject, text: mail.text, html: mail.html });
    await audit({
      action: "usuario.editado",
      actorId: actor.id,
      actorEmail: actor.email,
      targetType: "usuario",
      targetId: alvo.id,
      detail: { convite: "reenviado", entregue: sent.ok },
      request,
    });
    return sent.ok ? jsonOk({ message: `Convite reenviado para ${alvo.email}.` }) : jsonError("Não foi possível enviar o convite agora.", 502);
  }

  const situacao = body.situacao === "suspenso" ? "suspenso" : body.situacao === "ativo" ? "ativo" : undefined;
  const papel = typeof body.papel === "string" && body.papel in ROLES ? (body.papel as RoleId) : undefined;

  // Ninguém se suspende nem se rebaixa sozinho: seria o caminho mais curto para
  // trancar a si mesmo do lado de fora.
  if (alvo.id === actor.id && (situacao === "suspenso" || (papel && papel !== alvo.role))) {
    return jsonError("Você não pode alterar o próprio acesso.", 403);
  }

  const result = await updateUser(id, { name: body.nome, role: papel, status: situacao });
  if (!result.ok) {
    return jsonError(
      result.reason === "protegido"
        ? "Superadmin não pode ser rebaixado nem suspenso."
        : "Usuário não encontrado.",
      result.reason === "protegido" ? 403 : 404,
    );
  }

  // Suspender tira quem estava dentro na hora.
  if (situacao === "suspenso") await revokeAllSessions(id);

  await audit({
    action: "usuario.editado",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "usuario",
    targetId: id,
    detail: { nome: body.nome, papel, situacao },
    request,
  });

  return jsonOk({ usuario: { ...(await getUser(id)), password_hash: undefined } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const actor = auth.session.user;
  if (!can(actor, "usuarios.gerenciar")) return jsonError("Sem permissão.", 403);

  const { id } = await params;
  const alvo = await getUser(id);
  const result = await deleteUser(id, actor.id);
  if (!result.ok) {
    const message =
      result.reason === "protegido"
        ? "Superadmin não pode ser removido."
        : result.reason === "proprio"
          ? "Você não pode remover a própria conta."
          : "Usuário não encontrado.";
    return jsonError(message, result.reason === "inexistente" ? 404 : 403);
  }

  await audit({
    action: "usuario.removido",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "usuario",
    targetId: id,
    detail: { email: alvo?.email },
    request,
  });

  return jsonOk();
}
