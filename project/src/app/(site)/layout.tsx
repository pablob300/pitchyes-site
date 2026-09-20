import { SiteChrome } from "@/components/layout/SiteChrome";

// Todas as páginas públicas herdam o cabeçalho, a faixa de CTA e o rodapé daqui.
// O grupo (site) não aparece na URL: /precos continua sendo /precos.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
