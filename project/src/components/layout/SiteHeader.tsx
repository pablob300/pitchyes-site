"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav, TALK_TO_AI_HREF } from "@/lib/routes";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./SiteHeader.module.css";

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close menus after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setOpenDropdown(null);
  }

  // Keep the page behind the open mobile menu from scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label="PitchYes — página inicial">
          <Logo height={28} priority />
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="visually-hidden">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
          <span className={styles.burger} data-open={menuOpen} aria-hidden="true" />
        </button>

        <div className={styles.panel} data-open={menuOpen}>
          <nav id="site-nav" ref={navRef} aria-label="Principal">
            <ul className={styles.links}>
              {mainNav.map((item) =>
                "children" in item ? (
                  <li
                    key={item.label}
                    className={styles.item}
                    data-open={openDropdown === item.label}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      className={styles.link}
                      aria-expanded={openDropdown === item.label}
                      data-active={item.children.some((c) => isActive(pathname, c.href))}
                      onClick={() =>
                        setOpenDropdown((cur) => (cur === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <svg className={styles.chevron} viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </button>
                    <ul className={styles.dropdown}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={isActive(pathname, child.href) ? "page" : undefined}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={item.href} className={styles.item}>
                    <Link
                      href={item.href}
                      className={styles.link}
                      data-active={isActive(pathname, item.href)}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <ButtonLink href={TALK_TO_AI_HREF} className={styles.cta}>
            Fale com nossa IA
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
