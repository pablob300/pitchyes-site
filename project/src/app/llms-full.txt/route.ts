import { innerPages } from "@/content/registry";
import { citesUnverifiedClaim } from "@/lib/content/claims";
import { getInnerPageContent } from "@/lib/content/inner";
import { pageToMarkdown } from "@/lib/content/markdown";
import { getHomeContent } from "@/lib/content/resolve";
import { toPlainText } from "@/lib/content/richtext";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { absoluteUrl } from "@/lib/sitemap";
import { isIndexable } from "@/lib/site";

// /llms-full.txt — o texto completo das páginas comerciais em Markdown, para os mecanismos
// de resposta (complemento do /llms.txt, que é o resumo com links). Sai do conteúdo
// publicado, então muda junto com o site quando alguém edita uma página no painel.
//
// Regenera a cada hora (ISR) em vez de a cada pedido: são ~14 páginas montadas de uma vez,
// caro demais para o limite de CPU por pedido do Worker.
export const revalidate = 3600;

/** Fora do arquivo: textos jurídicos não ajudam ninguém a entender o que a empresa faz. */
const SKIP = new Set(["/privacidade", "/termos"]);

const plain = (text: string) => toPlainText(text).replace(/\s+/g, " ").trim();

export async function GET() {
  const paths = Object.keys(innerPages).filter((p) => !SKIP.has(p));
  const [home, ...pages] = await Promise.all([getHomeContent("publicado"), ...paths.map((p) => getInnerPageContent(p))]);

  const homeText = [
    `## ${SITE_NAME}: IA de voz para empresas`,
    `Endereço: ${absoluteUrl("/")}`,
    plain(home.platform.lead),
    `### ${plain(home.platform.title)}`,
    home.platform.pillars.map((p) => `- **${plain(p.title)}** ${plain(p.text)}`).join("\n"),
    `### ${plain(home.useCases.title)}`,
    home.useCases.items.map((i) => `- **${plain(i.title)}**: ${plain(i.text)}`).join("\n"),
    `### ${plain(home.rollout.title)}`,
    home.rollout.steps.map((s) => `- ${plain(s.day)}, ${plain(s.title)}: ${plain(s.text)}`).join("\n"),
    `### ${plain(home.faq.title)}`,
    // Sem a pergunta das certificações ainda não comprovadas (lib/content/claims.ts).
    home.faq.items
      .filter((i) => !citesUnverifiedClaim(i.a))
      .map((i) => `**${plain(i.q)}**\n${plain(i.a)}`)
      .join("\n\n"),
  ].join("\n\n");

  const header = [
    `# ${SITE_NAME}: conteúdo completo do site`,
    `> ${SITE_DESCRIPTION}`,
    `Resumo e lista de páginas: ${absoluteUrl("/llms.txt")}. Idioma: português do Brasil.${
      isIndexable() ? "" : " Ambiente de homologação: não indexar nem citar até a publicação no domínio definitivo."
    }`,
  ].join("\n\n");

  const body = [
    header,
    homeText,
    ...paths.map((path, i) => pageToMarkdown(path, pages[i])),
  ].join("\n\n---\n\n");

  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
