import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { SessionUser } from "@/lib/admin/users";
import { AdminNav } from "./AdminNav";
import { UserMenu } from "./UserMenu";
import styles from "./AdminShell.module.css";

// Moldura do painel: menu lateral claro à esquerda, conteúdo à direita.
// Nada aqui usa `data-reveal`: o globals.css esconde esses elementos até o GSAP
// marcar a página como pronta, e o painel não tem essa orquestração.

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/admin" aria-label="Painel da PitchYes">
            <Logo height={20} />
          </Link>
          <span className={styles.tag}>Painel</span>
        </div>

        <AdminNav group="topo" />

        {/* Administração encosta na base, logo acima do menu do usuário */}
        <div className={styles.foot}>
          <AdminNav group="base" />
          <div className={styles.user}>
            <UserMenu user={user} />
          </div>
        </div>
      </aside>

      <main className={styles.content} id="conteudo">
        {children}
      </main>
    </div>
  );
}
