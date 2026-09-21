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
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin/leads", label: "Central de leads", match: "prefix" },
  { href: "/admin/usuarios", label: "Usuários", match: "prefix" },
  // Próximas seções:
  // { href: "/admin/paginas", label: "Páginas", match: "prefix" },
  // { href: "/admin/blog", label: "Blog", match: "prefix" },
];

export function isActive(item: AdminNavItem, pathname: string): boolean {
  return item.match === "prefix" ? pathname.startsWith(item.href) : pathname === item.href;
}
