import Link from "next/link";
import { footerNav, legalNav } from "@/lib/routes";
import { Logo } from "@/components/Logo";
import { company, socials } from "@/lib/company";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

const { address, phone, email } = company;

/** External links always open in a new tab, without handing the page to the other site. */
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="PitchYes — página inicial">
              <Logo height={32} />
            </Link>
            <address className={styles.contact}>
              <span>
                {address.street} — {address.district}, {address.city} ({address.state})
              </span>
              <a href={`tel:${phone.tel}`}>{phone.display}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </address>
            <ul className={styles.socials} aria-label="PitchYes nas redes sociais">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} {...external} aria-label={`PitchYes no ${s.label}`} title={s.label}>
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={s.path} fillRule={s.evenOdd ? "evenodd" : undefined} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <NewsletterForm />
        </div>

        <nav className={styles.cols} aria-label="Rodapé">
          {footerNav.map((col) => (
            <div key={col.title} className={styles.col}>
              <h2 className={styles.colTitle}>{col.title}</h2>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} PitchYes. Todos os direitos reservados. CNPJ 58.177.364/0001-21.
            {legalNav.map((link) => (
              <span key={link.href}>
                {" · "}
                <Link href={link.href}>{link.label}</Link>
              </span>
            ))}
          </p>
          <a
            href={company.reclameAqui}
            {...external}
            className={styles.reclameAqui}
            aria-label="PitchYes verificada pelo Reclame Aqui — ver a página da empresa"
          >
            {/* Official seal art from Reclame Aqui, self-hosted (no third-party script) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/reclame-aqui/ra-verificada.svg" alt="Selo RA Verificada" width={30} height={30} loading="lazy" />
            <span className={styles.raText}>
              <span>Verificada por</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/reclame-aqui/ra-logo.svg" alt="Logo do Reclame Aqui" width={93} height={17} loading="lazy" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
