import { revalidatePath } from "next/cache";
import { audit } from "@/lib/admin/audit";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import {
  createLanding,
  getLandingById,
  landingPath,
  SLUG_OK,
  slugTaken,
  updateLanding,
  type LandingPage,
} from "@/lib/landing-db";

// Cria, duplica e edita as landing pages (nome, endereço, SEO, ativa/inativa).
// O CONTEÚDO não passa por aqui: é o editor visual, em /api/admin/conteudo ("/_lp/<id>").
// Mesmo molde das outras rotas do painel: mesma origem → sessão → capacidade → validação
// → banco → revalidação → auditoria.
export const dynamic = "force-dynamic";

type Fields = { nome?: string; slug?: string; seoTitle?: string; seoDescription?: string };
type PostBody = Fields & { acao?: "criar" | "duplicar"; de?: string };
type PatchBody = Fields & { id?: string; ativa?: boolean; noindex?: boolean };

/** Confere os campos enviados; os ausentes (PATCH) não são conferidos. */
async function check(fields: Fields, exceptId?: string, partial = false): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  const has = (value: unknown) => !partial || value !== undefined;
  const nome = String(fields.nome ?? "").trim();
  const slug = String(fields.slug ?? "").trim();
  const title = String(fields.seoTitle ?? "").trim();
  const description = String(fields.seoDescription ?? "").trim();

  if (has(fields.nome) && (nome.length < 2 || nome.length > 80)) errors.nome = "Dê um nome de 2 a 80 caracteres.";
  if (has(fields.slug)) {
    if (slug.length < 2 || slug.length > 60 || !SLUG_OK.test(slug)) {
      errors.slug = "Use de 2 a 60 letras minúsculas, números e hífen (ex.: ia-de-voz-clinicas).";
    } else if (await slugTaken(slug, exceptId)) {
      errors.slug = "Já existe uma landing page com este endereço.";
    }
  }
  if (has(fields.seoTitle) && (title.length < 10 || title.length > 70)) errors.seoTitle = "O título precisa de 10 a 70 caracteres (ideal: até 60).";
  if (has(fields.seoDescription) && (description.length < 50 || description.length > 170)) {
    errors.seoDescription = "A descrição precisa de 50 a 170 caracteres (ideal: 120 a 160).";
  }
  return errors;
}

async function auth(request: Request) {
  if (!assertSameOrigin(request)) return { response: jsonError("Pedido inválido.", 403) };
  const result = await requireApiSession();
  if ("response" in result) return { response: result.response };
  if (!can(result.session.user, "conteudo.editar")) return { response: jsonError("Sem permissão.", 403) };
  const user = result.session.user;
  return { user, actor: { id: user.id, name: user.name } };
}

const view = (page: LandingPage) => ({ id: page.id, slug: page.slug, url: landingPath(page.slug), ativa: page.active === 1 });

export async function POST(request: Request) {
  const session = await auth(request);
  if ("response" in session) return session.response;
  const body = await readJson<PostBody>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const errors = await check(body);
  if (Object.keys(errors).length) return jsonError("Confira os campos destacados.", 422, { errors });

  let copyFrom: string | undefined;
  if (body.acao === "duplicar") {
    const source = body.de ? await getLandingById(body.de) : null;
    if (!source) return jsonError("Página de origem não encontrada.", 404);
    copyFrom = source.id;
  }

  const page = await createLanding(
    {
      name: String(body.nome).trim(),
      slug: String(body.slug).trim(),
      seoTitle: String(body.seoTitle).trim(),
      seoDescription: String(body.seoDescription).trim(),
      copyFrom,
    },
    session.actor,
  );

  await audit({
    action: "landing.criada",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "landing",
    targetId: page.id,
    detail: { slug: page.slug, de: copyFrom ?? "modelo" },
    request,
  });
  return jsonOk({ pagina: view(page), message: "Landing page criada. Ela nasce inativa: ligue quando estiver pronta." });
}

export async function PATCH(request: Request) {
  const session = await auth(request);
  if ("response" in session) return session.response;
  const body = await readJson<PatchBody>(request);
  if (!body?.id) return jsonError("Envio inválido.", 400);

  const current = await getLandingById(body.id);
  if (!current) return jsonError("Landing page não encontrada.", 404);

  const errors = await check(body, current.id, true);
  if (Object.keys(errors).length) return jsonError("Confira os campos destacados.", 422, { errors });

  const page = await updateLanding(
    current,
    {
      ...(body.nome !== undefined ? { name: String(body.nome).trim() } : {}),
      ...(body.slug !== undefined ? { slug: String(body.slug).trim() } : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: String(body.seoTitle).trim() } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: String(body.seoDescription).trim() } : {}),
      ...(typeof body.ativa === "boolean" ? { active: body.ativa } : {}),
      ...(typeof body.noindex === "boolean" ? { noindex: body.noindex } : {}),
    },
    session.actor,
  );

  // O endereço antigo passa a responder 301 e o novo, a página: os dois saem do cache.
  revalidatePath(landingPath(current.slug));
  if (page.slug !== current.slug) revalidatePath(landingPath(page.slug));

  await audit({
    action: "landing.editada",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "landing",
    targetId: page.id,
    detail: { campos: Object.keys(body).filter((k) => k !== "id"), slug: page.slug, ativa: page.active === 1 },
    request,
  });
  return jsonOk({ pagina: view(page), message: "Landing page atualizada." });
}
