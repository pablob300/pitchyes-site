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

export const adminNav: AdminNavItem[] = [
  { href: "/admin/paginas", label: "Page Editor", match: "prefix", group: "topo" },
  // Próximas seções do CMS entram aqui, no grupo "topo":
  // { href: "/admin/midia", label: "Mídia", match: "prefix", group: "topo" },

  { href: "/admin/leads", label: "Central de leads", match: "prefix", group: "base" },
  { href: "/admin/newsletter", label: "Newsletter", match: "prefix", group: "base" },
  { href: "/admin/usuarios", label: "Usuários", match: "prefix", group: "base" },
];

export function isActive(item: AdminNavItem, pathname: string): boolean {
  return item.match === "prefix" ? pathname.startsWith(item.href) : pathname === item.href;
}

export function navGroup(group: "topo" | "base"): AdminNavItem[] {
  return adminNav.filter((item) => !item.hidden && (item.group ?? "topo") === group);
}
