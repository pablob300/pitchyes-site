import { audit } from "@/lib/admin/audit";
import { issueCode } from "@/lib/admin/codes";
import { sendAdminMail } from "@/lib/admin/mail";
import { resetEmail } from "@/lib/admin/mail-templates";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import { assertSameOrigin, emailBucket, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { findUserByEmail, normalizeEmail } from "@/lib/admin/users";
import { getSiteUrl } from "@/lib/site";

// "Esqueci minha senha" — e também o primeiro acesso de quem ainda não tem senha
// (os dois superadmins nascem assim). A resposta é sempre a mesma, exista ou não
// o e-mail: senão a tela vira um detector de contas.
export const dynamic = "force-dynamic";

const ALWAYS = "Se esse e-mail tiver acesso ao painel, enviamos um link em instantes.";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const body = await readJson<{ email?: string }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const email = normalizeEmail(String(body.email ?? ""));
  if (!email) return jsonOk({ message: ALWAYS });

  const limit = await checkRateLimit(`recuperar:${await emailBucket(email)}`, { limit: 3, windowMinutes: 60 });
  if (!limit.ok) return jsonOk({ message: ALWAYS });

  const user = await findUserByEmail(email);
  if (user && user.status === "ativo") {
    const token = await issueCode({ userId: user.id, kind: "recuperacao", sentTo: user.email });
    const url = new URL(`/admin/definir-senha?u=${user.id}&t=${token}`, getSiteUrl()).toString();
    const mail = resetEmail(url);
    const sent = await sendAdminMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
    await audit({
      action: "codigo.enviado",
      actorId: user.id,
      actorEmail: user.email,
      detail: { tipo: "recuperacao", entregue: sent.ok },
      request,
    });
  }

  return jsonOk({ message: ALWAYS });
}
