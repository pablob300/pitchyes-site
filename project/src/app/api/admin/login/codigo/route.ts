import { cookies } from "next/headers";
import { audit } from "@/lib/admin/audit";
import { consumeCode } from "@/lib/admin/codes";
import { ADMIN_HOME, DEVICE_COOKIE, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/admin/config";
import { readPending } from "@/lib/admin/cookie";
import { getAdminSecret } from "@/lib/admin/db";
import { findOrCreateDevice, trustDevice } from "@/lib/admin/devices";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import {
  assertSameOrigin,
  clientIpHash,
  cookieOptions,
  jsonError,
  jsonOk,
  readJson,
  safeNext,
} from "@/lib/admin/request";
import { createSession } from "@/lib/admin/session";
import { getUser, markLogin } from "@/lib/admin/users";

// Segundo passo: o código de 6 dígitos que libera o aparelho.
// A sessão nasce só aqui, com identificador novo — nada do passo anterior é
// reaproveitado, então não há fixação de sessão.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const body = await readJson<{ codigo?: string; next?: string }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const jar = await cookies();
  const userId = await readPending(getAdminSecret(), jar.get(PENDING_COOKIE)?.value);
  if (!userId) return jsonError("Sessão de acesso expirou. Entre de novo.", 440);

  const limit = await checkRateLimit(`codigo:conferir:${userId}`, { limit: 10, windowMinutes: 15 });
  if (!limit.ok) return jsonError("Muitas tentativas. Peça um código novo em alguns minutos.", 429);

  const user = await getUser(userId);
  if (!user || user.status !== "ativo") return jsonError("Sessão de acesso expirou. Entre de novo.", 440);

  const result = await consumeCode({ userId, kind: "dispositivo", code: String(body.codigo ?? "") });
  if (!result.ok) {
    await audit({ action: "codigo.falha", actorId: user.id, actorEmail: user.email, detail: { motivo: result.reason }, request });
    const message =
      result.reason === "expirado"
        ? "O código expirou. Peça um novo."
        : result.reason === "tentativas"
          ? "Código bloqueado por excesso de tentativas. Peça um novo."
          : "Código incorreto.";
    return jsonError(message, 422);
  }

  const userAgent = request.headers.get("user-agent");
  const ipHash = await clientIpHash(request);

  // O aparelho que recebe a confiança é o do código; se o cookie sumiu no meio do
  // caminho, recriamos a ligação a partir do cookie atual.
  let deviceId = result.deviceId;
  const deviceToken = jar.get(DEVICE_COOKIE)?.value;
  if (!deviceId && deviceToken) {
    const { device } = await findOrCreateDevice({ userId, token: deviceToken, userAgent, ipHash });
    deviceId = device.id;
  }
  if (deviceId) await trustDevice(deviceId, userAgent);

  const session = await createSession({ userId, deviceId, ipHash, userAgent });
  jar.set(SESSION_COOKIE, session.cookieValue, cookieOptions(session.maxAge));
  jar.delete(PENDING_COOKIE);
  await markLogin(userId);
  await audit({ action: "codigo.ok", actorId: user.id, actorEmail: user.email, request });
  await audit({ action: "login.ok", actorId: user.id, actorEmail: user.email, request });

  return jsonOk({ destino: safeNext(body.next ?? ADMIN_HOME) });
}
