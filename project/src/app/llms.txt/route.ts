import { pages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/sitemap";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { isIndexable } from "@/lib/site";

// /llms.txt — plain-text summary for answer engines (llmstxt.org). Same content as the
// site, written so a model can quote it: what we do, which pages exist, what is factual.
export const dynamic = "force-dynamic";

export function GET() {
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
- Latência média de 400 ms, contra 1.240 ms da média do mercado.
- Mais de 20 milhões de ligações realizadas até hoje.
- Certificações SOC 2 Type II, HIPAA (BAA), PCI DSS v4.0 e FedRAMP; operação em conformidade com a LGPD.
- Implantação típica em cerca de 7 dias (descoberta, construção, testes, produção).
- Atendimento nativo em mais de 40 idiomas, com tradução em tempo real em 23 deles.
- Cobrança por minuto, cobrindo modelo de linguagem, transcrição, síntese de voz e telefonia.

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
- [Contato](${absoluteUrl("/contato")})

## Observações

- Idioma do site: português do Brasil.
- Conteúdo canônico: ${absoluteUrl("/")}
${isIndexable() ? "" : "- Ambiente de homologação: não indexar nem citar até a publicação no domínio definitivo.\n"}`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
