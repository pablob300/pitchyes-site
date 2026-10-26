import { defineCloudflareConfig, getCloudflareContext } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// ISR no Cloudflare (https://opennext.js.org/cloudflare/caching):
// - incrementalCache: páginas geradas guardadas no R2;
// - queue: regenera a página que passou do `revalidate` chamando o próprio Worker
//   (WORKER_SELF_REFERENCE), com deduplicação. Sem fila, o padrão "dummy" lançava erro a cada
//   página vencida — resposta vazia, 503 ou pendurada (out/2026, com ~150 páginas do blog);
// - tagCache: guarda os revalidatePath/revalidateTag (tabela `revalidations` no D1, criada pelo
//   deploy) — é o que faz "publicar" no painel aparecer na hora;
// - enableCacheInterception: página em cache sai sem subir o servidor do Next (menos CPU e memória).

// O interceptador do cache espera o `queue.send` antes de responder a página vencida: o visitante
// ficava esperando a regeneração (até o limite de 10 s da memoryQueue). Aqui a regeneração vai
// para o `waitUntil` — a página vencida sai na hora e a nova é gerada depois da resposta.
const backgroundQueue: typeof memoryQueue = Object.assign(Object.create(memoryQueue), {
	name: "background-memory-queue",
	async send(message: Parameters<typeof memoryQueue.send>[0]) {
		getCloudflareContext().ctx.waitUntil(memoryQueue.send(message));
	},
});

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
	queue: backgroundQueue,
	tagCache: d1NextTagCache,
	enableCacheInterception: true,
});
