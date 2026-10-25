"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, isNavGroup, navGroup, type AdminNavItem } from "@/lib/admin/nav";
import styles from "./AdminNav.module.css";

// Menu lateral. Cliente só por causa do `usePathname` — a lista vem do registro
// em lib/admin/nav.ts, que é o único lugar a mexer para uma seção nova.
// Seções com submenu ("Análise") ficam sempre abertas: são poucas e assim o
// caminho até cada tela fica à vista.
export function AdminNav({ group }: { group: "topo" | "base" }) {
  const pathname = usePathname();
  const entries = navGroup(group);
  if (!entries.length) return null;

  const link = (item: AdminNavItem, sub = false) => (
    <Link
      href={item.href}
      className={styles.item}
      data-sub={sub || undefined}
      data-active={isActive(item, pathname) || undefined}
      aria-current={isActive(item, pathname) ? "page" : undefined}
    >
      {item.label}
    </Link>
  );

  return (
    <nav aria-label={group === "topo" ? "Seções do painel" : "Administração"}>
      <ul className={styles.list}>
        {entries.map((entry) =>
          isNavGroup(entry) ? (
            <li key={entry.label} className={styles.group}>
              <span className={styles.groupLabel} data-active={entry.children.some((child) => isActive(child, pathname)) || undefined}>
                {entry.label}
              </span>
              <ul className={styles.sublist} aria-label={entry.label}>
                {entry.children.map((child) => (
                  <li key={child.href}>{link(child, true)}</li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={entry.href}>{link(entry)}</li>
          ),
        )}
      </ul>
    </nav>
  );
}
