// Fonte única do menu lateral do painel. Uma seção nova do CMS é uma entrada aqui
// mais uma pasta em src/app/admin/(painel)/ — nada além disso muda.

export type AdminNavItem = {
  href: string;
  label: string;
  /** Marca o item como ativo também nas rotas filhas. */
  match?: "exact" | "prefix";
  /** Capacidade exigida (ver lib/admin/users.ts). Tudo é "admin" hoje. */
  capability?: string;
  /** Some do menu, mas a rota continua existindo — para seção em construção. */
  hidden?: boolean;
  /**
   * "topo" fica logo abaixo da marca (o trabalho do dia a dia);
   * "base" encosta no rodapé, junto do menu do usuário.
   */
  group?: "topo" | "base";
};

/** Seção com submenu: um rótulo que não é link e os itens dentro dele. */
export type AdminNavGroup = {
  label: string;
  children: AdminNavItem[];
  hidden?: boolean;
  group?: "topo" | "base";
};

export type AdminNavEntry = AdminNavItem | AdminNavGroup;

export const adminNav: AdminNavEntry[] = [
  { href: "/admin/paginas", label: "Page Editor", match: "prefix", group: "topo" },
  {
    label: "Análise",
    group: "topo",
    children: [
      { href: "/admin/analise/pagespeed", label: "PageSpeed", match: "prefix" },
      // { href: "/admin/analise/seo", label: "SEO", match: "prefix" },
    ],
  },
  // Próximas seções do CMS entram aqui, no grupo "topo":
  // { href: "/admin/midia", label: "Mídia", match: "prefix", group: "topo" },

  { href: "/admin/leads", label: "Central de leads", match: "prefix", group: "base" },
  { href: "/admin/newsletter", label: "Newsletter", match: "prefix", group: "base" },
  { href: "/admin/usuarios", label: "Usuários", match: "prefix", group: "base" },
];

export function isNavGroup(entry: AdminNavEntry): entry is AdminNavGroup {
  return "children" in entry;
}

export function isActive(item: AdminNavItem, pathname: string): boolean {
  return item.match === "prefix" ? pathname.startsWith(item.href) : pathname === item.href;
}

/** Entradas visíveis de um grupo; seção com submenu sem filho visível some junto. */
export function navGroup(group: "topo" | "base"): AdminNavEntry[] {
  return adminNav
    .filter((entry) => !entry.hidden && (entry.group ?? "topo") === group)
    .map((entry) => (isNavGroup(entry) ? { ...entry, children: entry.children.filter((child) => !child.hidden) } : entry))
    .filter((entry) => !isNavGroup(entry) || entry.children.length > 0);
}
