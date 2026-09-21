import type { Metadata } from "next";

// Moldura comum de /admin. Não exige sessão: as telas de entrada moram aqui também.
// A checagem de sessão fica no layout do grupo (painel).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
