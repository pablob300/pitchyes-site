// Fusão do padrão do código com a sobreposição que vem do banco.
//
// Duas regras, e elas explicam todo o comportamento do editor:
//
//   OBJETO mescla por chave  — mexer em hero.lead não congela o resto do hero, e uma
//                              melhoria de texto feita no código continua aparecendo em
//                              todo campo que ninguém tocou no painel.
//   LISTA substitui inteira  — é o único jeito de "remover o item 3" ser representável.
//                              Mesclar lista por índice não consegue expressar exclusão.
//
// Consequência a conhecer: depois que alguém edita uma lista, uma FAQ nova adicionada no
// content.ts não aparece mais — a lista inteira passou a vir do banco. O painel mostra
// isso com o selo "Editada" e o botão "voltar ao padrão do código".
//
// Aqui só se faz fusão ESTRUTURAL. Quem garante que o resultado faz sentido (chave de
// pilar conhecida, número positivo, texto não vazio) é o validador de cada página.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Campo que não existe no padrão (os opcionais do tipo: `person`, `role`, `live`…).
 * Só passa se for valor simples — nada de objeto ou lista inventados pelo banco.
 */
function acceptExtra(value: unknown): value is Json {
  const t = typeof value;
  return t === "string" || t === "number" || t === "boolean";
}

function mergeValue(fallback: unknown, override: unknown): unknown {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(override)) return fallback;
    // O primeiro item do padrão serve de molde: item novo nasce com os campos que o
    // componente espera, mesmo que o painel só tenha mandado metade deles.
    const template = fallback[0];
    return override.map((item) =>
      isPlainObject(template) ? mergeValue(template, item) : item,
    );
  }

  if (isPlainObject(fallback)) {
    if (!isPlainObject(override)) return fallback;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fallback)) {
      out[key] = key in override ? mergeValue(value, override[key]) : value;
    }
    for (const [key, value] of Object.entries(override)) {
      if (!(key in fallback) && acceptExtra(value)) out[key] = value;
    }
    return out;
  }

  // Valor simples: o banco só vence se for do mesmo tipo do padrão.
  return typeof override === typeof fallback ? override : fallback;
}

/** Funde a sobreposição sobre o padrão. Sobreposição inválida devolve o padrão inteiro. */
export function mergeContent<T>(defaults: T, override: unknown): T {
  if (!isPlainObject(override)) return defaults;
  return mergeValue(defaults, override) as T;
}

/** Lê o JSON guardado no banco. Texto quebrado não derruba a página: vira `null`. */
export function parseOverride(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
