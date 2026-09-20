import { FinalCta } from "@/components/layout/FinalCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

// Moldura do site público: cabeçalho, conteúdo, faixa de CTA e rodapé. Usada pelo layout
// do grupo (site) e pela página 404. A área /admin não usa nada disso.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      {/* "Fale com nossa IA": igual em todas as páginas, logo antes do rodapé */}
      <FinalCta />
      <SiteFooter />
    </>
  );
}
