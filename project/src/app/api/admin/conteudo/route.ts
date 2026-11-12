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
import { invalidInnerSections } from "@/lib/content/inner";
import { invalidHomeSections, invalidSiteSections } from "@/lib/content/resolve";
import { parseOverride } from "@/lib/content/merge";
import { isWritableContentPath, landingIdOf } from "@/lib/admin/content-paths";
import { invalidLandingSections } from "@/lib/content/landing";
import { getLandingById, landingPath, touchLanding } from "@/lib/landing-db";
import { recordChange, type Change } from "@/lib/admin/search-console/changes";

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
  caseHighlight: "Case em destaque",
  testimonials: "Depoimentos",
  rollout: "Implantação",
  security: "Segurança",
  useCases: "Casos de uso",
  faq: "Perguntas frequentes",
  finalCta: "Faixa de CTA",
  clients: "Clientes (logos)",
  sectors: "Setores",
};

function label(section: string, path = ""): string {
  // Landing page: precisa de exatamente um "Topo com formulário" visível (h1 + formulário).
  if (section === "topo" && landingIdOf(path)) return "Topo com formulário (a página precisa de um, visível)";
  // Páginas internas: "topo" e "b3" (4º bloco da página).
  if (section === "topo") return "Topo";
  const block = /^b(\d+)$/.exec(section);
  if (block) return `bloco ${Number(block[1]) + 1}`;
  return SECTION_LABELS[section] ?? section;
}

function invalidSections(path: string, data: unknown): string[] {
  if (path === SITE_CONTENT_PATH) return invalidSiteSections(data);
  if (landingIdOf(path)) return invalidLandingSections(data);
  return path === "/" ? invalidHomeSections(data) : invalidInnerSections(path, data);
}

/** O conteúdo global aparece em todas as páginas, então a revalidação é do layout. */
async function revalidate(path: string): Promise<void> {
  const landingId = landingIdOf(path);
  if (landingId) {
    // Landing page: só a página dela (e ela não entra nos arquivos para IA).
    const page = await getLandingById(landingId);
    if (page) revalidatePath(landingPath(page.slug));
    return;
  }
  if (path === SITE_CONTENT_PATH) revalidatePath("/", "layout");
  else revalidatePath(path);
  // Os arquivos para IA saem do mesmo conteúdo publicado (FAQ da home, texto das páginas).
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
}

/**
 * URLs públicas que mudam ao publicar este conteúdo (rotina de indexação). O conteúdo
 * global (/_site) traz a lista de clientes, que aparece na home e em /clientes.
 */
async function publishedChanges(path: string): Promise<Change[]> {
  const landingId = landingIdOf(path);
  if (landingId) {
    const page = await getLandingById(landingId);
    return page && page.active === 1 && page.noindex === 0
      ? [{ path: landingPath(page.slug), kind: "update", sitemap: "conteudo" }]
      : [];
  }
  const paths = path === SITE_CONTENT_PATH ? ["/", "/clientes"] : [path];
  return paths.map((item) => ({ path: item, kind: "update", sitemap: "paginas" }));
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
  if (!(await isWritableContentPath(path))) return jsonError("Página desconhecida.", 404);

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
          `Faltou preencher algo em: ${invalid.map((s) => label(s, path)).join(", ")}.`,
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
        return jsonError(`Corrija antes de publicar: ${invalid.map((s) => label(s, path)).join(", ")}.`, 422);
      }

      const { published } = await publishDraft(path, actor);
      if (!published) return jsonError("Não há rascunho para publicar.", 400);

      // A data de revisão alimenta o <lastmod> do sitemap: publicar texto novo sem
      // mexer nela faria o site dizer que a página não muda desde sempre.
      const landingId = landingIdOf(path);
      if (landingId) {
        await touchLanding(landingId, { id: actor.id, name: actor.name });
      } else if (path !== SITE_CONTENT_PATH) {
        await stampPageUpdated(path, today(), { id: actor.id, name: actor.name });
      }

      await revalidate(path);
      await recordChange(await publishedChanges(path), actor.email);
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
  if (!(await isWritableContentPath(path))) return jsonError("Página desconhecida.", 404);

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
