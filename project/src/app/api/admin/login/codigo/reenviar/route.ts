import { cookies } from "next/headers";
import { audit } from "@/lib/admin/audit";
import { issueCode } from "@/lib/admin/codes";
import { CODE_RESEND_SECONDS, DEVICE_COOKIE, PENDING_COOKIE } from "@/lib/admin/config";
import { readPending } from "@/lib/admin/cookie";
import { getAdminSecret } from "@/lib/admin/db";
import { deviceTokenHash, labelFromUserAgent } from "@/lib/admin/devices";
import { getDb } from "@/lib/admin/db";
import { sendAdminMail } from "@/lib/admin/mail";
import { deviceCodeEmail } from "@/lib/admin/mail-templates";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/admin/request";
import { getUser } from "@/lib/admin/users";

// Reenvio do código: no máximo um por minuto e cinco por hora.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const jar = await cookies();
  const userId = await readPending(getAdminSecret(), jar.get(PENDING_COOKIE)?.value);
  if (!userId) return jsonError("Sessão de acesso expirou. Entre de novo.", 440);

  const burst = await checkRateLimit(`codigo:envio:${userId}:burst`, {
    limit: 1,
    windowMinutes: CODE_RESEND_SECONDS / 60,
  });
  if (!burst.ok) return jsonError("Aguarde um instante antes de pedir outro código.", 429);

  const hourly = await checkRateLimit(`codigo:envio:${userId}`, { limit: 5, windowMinutes: 60 });
  if (!hourly.ok) return jsonError("Muitos códigos pedidos. Tente de novo mais tarde.", 429);

  const user = await getUser(userId);
  if (!user || user.status !== "ativo") return jsonError("Sessão de acesso expirou. Entre de novo.", 440);

  const userAgent = request.headers.get("user-agent");
  const deviceToken = jar.get(DEVICE_COOKIE)?.value;
  let deviceId: string | null = null;
  if (deviceToken) {
    const db = await getDb();
    const row = await db
      .prepare("SELECT id FROM admin_devices WHERE token_hash = ? AND user_id = ?")
      .bind(await deviceTokenHash(deviceToken), userId)
      .first<{ id: string }>();
    deviceId = row?.id ?? null;
  }

  const code = await issueCode({ userId, kind: "dispositivo", deviceId, sentTo: user.email });
  const mail = deviceCodeEmail(code, labelFromUserAgent(userAgent));
  const sent = await sendAdminMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
  await audit({
    action: "codigo.enviado",
    actorId: user.id,
    actorEmail: user.email,
    detail: { reenvio: true, entregue: sent.ok },
    request,
  });

  return jsonOk();
}
