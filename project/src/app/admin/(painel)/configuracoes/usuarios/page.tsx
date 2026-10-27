import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { UsersTable, type UserRow } from "@/components/admin/users/UsersTable";
import { pageMetadata } from "@/lib/seo";
import { requireSession } from "@/lib/admin/session";
import { listUsersWithActivity, ROLES } from "@/lib/admin/users";

// Quem tem acesso ao painel. Todo usuário criado aqui nasce sem senha e recebe
// um convite por e-mail para definir a dele.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Usuários",
    description: "Área interna da PitchYes: quem tem acesso ao painel.",
    path: "/admin/configuracoes/usuarios",
    noindex: true,
  });
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const papeis = Object.entries(ROLES).map(([value, role]) => ({ value, label: role.label }));

export default async function Page() {
  const session = await requireSession();
  const users = await listUsersWithActivity();

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    nome: user.name,
    email: user.email,
    papel: user.role,
    papelLabel: ROLES[user.role]?.label ?? user.role,
    situacao: user.status,
    superadmin: user.is_superadmin === 1,
    temSenha: Boolean(user.password_hash),
    ultimoAcesso: user.last_login_at ? dateFmt.format(new Date(user.last_login_at)) : null,
    aparelhos: user.aparelhos,
    papeis,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Usuários"
        title="Quem tem acesso"
        description={`${rows.length} ${rows.length === 1 ? "pessoa" : "pessoas"} com acesso ao painel. Todo acesso hoje é de nível Admin.`}
      />
      <UsersTable rows={rows} actorId={session.userId} />
    </>
  );
}
