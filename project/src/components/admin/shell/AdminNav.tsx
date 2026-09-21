"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navGroup } from "@/lib/admin/nav";
import styles from "./AdminNav.module.css";

// Menu lateral. Cliente só por causa do `usePathname` — a lista vem do registro
// em lib/admin/nav.ts, que é o único lugar a mexer para uma seção nova.
export function AdminNav({ group }: { group: "topo" | "base" }) {
  const pathname = usePathname();
  const items = navGroup(group);
  if (!items.length) return null;

  return (
    <nav aria-label={group === "topo" ? "Seções do painel" : "Administração"}>
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
