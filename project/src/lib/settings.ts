import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Configuração geral do site (Configurações › Configuração geral no painel): nome, logo,
// favicon e o ID do Google Tag Manager.
//
// Mesmo trato do page-content: o padrão está no código e o banco só guarda o que alguém
// mudou. Sem banco (build, migração 0009 ainda não aplicada), vale o padrão e nada quebra.
// A leitura não toca em cookie nem cabeçalho, então as páginas continuam estáticas com
// revalidação; salvar no painel revalida o site inteiro.
import { EMPTY_SETTINGS, parseSettings, type SiteSettings } from "./site-settings";

export type { BrandImage, SiteSettings } from "./site-settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.LEADS_DB) return EMPTY_SETTINGS;
    const { results } = await env.LEADS_DB.prepare("SELECT key, value FROM site_settings").all<{ key: string; value: string }>();
    return parseSettings(results ?? []);
  } catch {
    return EMPTY_SETTINGS;
  }
}
