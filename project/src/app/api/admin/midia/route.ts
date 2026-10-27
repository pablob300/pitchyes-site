import { audit } from "@/lib/admin/audit";
import { getDb, newId, nowIso } from "@/lib/admin/db";
import { imageSize } from "@/lib/admin/image-size";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Upload das imagens do painel. Guarda no R2 (binding MEDIA_BUCKET) e devolve o caminho
// público (/midia/...), que é o que vai para o page_meta ou para o conteúdo da página.
//
// Só sessão do painel envia, e só imagem: o arquivo é aceito pelo tipo declarado E pela
// assinatura dos primeiros bytes, porque a extensão mente.
//
// A resposta traz width/height lidos do cabeçalho do arquivo. O `next/image` precisa dos
// dois para reservar o espaço antes de a imagem chegar, e é isso que mantém o CLS em zero.
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
/** Imagens do blog (capas e fotos do meio do artigo) podem ser maiores: viram variantes em /midia?w=. */
const MAX_BLOG_BYTES = 8 * 1024 * 1024;

/** Pastas aceitas no bucket. Nome livre viraria caminho livre. */
const FOLDERS = new Set(["social", "conteudo", "blog", "marca"]);
const TYPES: Record<string, { ext: string; magic: number[][] }> = {
  "image/jpeg": { ext: "jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: "png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { ext: "webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
};

function matchesMagic(bytes: Uint8Array, type: string): boolean {
  return TYPES[type].magic.some((signature) => signature.every((byte, i) => bytes[i] === byte));
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Pedido inválido.", 403);

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "midia.enviar")) return jsonError("Sem permissão.", 403);

  const form = await request.formData();
  const file = form.get("arquivo");
  if (!(file instanceof File)) return jsonError("Envie um arquivo de imagem.", 400);

  const pasta = String(form.get("pasta") ?? "social");
  if (!FOLDERS.has(pasta)) return jsonError("Destino inválido.", 400);
  const limit = pasta === "blog" ? MAX_BLOG_BYTES : MAX_BYTES;
  if (file.size > limit) return jsonError(`A imagem passa de ${limit / 1024 / 1024} MB.`, 413);
  if (!TYPES[file.type]) return jsonError("Formatos aceitos: JPG, PNG ou WebP.", 415);

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesMagic(bytes, file.type)) return jsonError("O arquivo não é uma imagem válida.", 415);

  const size = imageSize(bytes, file.type);
  if (!size) return jsonError("Não foi possível ler as dimensões da imagem.", 415);


  const key = `${pasta}/${crypto.randomUUID().slice(0, 12)}.${TYPES[file.type].ext}`;
  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.MEDIA_BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type } });
  } catch (error) {
    console.error("[midia] falha ao gravar", error);
    return jsonError("Não foi possível guardar a imagem agora.", 500);
  }

  await audit({
    action: "midia.enviada",
    actorId: auth.session.userId,
    actorEmail: auth.session.user.email,
    targetType: "midia",
    targetId: key,
    detail: { tamanho: file.size, tipo: file.type, largura: size.width, altura: size.height },
    request,
  });

  // Imagens do blog entram na biblioteca de mídia, com o texto alternativo informado.
  let id: string | null = null;
  if (pasta === "blog") {
    id = newId("med");
    try {
      const db = await getDb();
      await db
        .prepare(
          "INSERT INTO blog_media (id, key, url, alt, caption, width, height, bytes, mime, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          id,
          key,
          `/midia/${key}`,
          String(form.get("alt") ?? "").trim() || null,
          String(form.get("legenda") ?? "").trim() || null,
          size.width,
          size.height,
          file.size,
          file.type,
          nowIso(),
          auth.session.user.email,
        )
        .run();
    } catch (error) {
      console.error("[midia] falha ao registrar na biblioteca", error);
    }
  }

  return jsonOk({ id, url: `/midia/${key}`, largura: size.width, altura: size.height });
}
