import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/lib/admin/config";

// /admin abre a primeira seção do painel; quem não tem sessão é levado ao login
// pelo proxy antes de chegar aqui.
export const dynamic = "force-dynamic";

export default function AdminIndex() {
  redirect(ADMIN_HOME);
}
