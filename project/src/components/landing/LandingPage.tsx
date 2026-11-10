import { ContentBlock } from "@/components/blocks/ContentPage";
import { Logo } from "@/components/Logo";
import { buttonClass } from "@/components/ui/Button";
import { FORM_ANCHOR } from "@/content/landing/modelo";
import type { Block } from "@/content/types";
import { editFn, scoped } from "@/lib/content/edit";
import { company } from "@/lib/company";
import type { BrandImage } from "@/lib/site-settings";
import { AnchorScroll } from "./AnchorScroll";
import styles from "./LandingPage.module.css";

// Landing page (/conteudo/<slug>): os blocos do conteúdo, com topo e rodapé próprios.
//
// Regra da landing page: quem chega fica. Nenhum link leva para outra página do site — o
// menu é de âncoras para os blocos e todo botão de chamada leva ao formulário (#formulario).
// A única saída é a Política de Privacidade, aberta em outra aba ao lado do formulário (LGPD).
//
// Os botões para o formulário são <a> comuns, não o <Link> do Next, e o clique nas âncoras é
// tratado por AnchorScroll: com o endereço já em "#formulario" (depois do primeiro clique),
// o navegador não rolaria de novo.
//
// Mesmos componentes no site e no editor: `editable` só acrescenta os data-edit.

export type LandingBlock = { key: string; block: Block };

export function LandingPage({
  blocks,
  slug,
  logo,
  editable,
}: {
  blocks: LandingBlock[];
  slug: string;
  logo: BrandImage | null;
  editable?: boolean;
}) {
  const edit = editFn(editable);
  const menu = blocks.filter(({ block }) => block.menuLabel?.trim());

  return (
    <>
      <AnchorScroll />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          {/* Logo sem link: a landing page não leva para o resto do site. */}
          <span className={styles.logo}>
            <Logo height={26} priority brand={logo} />
          </span>
          {menu.length > 0 && (
            <nav className={styles.nav} aria-label="Nesta página">
              <ul>
                {menu.map(({ key, block }) => (
                  <li key={key}>
                    <a href={`#${block.id ?? key}`}>{block.menuLabel}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <a href={`#${FORM_ANCHOR}`} className={buttonClass("solid", "md", styles.headerCta)}>
            Testar agora em 10s
          </a>
        </div>
      </header>

      <main id="conteudo">
        {blocks.map(({ key, block }) => {
          const e = scoped(edit, `blocos.${key}`);
          return (
            <div key={key} className={styles.block}>
              <ContentBlock block={block} e={e} slug={slug} />
              {block.cta?.trim() && (
                <div className={`container ${styles.blockCta}`} data-reveal>
                  <a href={`#${FORM_ANCHOR}`} className={buttonClass("solid", "lg")} {...e("cta")}>
                    {block.cta} →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <Logo height={24} brand={logo} />
          <address>
            <span>{company.address.full}</span>
            <a href={`tel:${company.phone.tel}`}>{company.phone.display}</a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </address>
          <p>
            © {new Date().getFullYear()} PitchYes. Todos os direitos reservados. CNPJ {company.cnpj}.
          </p>
        </div>
      </footer>
    </>
  );
}
