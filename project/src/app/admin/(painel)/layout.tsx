import { AdminShell } from "@/components/admin/shell/AdminShell";
import { requireSession } from "@/lib/admin/session";

// Tudo dentro do painel exige sessão conferida no banco — o proxy só faz a
// checagem barata da assinatura do cookie, que não sabe de revogação.
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AdminShell user={session.user}>{children}</AdminShell>;
}
