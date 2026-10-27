import { FinalCta } from "@/components/layout/FinalCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteDefaults, type SiteContent } from "@/content/site";
import type { BrandImage } from "@/lib/site-settings";

// Moldura do site público: cabeçalho, conteúdo, faixa de CTA e rodapé. Usada pelo layout
// do grupo (site) e pela página 404. A área /admin não usa nada disso.
//
// `content` é opcional de propósito: a 404 e qualquer rota que não resolva conteúdo usam
// o padrão do código, sem consultar o banco.
export function SiteChrome({
  children,
  content = siteDefaults,
  editable,
  logo,
}: {
  children: React.ReactNode;
  content?: SiteContent;
  editable?: boolean;
  /** Logo enviado em Configurações (lib/settings.ts); ausente = a arte da marca. */
  logo?: BrandImage | null;
}) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader logo={logo} />
      <main id="conteudo">{children}</main>
      {/* "Fale com nossa IA": igual em todas as páginas, logo antes do rodapé */}
      <FinalCta content={content.finalCta} editable={editable} />
      <SiteFooter logo={logo} />
    </>
  );
}
