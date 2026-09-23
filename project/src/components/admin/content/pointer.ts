// Leitura e escrita por ponteiro ("hero.stat.value", "faq.items") em cima do conteúdo
// já resolvido que a gaveta mostra. A gravação no banco usa o setAtPointer do servidor;
// aqui é só o espelho local, para a tela responder enquanto a pessoa digita.

export function getAt(root: unknown, pointer: string): unknown {
  return pointer.split(".").reduce<unknown>((node, part) => {
    if (node === null || typeof node !== "object") return undefined;
    return (node as Record<string, unknown>)[part];
  }, root);
}

/** Devolve uma cópia com o campo trocado — nada é alterado no lugar. */
export function withAt<T>(root: T, pointer: string, value: unknown): T {
  const parts = pointer.split(".");
  const clone = (node: unknown, depth: number): unknown => {
    if (depth === parts.length) return value;
    const key = parts[depth];
    const base =
      node !== null && typeof node === "object" ? { ...(node as Record<string, unknown>) } : {};
    base[key] = clone(base[key], depth + 1);
    return base;
  };
  return clone(root, 0) as T;
}

/** Move um item de lista, para as setas de ordenação. */
export function moved<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const out = [...list];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/**
 * Aceita o endereço do YouTube ou o código solto e devolve só o código.
 * O site monta as URLs a partir dele, então guardar a URL inteira quebraria o player.
 */
export function youtubeId(raw: string): string {
  const value = raw.trim();
  const match = value.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return match ? match[1] : value;
}
