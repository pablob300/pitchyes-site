import { audit } from "@/lib/admin/audit";
import { editablePaths, resetPageMeta, savePageMeta } from "@/lib/admin/pages";
import { assertSameOrigin, jsonError, jsonOk, readJson } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";

// Salva (ou zera) os metadados de uma página.
// O caminho é conferido contra a lista de rotas do site: a API não escreve
// metadado para um endereço que não existe.
export const dynamic = "force-dynamic";

const MAX_TITLE = 70;
const MAX_DESCRIPTION = 200;
const MIN_DESCRIPTION = 50;

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const actor = auth.session.user;
  if (!can(actor, "paginas.editar")) return jsonError("Sem permissão.", 403);

  const body = await readJson<{
    caminho?: string;
    titulo?: string;
    descricao?: string;
    ogTitulo?: string;
    ogDescricao?: string;
    imagem?: string;
    imagemAlt?: string;
    noindex?: boolean;
    revisadoEm?: string;
    restaurar?: boolean;
  }>(request);
  if (!body) return jsonError("Envio inválido.", 400);

  const path = String(body.caminho ?? "");
  if (!editablePaths().includes(path)) return jsonError("Página desconhecida.", 404);

  if (body.restaurar) {
    await resetPageMeta(path);
    await audit({
      action: "usuario.editado",
      actorId: actor.id,
      actorEmail: actor.email,
      targetType: "pagina",
      targetId: path,
      detail: { acao: "restaurar padrão" },
      request,
    });
    return jsonOk({ message: "Página devolvida ao padrão do código." });
  }

  const errors: Record<string, string> = {};
  const title = String(body.titulo ?? "").trim();
  const description = String(body.descricao ?? "").trim();
  const image = String(body.imagem ?? "").trim();
  const updated = String(body.revisadoEm ?? "").trim();

  if (title.length > MAX_TITLE) errors.titulo = `O título passou de ${MAX_TITLE} caracteres.`;
  if (description && description.length < MIN_DESCRIPTION) {
    errors.descricao = `A descrição está curta demais (mínimo de ${MIN_DESCRIPTION} caracteres).`;
  }
  if (description.length > MAX_DESCRIPTION) errors.descricao = `A descrição passou de ${MAX_DESCRIPTION} caracteres.`;
  // Só imagem do próprio site: apontar para outro domínio entrega o compartilhamento
  // a quem hospeda a imagem e quebra quando aquele site sair do ar.
  if (image && !image.startsWith("/")) errors.imagem = "Use uma imagem do próprio site (caminho começando com /).";
  if (updated && !/^\d{4}-\d{2}-\d{2}$/.test(updated)) errors.revisadoEm = "Data inválida.";

  if (Object.keys(errors).length) {
    return Response.json({ ok: false, message: "Confira os campos destacados.", errors }, { status: 422 });
  }

  await savePageMeta(
    path,
    {
      title,
      description,
      ogTitle: body.ogTitulo,
      ogDescription: body.ogDescricao,
      imageUrl: image,
      imageAlt: body.imagemAlt,
      noindex: Boolean(body.noindex),
      updated,
    },
    { id: actor.id, name: actor.name },
  );

  await audit({
    action: "usuario.editado",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "pagina",
    targetId: path,
    detail: { titulo: title || null, noindex: Boolean(body.noindex) },
    request,
  });

  return jsonOk({ message: "Metadados salvos. A página publicada atualiza em até um minuto." });
}
