import { requireSession } from "@/lib/admin/session";

// Tudo dentro do painel exige sessão conferida no banco — o proxy só faz a
// checagem barata da assinatura do cookie, que não sabe de revogação.
// No passo 2 este layout ganha o menu lateral e o topo com o usuário.
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
