import { audit } from "@/lib/admin/audit";
import { jsonError, jsonOk } from "@/lib/admin/request";
import { requireApiSession } from "@/lib/admin/session";
import { can } from "@/lib/admin/users";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Upload das imagens de compartilhamento. Guarda no R2 (binding MEDIA_BUCKET) e
// devolve o caminho público (/midia/...), que é o que vai para o page_meta.
// Só sessão do painel envia, e só imagem: o arquivo é aceito pelo tipo declarado
// E pela assinatura dos primeiros bytes, porque a extensão mente.
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES: Record<string, { ext: string; magic: number[][] }> = {
  "image/jpeg": { ext: "jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: "png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { ext: "webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
};

function matchesMagic(bytes: Uint8Array, type: string): boolean {
  return TYPES[type].magic.some((signature) => signature.every((byte, i) => bytes[i] === byte));
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  if (!can(auth.session.user, "midia.enviar")) return jsonError("Sem permissão.", 403);

  const form = await request.formData();
  const file = form.get("arquivo");
  if (!(file instanceof File)) return jsonError("Envie um arquivo de imagem.", 400);
  if (file.size > MAX_BYTES) return jsonError("A imagem passa de 3 MB.", 413);
  if (!TYPES[file.type]) return jsonError("Formatos aceitos: JPG, PNG ou WebP.", 415);

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesMagic(bytes, file.type)) return jsonError("O arquivo não é uma imagem válida.", 415);

  const key = `social/${crypto.randomUUID().slice(0, 12)}.${TYPES[file.type].ext}`;
  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.MEDIA_BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type } });
  } catch (error) {
    console.error("[midia] falha ao gravar", error);
    return jsonError("Não foi possível guardar a imagem agora.", 500);
  }

  await audit({
    action: "usuario.editado",
    actorId: auth.session.userId,
    actorEmail: auth.session.user.email,
    targetType: "midia",
    targetId: key,
    detail: { tamanho: file.size, tipo: file.type },
    request,
  });

  return jsonOk({ url: `/midia/${key}` });
}
