import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { THANK_YOU_HREF } from "@/lib/routes";
import { pageMetadata, webPageSchema } from "@/lib/seo";
import styles from "./page.module.css";

// Agradecimento comum a todas as landing pages: o "Já salvei o contato, pode ligar" do
// PhoneConfirmDialog termina aqui. Fica no grupo (site) — cabeçalho, faixa de CTA e rodapé
// normais, para a pessoa seguir pelo site — e tem prioridade sobre app/(lp)/conteudo/[slug]
// (por isso "obrigado" é endereço reservado nas Landing Pages). Fora do sitemap e noindex:
// não é página de busca.
export const revalidate = 3600;

const title = "Solicitação enviada com sucesso";
const description =
  "Recebemos seu cadastro na PitchYes. A IA de voz liga para o telefone informado em até 30 segundos: mantenha o aparelho por perto e atenda a ligação.";

export const metadata: Metadata = pageMetadata({ title, description, path: THANK_YOU_HREF, noindex: true });

export default function Page() {
  return (
    <>
      <JsonLd graph={[webPageSchema({ title, description, path: THANK_YOU_HREF })]} />
      <section className={styles.section}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <span className={styles.check} aria-hidden="true" data-reveal>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h1 data-reveal>Solicitação enviada com sucesso!</h1>
            <p className="lead" data-reveal>
              A ligação iniciará dentro de 30 segundos.
            </p>
          </div>
          <div className={styles.media} data-reveal>
            <Image
              src="/images/landing/demonstracao.webp"
              alt="Integrante do time da PitchYes sorrindo no escritório da empresa, com a equipe trabalhando ao fundo"
              width={1280}
              height={720}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>
    </>
  );
}
