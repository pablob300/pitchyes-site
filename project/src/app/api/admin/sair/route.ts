import { cookies } from "next/headers";
import { audit } from "@/lib/admin/audit";
import { PENDING_COOKIE, SESSION_COOKIE } from "@/lib/admin/config";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { getSession, revokeAllSessions, revokeSession } from "@/lib/admin/session";

// Sair deste aparelho ou de todos. A confiança do aparelho é mantida: sair não é
// o mesmo que desconhecer a máquina — para isso existe "remover aparelho".
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const body = (await readJson<{ todos?: boolean }>(request)) ?? {};
  const session = await getSession();

  if (session) {
    if (body.todos) {
      await revokeAllSessions(session.userId);
      await audit({ action: "sessao.encerrada.todas", actorId: session.userId, actorEmail: session.user.email, request });
    } else {
      await revokeSession(session.id);
      await audit({ action: "sessao.encerrada", actorId: session.userId, actorEmail: session.user.email, request });
    }
  }

  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(PENDING_COOKIE);
  return jsonOk({ destino: "/admin/entrar" });
}
