// Configuração geral do site: tipos e conferência, usados no navegador (tela do painel) e
// no servidor (lib/settings.ts, que lê do banco).

export type BrandImage = { src: string; width: number; height: number };

export type SiteSettings = {
  /** Vazio = SITE_NAME do código (lib/seo.ts). */
  siteName: string | null;
  /** Logo do cabeçalho e do rodapé (site e landing pages). Vazio = /brand/pitchyes-logo.svg. */
  logo: BrandImage | null;
  /** Ícone da aba do navegador. Vazio = /brand/icon.svg. */
  favicon: string | null;
  /** "GTM-XXXXXXX". Vazio = nenhum script de terceiros no site. */
  gtmId: string | null;
};

export const SETTING_KEYS = ["siteName", "logo", "favicon", "gtmId"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const GTM_ID = /^GTM-[A-Z0-9]{4,12}$/;

export const EMPTY_SETTINGS: SiteSettings = { siteName: null, logo: null, favicon: null, gtmId: null };

function parseImage(raw: string): BrandImage | null {
  try {
    const value = JSON.parse(raw) as Partial<BrandImage>;
    if (typeof value.src === "string" && value.src.startsWith("/") && Number(value.width) > 0 && Number(value.height) > 0) {
      return { src: value.src, width: Number(value.width), height: Number(value.height) };
    }
  } catch {
    // valor fora do formato: vale o padrão
  }
  return null;
}

/** Converte as linhas do banco, descartando o que não passa na conferência. */
export function parseSettings(rows: { key: string; value: string }[]): SiteSettings {
  const settings = { ...EMPTY_SETTINGS };
  for (const { key, value } of rows) {
    if (key === "siteName" && value.trim()) settings.siteName = value.trim();
    if (key === "logo") settings.logo = parseImage(value);
    if (key === "favicon" && value.startsWith("/")) settings.favicon = value;
    if (key === "gtmId" && GTM_ID.test(value)) settings.gtmId = value;
  }
  return settings;
}
