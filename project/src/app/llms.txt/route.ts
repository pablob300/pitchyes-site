import { company, socials } from "@/lib/company";
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
  const home = await getHomeContent("publicado");
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
telefone que conduzem conversas reais em escala, em ligações ativas e receptivas. Roda em
infraestrutura própria, integra com a telefonia, o CRM e a agenda que a empresa já usa, e
atende setores regulados (saúde, seguros, serviços financeiros, imobiliário).

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
- Sede: Rua 11, 250, 13º andar, Setor Central, Goiânia (GO), Brasil, CEP 74015-170. Atendimento em todo o Brasil.
- Comercial: comercial@pitchyes.com.br e +55 (11) 5196-9381, de segunda a sexta, das 8h às 20h (horário de Brasília).
- Privacidade e LGPD: privacidade@pitchyes.com.br.

## Planos (valores de referência, em reais)

- Start (desenvolvedores): R$ 0,79/min, sem mensalidade de plataforma, 10 ligações simultâneas, 100 ligações/dia.
- Build (times): R$ 0,69/min + R$ 1.590/mês, 50 ligações simultâneas, 2.000 ligações/dia, WhatsApp/SMS/chat.
- Enterprise (organizações): sob consulta, contratado por volume, com implantação dedicada, SSO, residência de dados e SLA.
- Transferência para humano é cobrada à parte, por minuto transferido.

## Páginas principais

- [Início](${absoluteUrl("/")}): ${SITE_DESCRIPTION}
${section("Soluções", "/solucoes")}${section("Clientes", "/clientes")}${section("Preços", "/precos")}${section("Recursos", "/recursos")}${section("Empresa", "/sobre")}
## Blog

Em construção. Será publicado em ${absoluteUrl("/blog")} com artigos, categorias e tags.

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
