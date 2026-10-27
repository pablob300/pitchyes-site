import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getSiteContent } from "@/lib/content/resolve";
import { getSiteSettings } from "@/lib/settings";

// Todas as páginas públicas herdam o cabeçalho, a faixa de CTA e o rodapé daqui.
// O grupo (site) não aparece na URL: /planos continua sendo /planos.
//
// A faixa de CTA é editável no painel como conteúdo global ("/_site"), então o layout lê
// o conteúdo publicado. Isto NÃO torna as páginas dinâmicas: é uma leitura por
// revalidação, igual à dos metadados — o que tiraria a página do cache seria ler cookie
// ou cabeçalho aqui, e isso não pode acontecer em nada que o site público importe.
//
// O mesmo vale para a Configuração geral (logo e Google Tag Manager, lib/settings.ts).
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [content, settings] = await Promise.all([getSiteContent("publicado"), getSiteSettings()]);
  return (
    <>
      <GoogleTagManager id={settings.gtmId} />
      <SiteChrome content={content} logo={settings.logo}>
        {children}
      </SiteChrome>
    </>
  );
}
