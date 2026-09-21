import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "./layout.module.css";

// Telas de entrada (entrar, verificar, recuperar, definir senha): cartão centralizado,
// sem menu lateral e sem a moldura do site público.
export default function EntradaLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo} aria-label="PitchYes — página inicial">
          <Logo height={22} />
        </Link>
        {children}
      </div>
      <p className={styles.footer}>Área interna da PitchYes</p>
    </main>
  );
}
