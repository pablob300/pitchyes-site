"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Settings.module.css";

// Abas de Configurações. Aba nova é uma linha aqui e uma pasta em
// app/admin/(painel)/configuracoes/.
const TABS = [
  { href: "/admin/configuracoes", label: "Configuração geral" },
  { href: "/admin/configuracoes/usuarios", label: "Usuários" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className={styles.tabs} aria-label="Configurações">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
