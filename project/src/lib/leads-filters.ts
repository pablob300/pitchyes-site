// Filtros da Central de leads. Vivem na URL, então a tela continua sendo componente
// de servidor e um filtro vira um link que dá para salvar ou mandar para alguém.
// Isomórfico: a página, a barra de filtros e o link de exportar leem daqui.

export type LeadFilters = {
  form?: string;
  /** "2026-09-01", no fuso de Brasília. */
  from?: string;
  to?: string;
  q?: string;
  /** Perfil comercial (lib/leads.ts, leadProfile). */
  profile?: "comercial" | "sem_perfil";
  page: number;
};

export const PER_PAGE = 50;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

type RawParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseLeadFilters(params: RawParams): LeadFilters {
  const from = one(params.de);
  const to = one(params.ate);
  const page = Number(one(params.pagina) ?? 1);
  return {
    form: one(params.formulario),
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
    q: one(params.busca)?.slice(0, 80),
    profile: one(params.perfil) === "comercial" || one(params.perfil) === "sem_perfil" ? (one(params.perfil) as LeadFilters["profile"]) : undefined,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function toSearchParams(filters: LeadFilters, overrides: Partial<LeadFilters> = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.form) params.set("formulario", merged.form);
  if (merged.from) params.set("de", merged.from);
  if (merged.to) params.set("ate", merged.to);
  if (merged.q) params.set("busca", merged.q);
  if (merged.profile) params.set("perfil", merged.profile);
  if (merged.page > 1) params.set("pagina", String(merged.page));
  return params.toString();
}

export function hasFilters(filters: LeadFilters): boolean {
  return Boolean(filters.form || filters.from || filters.to || filters.q || filters.profile);
}

/**
 * Brasília é -03:00 fixo desde o fim do horário de verão (2019), então dá para
 * montar o limite do dia sem biblioteca de fuso. `to` é convertido para o começo do
 * dia seguinte e comparado com "<", para incluir o dia inteiro.
 */
export function dayBoundsUtc(from?: string, to?: string): { start?: string; end?: string } {
  const start = from ? new Date(`${from}T00:00:00-03:00`).toISOString() : undefined;
  let end: string | undefined;
  if (to) {
    const next = new Date(`${to}T00:00:00-03:00`);
    next.setUTCDate(next.getUTCDate() + 1);
    end = next.toISOString();
  }
  return { start, end };
}
