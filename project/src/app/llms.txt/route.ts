import { company, socials } from "@/lib/company";
import { blogPaths, getAllPosts } from "@/lib/blog";
import { getHomeContent } from "@/lib/content/resolve";
import { pages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/sitemap";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { isIndexable } from "@/lib/site";

// /llms.txt — plain-text summary for answer engines (llmstxt.org). Same content as the
// site, written so a model can quote it: what we do, which pages exist, what is factual.
//
// Os NÚMEROS saem do conteúdo publicado da home, não deste arquivo: latência, total de
// ligações, certificações e prazo de implantação são exatamente os que alguém pode trocar
// no editor visual, e são os que ficariam divergindo em silêncio (SEO.md §3). A prosa e os
// fatos que não existem como campo (CNPJ, endereço, planos) continuam escritos aqui, à
// mão — gerá-los seria inventar texto, e texto errado citado por uma IA não se desfaz.
export const dynamic = "force-dynamic";

/** "20.000.000+ ligações realizadas até hoje" a partir do número em destaque do topo. */
function callsFact(stat: { value: string; label: string }): string {
  return `- ${stat.value} ${stat.label}.`;
}

function latencyFact(rows: { label: string; value: number }[], unit: string): string {
  const [first, ...rest] = rows;
  if (!first) return "";
  const comparison = rest
    .map((row) => `${row.value.toLocaleString("pt-BR")} ${unit} (${row.label.toLowerCase()})`)
    .join(", ");
  return `- Latência de ${first.value.toLocaleString("pt-BR")} ${unit}${
    comparison ? `, contra ${comparison}` : ""
  }.`;
}

function certificationsFact(items: { name: string; detail: string }[]): string {
  const list = items.map((item) => `${item.name}${item.detail ? ` ${item.detail}` : ""}`);
  return `- Certificações ${list.join(", ")}; operação em conformidade com a LGPD.`;
}

function rolloutFact(steps: { day: string; title: string }[]): string {
  const etapas = steps.map((step) => step.title.toLowerCase()).join(", ");
  // O rótulo da última etapa é escrito para a tela ("Dia 07 · Ao vivo"); aqui interessa
  // só o número, senão a frase sai como "cerca de Dia 07 · Ao vivo".
  const dias = steps[steps.length - 1]?.day.match(/\d+/)?.[0];
  const prazo = dias ? `cerca de ${Number(dias)} dias` : "poucos dias";
  return `- Implantação típica em ${prazo} (${etapas}).`;
}

export async function GET() {
  const [home, posts] = await Promise.all([getHomeContent("publicado"), getAllPosts()]);
  const articles = posts.filter((post) => !post.noindex);
  const blog = articles.length
    ? [
        `Artigos publicados em ${absoluteUrl("/blog")} (mais novos primeiro):`,
        "",
        ...articles.map(
          (post) =>
            `- [${post.title}](${absoluteUrl(blogPaths.post(post.slug))})${
              post.excerpt ? `: ${post.excerpt.replace(/\s+/g, " ").trim()}` : ""
            }`,
        ),
      ].join("\n")
    : `Ainda sem artigos publicados em ${absoluteUrl("/blog")}.`;
  const section = (title: string, prefix: string) => {
    const items = pages
      .filter((p) => p.path !== "/" && p.path.startsWith(prefix))
      .map((p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.description}`);
    return items.length ? `
## ${title}\n\n${items.join("\n")}\n` : "";
  };

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

A PitchYes é uma plataforma de IA de voz para empresas: cria, opera e monitora agentes de
telefone que conduzem conversas reais em escala, em ligações ativas, receptivas e operacionais. Roda em
infraestrutura própria, integra com a telefonia, o CRM e a agenda que a empresa já usa, e
atende clínicas, imobiliárias, concessionárias, seguradoras, faculdades, corretoras,
franquias e empresas de telecomunicação.

Fatos que podem ser citados:
${latencyFact(home.latency.rows, home.latency.unit)}
${callsFact(home.hero.stat)}
${certificationsFact(home.security.items)}
${rolloutFact(home.rollout.steps)}
- Atendimento nativo em mais de 40 idiomas, com tradução em tempo real em 23 deles.
- Cobrança por minuto, cobrindo modelo de linguagem, transcrição, síntese de voz e telefonia.
- Números divulgados pela empresa: mais de 400 empresas atendidas, 94% de taxa de sucesso e 3x mais leads qualificados.

## Dados da empresa

- Razão social: PitchYes — CNPJ 58.177.364/0001-21.
- Sede: ${company.address.full}, Brasil. Atendimento em todo o Brasil.
- Comercial: comercial@pitchyes.com.br e +55 (11) 5196-9381, de segunda a sexta, das 8h às 20h (horário de Brasília).
- Privacidade e LGPD: privacidade@pitchyes.com.br.

## Planos (em reais)

- Blitz (pré-pago, pequenas empresas): R$ 250 por 100 minutos (R$ 2,50/min), sem contrato (termo de aceite), 1 ligação simultânea, 1 assistente, material de apoio.
- Starter (pequenas e médias empresas): R$ 1.249; minutos avulsos a R$ 2,00 (mínimo de 100); 3 ligações simultâneas; integração por API aberta ou avulsa (R$ 250/h); número dedicado opcional (R$ 99/mês).
- Pro (médias empresas): R$ 2.449; 700 minutos a R$ 1,80; 10 ligações simultâneas; assistentes, cadências e reuniões com CS ilimitados; número dedicado com nome e logo.
- Enterprise (grandes empresas): R$ 3.997; 1.000 minutos a R$ 1,40; 30 ligações simultâneas; integração inclusa; assistentes, cadências e reuniões com CS ilimitados.

## Páginas principais

- [Início](${absoluteUrl("/")}): ${SITE_DESCRIPTION}
${section("Soluções", "/solucoes")}${section("Clientes", "/clientes")}${section("Planos", "/planos")}${section("Recursos", "/recursos")}${section("Empresa", "/sobre")}
## Blog

${blog}

## Contato

- [Fale com nossa IA](${absoluteUrl("/#fale-com-a-ia")})
- [Contato](${absoluteUrl("/contato")}): formulário para agendar uma demonstração gratuita de 30 minutos.
- Telefone: +55 (11) 5196-9381 · E-mail: comercial@pitchyes.com.br
- Perfis oficiais: ${socials.map((s) => `[${s.label}](${s.href})`).join(" · ")}
- Reputação: empresa verificada no [Reclame Aqui](${company.reclameAqui}).

## Observações

- Idioma do site: português do Brasil.
- Conteúdo canônico: ${absoluteUrl("/")}
${isIndexable() ? "" : "- Ambiente de homologação: não indexar nem citar até a publicação no domínio definitivo.\n"}`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
