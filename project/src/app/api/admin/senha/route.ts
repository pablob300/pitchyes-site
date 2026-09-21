import { cookies } from "next/headers";
import { audit } from "@/lib/admin/audit";
import { consumeCode } from "@/lib/admin/codes";
import { ADMIN_HOME, DEVICE_COOKIE, MIN_PASSWORD_LENGTH, SESSION_COOKIE } from "@/lib/admin/config";
import { randomToken } from "@/lib/admin/crypto";
import { findOrCreateDevice, trustDevice } from "@/lib/admin/devices";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import {
  assertSameOrigin,
  clientIpHash,
  cookieOptions,
  jsonError,
  jsonOk,
  readJson,
} from "@/lib/admin/request";
import { createSession, revokeAllSessions } from "@/lib/admin/session";
import { getUser, markLogin, normalizeEmail, setPassword } from "@/lib/admin/users";

// Define a senha a partir do link enviado por e-mail (primeiro acesso ou recuperação).
// Quem abre o link provou ter a caixa de entrada — a mesma prova que o código daria.
// Por isso o aparelho já sai confiável e a sessão é criada na hora.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const body = await readJson<{ usuario?: string; token?: string; senha?: string; confirmacao?: string }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const userId = String(body.usuario ?? "");
  const token = String(body.token ?? "");
  const password = String(body.senha ?? "");
  const confirmation = String(body.confirmacao ?? "");

  const errors: Record<string, string> = {};
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.senha = `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password !== confirmation) errors.confirmacao = "As senhas não são iguais.";
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, message: "Confira os campos destacados.", errors }, { status: 422 });
  }

  if (!userId || !token) return jsonError("Link inválido ou vencido. Peça outro.", 422);

  const limit = await checkRateLimit(`senha:definir:${userId}`, { limit: 10, windowMinutes: 30 });
  if (!limit.ok) return jsonError("Muitas tentativas. Tente de novo em alguns minutos.", 429);

  const user = await getUser(userId);
  if (!user || user.status !== "ativo") return jsonError("Link inválido ou vencido. Peça outro.", 422);

  const kinds = ["recuperacao", "convite"] as const;
  let accepted = false;
  for (const kind of kinds) {
    const result = await consumeCode({ userId, kind, code: token });
    if (result.ok) {
      accepted = true;
      break;
    }
  }
  if (!accepted) return jsonError("Link inválido ou vencido. Peça outro.", 422);

  await setPassword(userId, password);
  // Trocar a senha derruba o que existia: se alguém já estava dentro, sai.
  await revokeAllSessions(userId);
  await audit({ action: "senha.definida", actorId: user.id, actorEmail: user.email, request });

  const jar = await cookies();
  const userAgent = request.headers.get("user-agent");
  const ipHash = await clientIpHash(request);

  let deviceToken = jar.get(DEVICE_COOKIE)?.value;
  if (!deviceToken) {
    deviceToken = randomToken(32);
    jar.set(DEVICE_COOKIE, deviceToken, cookieOptions(180 * 24 * 60 * 60));
  }
  const { device } = await findOrCreateDevice({ userId, token: deviceToken, userAgent, ipHash });
  await trustDevice(device.id, userAgent);

  const session = await createSession({ userId, deviceId: device.id, ipHash, userAgent });
  jar.set(SESSION_COOKIE, session.cookieValue, cookieOptions(session.maxAge));
  await markLogin(userId);
  await audit({ action: "login.ok", actorId: user.id, actorEmail: normalizeEmail(user.email), request });

  return jsonOk({ destino: ADMIN_HOME });
}
