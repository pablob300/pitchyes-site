import { cookies } from "next/headers";
import { audit } from "@/lib/admin/audit";
import { issueCode } from "@/lib/admin/codes";
import { ADMIN_HOME, CODE_TTL_MINUTES, DEVICE_COOKIE, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/admin/config";
import { signPending } from "@/lib/admin/cookie";
import { randomToken, verifyPassword } from "@/lib/admin/crypto";
import { getAdminSecret, MINUTE } from "@/lib/admin/db";
import { findOrCreateDevice, labelFromUserAgent } from "@/lib/admin/devices";
import { sendAdminMail } from "@/lib/admin/mail";
import { deviceCodeEmail } from "@/lib/admin/mail-templates";
import { checkRateLimit, clearRateLimit, purgeExpired } from "@/lib/admin/rate-limit";
import {
  assertSameOrigin,
  clientIpHash,
  cookieOptions,
  emailBucket,
  jsonError,
  jsonOk,
  readJson,
  safeNext,
} from "@/lib/admin/request";
import { createSession } from "@/lib/admin/session";
import { findUserByEmail, markLogin, normalizeEmail, setPassword } from "@/lib/admin/users";

// Primeiro passo do acesso: e-mail e senha. Aparelho já confiável entra direto;
// aparelho novo recebe um código por e-mail.
export const dynamic = "force-dynamic";

const GENERIC = "E-mail ou senha incorretos.";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const body = await readJson<{ email?: string; senha?: string; next?: string }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.senha ?? "");
  if (!email || !password) return jsonError(GENERIC, 401);

  const ipHash = await clientIpHash(request);
  const userAgent = request.headers.get("user-agent");

  const byEmail = await checkRateLimit(await emailBucket(email), { limit: 8, windowMinutes: 15 });
  if (!byEmail.ok) {
    await audit({ action: "login.bloqueado", actorEmail: email, request });
    return jsonError("Muitas tentativas. Tente de novo em alguns minutos.", 429);
  }
  if (ipHash) {
    const byIp = await checkRateLimit(`login:ip:${ipHash}`, { limit: 30, windowMinutes: 15 });
    if (!byIp.ok) return jsonError("Muitas tentativas. Tente de novo em alguns minutos.", 429);
  }

  const user = await findUserByEmail(email);
  // A verificação roda mesmo sem usuário, com um hash de mentira: o tempo de
  // resposta não pode denunciar quais e-mails existem.
  const check = await verifyPassword(password, user?.password_hash ?? null);
  if (!user || !check.ok || user.status !== "ativo") {
    await audit({ action: "login.falha", actorId: user?.id, actorEmail: email, request });
    return jsonError(GENERIC, 401);
  }

  if (check.needsRehash) await setPassword(user.id, password);
  await clearRateLimit(await emailBucket(email));

  const jar = await cookies();
  let deviceToken = jar.get(DEVICE_COOKIE)?.value;
  if (!deviceToken) {
    deviceToken = randomToken(32);
    jar.set(DEVICE_COOKIE, deviceToken, cookieOptions(180 * 24 * 60 * 60));
  }

  const { device, trusted } = await findOrCreateDevice({
    userId: user.id,
    token: deviceToken,
    userAgent,
    ipHash,
  });

  if (trusted) {
    const session = await createSession({ userId: user.id, deviceId: device.id, ipHash, userAgent });
    jar.set(SESSION_COOKIE, session.cookieValue, cookieOptions(session.maxAge));
    jar.delete(PENDING_COOKIE);
    await markLogin(user.id);
    await audit({ action: "login.ok", actorId: user.id, actorEmail: user.email, detail: { aparelho: device.label }, request });
    await purgeExpired();
    return jsonOk({ destino: safeNext(body.next ?? ADMIN_HOME) });
  }

  // Aparelho novo: código por e-mail antes de liberar.
  const code = await issueCode({ userId: user.id, kind: "dispositivo", deviceId: device.id, sentTo: user.email });
  const mail = deviceCodeEmail(code, labelFromUserAgent(userAgent));
  const sent = await sendAdminMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
  await audit({
    action: "codigo.enviado",
    actorId: user.id,
    actorEmail: user.email,
    detail: { aparelho: device.label, entregue: sent.ok },
    request,
  });

  jar.set(
    PENDING_COOKIE,
    await signPending(getAdminSecret(), user.id, Math.floor((Date.now() + 10 * MINUTE) / 1000)),
    cookieOptions(10 * 60),
  );

  return jsonOk({
    etapa: "codigo",
    destino: safeNext(body.next ?? ADMIN_HOME),
    email: maskEmail(user.email),
    validoPorMinutos: CODE_TTL_MINUTES,
  });
}

/** p•••@dominio.com — confirma para a pessoa qual caixa olhar sem expor o endereço. */
function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const head = name.slice(0, 1);
  return `${head}${"•".repeat(Math.max(2, Math.min(name.length - 1, 5)))}@${domain}`;
}
