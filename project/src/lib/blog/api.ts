import "server-only";
import { assertSameOrigin, jsonError } from "@/lib/admin/request";
import { requireApiSession, type AdminSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import type { Actor } from "./admin";

// Portão comum das rotas /api/admin/blog: sessão conferida no banco, permissão do blog e,
// em escrita, a mesma defesa de origem das demais rotas do painel.
export async function blogAuth(
  request: Request,
  { write = false }: { write?: boolean } = {},
): Promise<{ session: AdminSession; actor: Actor } | { response: Response }> {
  if (write && !assertSameOrigin(request)) return { response: jsonError("Pedido inválido.", 403) };
  const auth = await requireApiSession();
  if ("response" in auth) return auth;
  if (!can(auth.session.user, write ? "blog.editar" : "blog.ver")) return { response: jsonError("Sem permissão.", 403) };
  const { user } = auth.session;
  return { session: auth.session, actor: { id: user.id, email: user.email, name: user.name } };
}
