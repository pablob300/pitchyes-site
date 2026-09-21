"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, isActive } from "@/lib/admin/nav";
import styles from "./AdminNav.module.css";

// Menu lateral. Cliente só por causa do `usePathname` — a lista vem do registro
// em lib/admin/nav.ts, que é o único lugar a mexer para uma seção nova.
export function AdminNav() {
  const pathname = usePathname();
  const items = adminNav.filter((item) => !item.hidden);

  return (
    <nav aria-label="Seções do painel">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.item}
              data-active={isActive(item, pathname) || undefined}
              aria-current={isActive(item, pathname) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
