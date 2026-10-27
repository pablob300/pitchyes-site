import { revalidatePath } from "next/cache";
import { audit } from "@/lib/admin/audit";
import { getDb, nowIso } from "@/lib/admin/db";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { GTM_ID, type BrandImage } from "@/lib/site-settings";

// Grava a Configuração geral (nome, logo, favicon, Google Tag Manager).
// Mesmo molde das outras rotas do painel: mesma origem → sessão → capacidade →
// validação → banco → revalidação → auditoria. Campo vazio apaga a linha: volta o padrão.
export const dynamic = "force-dynamic";

type Body = {
  siteName?: string;
  gtmId?: string;
  logo?: BrandImage | null;
  favicon?: string | null;
};

/** Só imagem enviada pelo próprio painel (/midia/marca/...) ou arquivo do site (/brand/...). */
const OWN_IMAGE = /^\/(midia\/marca|brand)\/[\w.-]+\.(png|webp|jpg|svg)$/;

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const user = auth.session.user;
  if (!can(user, "configuracoes.editar")) return jsonError("Sem permissão.", 403);

  const body = await readJson<Body>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const errors: Record<string, string> = {};
  const siteName = String(body.siteName ?? "").trim();
  if (siteName.length > 40) errors.siteName = "Use até 40 caracteres.";
  const gtmId = String(body.gtmId ?? "").trim().toUpperCase();
  if (gtmId && !GTM_ID.test(gtmId)) errors.gtmId = "O ID tem o formato GTM-XXXXXXX.";
  const logo = body.logo ?? null;
  if (logo && (!OWN_IMAGE.test(logo.src) || !(logo.width > 0) || !(logo.height > 0))) errors.logo = "Envie o logo pelo botão.";
  const favicon = body.favicon ?? null;
  if (favicon && !OWN_IMAGE.test(favicon)) errors.favicon = "Envie o ícone pelo botão.";
  if (Object.keys(errors).length) return jsonError("Confira os campos destacados.", 422, { errors });

  const values: Record<string, string | null> = {
    siteName: siteName || null,
    gtmId: gtmId || null,
    logo: logo ? JSON.stringify({ src: logo.src, width: Math.round(logo.width), height: Math.round(logo.height) }) : null,
    favicon,
  };

  const db = await getDb();
  const now = nowIso();
  await db.batch(
    Object.entries(values).map(([key, value]) =>
      value === null
        ? db.prepare("DELETE FROM site_settings WHERE key = ?").bind(key)
        : db
            .prepare(
              `INSERT INTO site_settings (key, value, updated_at, updated_by_name) VALUES (?1, ?2, ?3, ?4)
               ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3, updated_by_name = ?4`,
            )
            .bind(key, value, now, user.name),
    ),
  );

  // Nome, logo, favicon e GTM aparecem em todas as páginas.
  revalidatePath("/", "layout");

  await audit({
    action: "configuracoes.salvas",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "configuracoes",
    detail: { nome: values.siteName, gtm: values.gtmId, logo: Boolean(logo), favicon: Boolean(favicon) },
    request,
  });
  return jsonOk({ message: "Configurações salvas. O site já usa os valores novos." });
}
