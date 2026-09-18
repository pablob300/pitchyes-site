import Link from "next/link";
import type { ReactNode } from "react";
import { footerNav, legalNav } from "@/lib/routes";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

// TODO: fill in the official profile URLs; icons render unlinked until then.
const socials: { label: string; href: string | null; icon: ReactNode }[] = [
  {
    label: "LinkedIn",
    href: null,
    icon: (
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.64-1.6-2.64-1.61 0-1.86 1.26-1.86 2.56v4.91h-4V9.75Z" />
    ),
  },
  {
    label: "X",
    href: null,
    icon: (
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <Link href="/" className={styles.logo}>
            PitchYes
          </Link>
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
            © {new Date().getFullYear()} PitchYes. Todos os direitos reservados.
            {legalNav.map((link) => (
              <span key={link.href}>
                {" · "}
                <Link href={link.href}>{link.label}</Link>
              </span>
            ))}
          </p>
          <ul className={styles.socials}>
            {socials.map((s) => {
              const svg = (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {s.icon}
                </svg>
              );
              return (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                      {svg}
                    </a>
                  ) : (
                    <span title={`${s.label} (em breve)`}>{svg}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
