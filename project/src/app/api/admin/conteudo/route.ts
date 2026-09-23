import { revalidatePath } from "next/cache";
import { audit, type AuditAction } from "@/lib/admin/audit";
import {
  discardDraft,
  openDraft,
  publishDraft,
  restoreVersion,
  saveDraft,
  setAtPointer,
  unsetAtPointer,
  type Actor,
} from "@/lib/admin/content";
import { stampPageUpdated } from "@/lib/admin/pages";
import {
  assertSameOrigin,
  jsonError,
  jsonOk,
  MAX_CONTENT_BODY,
  readJson,
} from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { SITE_CONTENT_PATH } from "@/content/site";
import { invalidHomeSections, invalidSiteSections } from "@/lib/content/resolve";
import { parseOverride } from "@/lib/content/merge";
import { writableContentPaths } from "@/lib/content/pages";

// Salva, publica, descarta e restaura o conteúdo de uma página.
//
// Mesmo molde de api/admin/paginas: mesma origem → sessão → capacidade → validação →
// 422 com mapa de erros → banco → revalidação → auditoria.
export const dynamic = "force-dynamic";

type Body = {
  caminho?: string;
  acao?: "salvar" | "limpar" | "publicar" | "descartar" | "restaurar";
  rev?: number;
  campos?: { ponteiro?: string; valor?: unknown }[];
  versao?: string;
};

/** Nomes das seções como aparecem na tela, para a mensagem de erro fazer sentido. */
const SECTION_LABELS: Record<string, string> = {
  hero: "Topo",
  clientLogos: "Logos de clientes",
  platform: "Plataforma",
  latency: "Latência",
  testimonials: "Depoimentos",
  rollout: "Implantação",
  security: "Segurança",
  useCases: "Casos de uso",
  faq: "Perguntas frequentes",
  finalCta: "Faixa de CTA",
  clients: "Parede de logos",
};

function label(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

function invalidSections(path: string, data: unknown): string[] {
  return path === SITE_CONTENT_PATH ? invalidSiteSections(data) : invalidHomeSections(data);
}

/** O conteúdo global aparece em todas as páginas, então a revalidação é do layout. */
function revalidate(path: string): void {
  if (path === SITE_CONTENT_PATH) revalidatePath("/", "layout");
  else revalidatePath(path);
}

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const user = auth.session.user;
  if (!can(user, "conteudo.editar")) return jsonError("Sem permissão.", 403);
  const actor: Actor = { id: user.id, name: user.name, email: user.email };

  const body = await readJson<Body>(request, MAX_CONTENT_BODY);
  if (!body) return jsonError("Envio inválido ou grande demais.", 400);

  const path = String(body.caminho ?? "");
  if (!writableContentPaths().includes(path)) return jsonError("Página desconhecida.", 404);

  const done = async (action: AuditAction, detail: Record<string, unknown>) => {
    await audit({
      action,
      actorId: actor.id,
      actorEmail: actor.email,
      targetType: "conteudo",
      targetId: path,
      detail,
      request,
    });
  };

  switch (body.acao) {
    case "limpar":
    case "salvar": {
      const limpando = body.acao === "limpar";
      const campos = Array.isArray(body.campos) ? body.campos : [];
      if (campos.length === 0) return jsonError("Nada para salvar.", 400);

      const patches: { pointer: string; value?: unknown; unset?: boolean }[] = [];
      for (const campo of campos) {
        const pointer = String(campo.ponteiro ?? "");
        if (!pointer) return jsonError("Campo sem endereço.", 400);
        // Ponteiro com índice criaria lista esparsa: para mexer num item, o painel
        // manda a lista inteira (ver setAtPointer).
        if (pointer.split(".").some((part) => /^\d+$/.test(part))) {
          return jsonError(`Envie a lista inteira, não o item: ${pointer}`, 400);
        }
        patches.push(
          limpando ? { pointer, unset: true } : { pointer, value: campo.valor },
        );
      }

      const state = await openDraft(path, actor);
      const rev = typeof body.rev === "number" ? body.rev : state.rev;

      // Conferência antes de gravar: melhor recusar aqui do que deixar publicar algo
      // que o site vai descartar em silêncio e devolver ao padrão do código.
      const candidate = structuredClone(
        (typeof state.data === "object" && state.data !== null ? state.data : {}) as Record<
          string,
          unknown
        >,
      );
      try {
        for (const patch of patches) {
          if (patch.unset) unsetAtPointer(candidate, patch.pointer);
          else setAtPointer(candidate, patch.pointer, patch.value);
        }
      } catch {
        return jsonError("Campo com endereço inválido.", 400);
      }
      const invalid = invalidSections(path, candidate);
      if (invalid.length > 0) {
        return jsonError(
          `Faltou preencher algo em: ${invalid.map(label).join(", ")}.`,
          422,
          { errors: Object.fromEntries(invalid.map((s) => [s, "Seção incompleta."])) },
        );
      }

      const result = await saveDraft(path, patches, rev, actor);
      if (!result.ok) {
        return jsonError(
          result.conflictWith
            ? `${result.conflictWith} salvou uma alteração. Recarregue para não perder o trabalho.`
            : "O rascunho mudou. Recarregue a página.",
          409,
        );
      }

      await done("conteudo.salvo", {
        campos: patches.map((p) => p.pointer),
        acao: limpando ? "voltar ao padrão" : "editar",
      });
      return jsonOk({
        rev: result.rev,
        message: limpando ? "Seção de volta ao padrão do código." : "Rascunho salvo.",
      });
    }

    case "publicar": {
      const state = await openDraft(path, actor);
      const invalid = invalidSections(path, state.data);
      if (invalid.length > 0) {
        return jsonError(`Corrija antes de publicar: ${invalid.map(label).join(", ")}.`, 422);
      }

      const { published } = await publishDraft(path, actor);
      if (!published) return jsonError("Não há rascunho para publicar.", 400);

      revalidate(path);
      // A data de revisão alimenta o <lastmod> do sitemap: publicar texto novo sem
      // mexer nela faria o site dizer que a página não muda desde sempre.
      if (path !== SITE_CONTENT_PATH) {
        await stampPageUpdated(path, today(), { id: actor.id, name: actor.name });
      }

      await done("conteudo.publicado", {});
      return jsonOk({ message: "Conteúdo publicado." });
    }

    case "descartar": {
      await discardDraft(path);
      await done("conteudo.descartado", {});
      return jsonOk({ message: "Rascunho descartado." });
    }

    case "restaurar": {
      const versao = String(body.versao ?? "");
      if (!versao) return jsonError("Informe a versão.", 400);
      const ok = await restoreVersion(path, versao, actor);
      if (!ok) return jsonError("Versão não encontrada.", 404);
      await done("conteudo.restaurado", { versao });
      return jsonOk({ message: "Versão trazida para o rascunho." });
    }

    default:
      return jsonError("Ação desconhecida.", 400);
  }
}

/** Estado atual do rascunho, para o painel abrir já sabendo o `rev` e quem está editando. */
export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const user = auth.session.user;
  if (!can(user, "conteudo.editar")) return jsonError("Sem permissão.", 403);

  const path = new URL(request.url).searchParams.get("caminho") ?? "";
  if (!writableContentPaths().includes(path)) return jsonError("Página desconhecida.", 404);

  const state = await openDraft(path, {
    id: user.id,
    name: user.name,
    email: user.email,
  });
  return jsonOk({
    rev: state.rev,
    dados: state.data,
    editadoEm: state.updatedAt,
    editadoPor: state.updatedByName,
    trancadoPor: state.lockedByName,
    invalidas: invalidSections(path, parseOverride(JSON.stringify(state.data))),
  });
}
