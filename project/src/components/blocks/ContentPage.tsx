import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/forms/LeadForm";
import { ButtonLink } from "@/components/ui/Button";
import { FORM_ANCHOR } from "@/content/landing/modelo";
import type { Block, PageContent } from "@/content/types";
import { editFn, scoped, type EditFn } from "@/lib/content/edit";
import { youtubeId } from "@/lib/content/landing";
import { getLeadForm, landingForm } from "@/lib/leads";
import styles from "./blocks.module.css";
import { VideoFacade } from "./VideoFacade";

/** Aviso de privacidade abaixo dos formulários. Na landing page abre em outra aba: a pessoa não sai da página. */
function PrivacyNote({ newTab }: { newTab?: boolean }) {
  return (
    <>
      Ao enviar este formulário, você concorda em receber comunicações da PitchYes. Tratamos os seus dados conforme a{" "}
      {newTab ? (
        <a href="/privacidade" target="_blank" rel="noopener">
          Política de Privacidade
        </a>
      ) : (
        <Link href="/privacidade">Política de Privacidade</Link>
      )}
      .
    </>
  );
}

// No editor visual, cada bloco recebe `e` com o prefixo "blocos.b<n>" (lib/content/inner.ts)
// ou "blocos.<chave>" (landing pages): só atributos data-edit, nunca elemento novo. No site
// público, `e` devolve {}. `slug` existe só nas landing pages (vai junto com o lead).
export function ContentBlock({ block, e, slug }: { block: Block; e: EditFn; slug?: string }) {
  switch (block.kind) {
    case "prose":
      return (
        <section className="section" id={block.id}>
          <div className={`container ${styles.prose}`}>
            {block.eyebrow && <p className="eyebrow" data-reveal {...e("eyebrow")}>{block.eyebrow}</p>}
            {block.title && <h2 data-reveal {...e("title")}>{block.title}</h2>}
            {block.paragraphs.map((p) => (
              <p key={p} data-reveal {...e("paragraphs")}>
                {p}
              </p>
            ))}
          </div>
        </section>
      );

    case "features":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              {block.eyebrow && <p className="eyebrow" {...e("eyebrow")}>{block.eyebrow}</p>}
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={block.columns ?? 3}>
              {block.items.map((item, j) => (
                <li key={item.title} className={styles.card} data-reveal {...e(`items.${j}`)}>
                  <h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "steps":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ol className={styles.steps}>
              {block.steps.map((step, j) => (
                <li key={step.title} data-reveal {...e(`steps.${j}`)}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            {block.title && (
              <div className="section-head" data-reveal>
                <h2 {...e("title")}>{block.title}</h2>
                {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
              </div>
            )}
            <dl className={styles.stats}>
              {block.items.map((item, j) => (
                <div key={item.label} data-reveal {...e(`items.${j}`)}>
                  <dt>{item.value}</dt>
                  <dd>{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case "checklist":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ul className={styles.checklist}>
              {block.items.map((item) => (
                <li key={item} data-reveal {...e("items")}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "cases":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={3}>
              {block.items.map((item, j) => (
                <li key={item.company} className={styles.case} data-reveal {...e(`items.${j}`)}>
                  <p className="eyebrow">{item.sector}</p>
                  <h3>{item.company}</h3>
                  <p className={styles.caseHeadline}>{item.headline}</p>
                  {item.quote && (
                    <blockquote>
                      “{item.quote}”
                      {item.person && <cite>{item.person}</cite>}
                    </blockquote>
                  )}
                  {item.pending && <p className={styles.pending}>Case completo em produção.</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "logos":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <h2 className={styles.logosTitle} data-reveal {...e("title")}>
              {block.title}
            </h2>
            {block.lead && (
              <p className={styles.logosLead} data-reveal {...e("lead")}>
                {block.lead}
              </p>
            )}
            <ul
              className={styles.logos}
              data-source={block.source ?? "clientes"}
              {...e(block.source === "proprio" ? "items" : "@site.clients")}
            >
              {block.items.map((item, i) => (
                <li key={`${i}-${item.name}`} data-reveal>
                  <Image
                    src={item.logo}
                    alt={`Logo da ${item.name}`}
                    width={item.width}
                    height={item.height}
                    className={styles.logoImage}
                    // SVG é servido direto de /public, sem passar pelo otimizador
                    unoptimized
                  />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "pricing":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head section-head--center" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ul className={styles.plans} data-count={block.plans.length}>
              {block.plans.map((plan, j) => (
                <li key={plan.name} className={styles.plan} data-highlight={plan.highlight} data-reveal {...e(`plans.${j}`)}>
                  <p className="eyebrow">{plan.audience}</p>
                  <h3>{plan.name}</h3>
                  <p className={styles.price}>
                    <strong>{plan.price}</strong>
                    {plan.priceUnit && <span>{plan.priceUnit}</span>}
                  </p>
                  <p className={styles.fee}>{plan.fee}</p>
                  <ul className={styles.planFeatures}>
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <ButtonLink
                    href={plan.cta.href}
                    variant={plan.highlight ? "solid" : "outline"}
                    className={styles.planCta}
                  >
                    {plan.cta.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
            {block.note && <p className={styles.note} data-reveal {...e("note")}>{block.note}</p>}
          </div>
        </section>
      );

    case "table":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <div className={styles.tableWrap} data-reveal {...e("groups")}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Recurso</th>
                    {block.columns.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                {block.groups.map((group) => (
                  <tbody key={group.title}>
                    <tr className={styles.groupRow}>
                      <th scope="colgroup" colSpan={block.columns.length + 1}>
                        {group.title}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((v, i) => (
                          <td key={`${row.label}-${block.columns[i]}`}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </div>
        </section>
      );

    case "contact": {
      const form = getLeadForm(block.form);
      if (!form) return null;
      return (
        <section className="section" id="formulario">
          <div className={`container ${styles.contact}`}>
            <div data-reveal {...e("title")}>
              <LeadForm
                form={form}
                title={block.title}
                benefits={block.benefits}
                submitLabel={block.submitLabel}
                note={<PrivacyNote />}
              />
            </div>
            <div className={styles.contactAside}>
              <ul className={styles.channels}>
                {block.channels.map((channel, j) => (
                  <li key={channel.label} data-reveal {...e(`channels.${j}`)}>
                    <p className={styles.channelLabel}>{channel.label}</p>
                    <p className={styles.channelValue}>
                      {channel.href ? <a href={channel.href}>{channel.value}</a> : channel.value}
                    </p>
                    {channel.hint && <p className={styles.channelHint}>{channel.hint}</p>}
                  </li>
                ))}
              </ul>
              {block.highlight && (
                <div className={styles.highlight} data-reveal {...e("highlight.title")}>
                  <h3>{block.highlight.title}</h3>
                  <p>{block.highlight.text}</p>
                  {block.highlight.stats && (
                    <dl className={styles.highlightStats}>
                      {block.highlight.stats.map((stat) => (
                        <div key={stat.label}>
                          <dt>{stat.value}</dt>
                          <dd>{stat.label}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "faq":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <h2 className={styles.faqTitle} data-reveal {...e("title")}>
              {block.title}
            </h2>
            <div className={styles.faqList}>
              {block.items.map((item, j) => (
                <details key={item.q} name="faq-page" className={styles.faqItem} data-reveal {...e(`items.${j}`)}>
                  <summary>
                    {item.q}
                    <span className={styles.faqIcon} aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );

    case "links":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={2}>
              {block.items.map((item, j) => (
                <li key={item.href} className={styles.card} data-reveal {...e(`items.${j}`)}>
                  <h3>
                    <Link href={item.href}>{item.title} →</Link>
                  </h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "image":
      return (
        <section className="section" id={block.id}>
          <figure className={`container ${styles.figure}`} data-reveal {...e("src")}>
            <Image src={block.src} alt={block.alt} width={1600} height={900} />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        </section>
      );

    // --- Landing pages ------------------------------------------------------------
    case "heroForm":
      return (
        <section className={styles.lpHero} id={block.id}>
          <div className={`container ${styles.lpHeroGrid}`}>
            <div className={styles.lpHeroText}>
              {block.eyebrow && (
                <p className="eyebrow" data-reveal {...e("eyebrow")}>
                  {block.eyebrow}
                </p>
              )}
              <h1 data-reveal {...e("title")}>{block.title}</h1>
              <p className={`lead ${styles.heroLead}`} data-reveal {...e("lead")}>
                {block.lead}
              </p>
              <ul className={styles.lpBullets} data-reveal {...e("bullets")}>
                {block.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {block.proof && (
                <p className={styles.lpProof} data-reveal {...e("proof")}>
                  {block.proof}
                </p>
              )}
            </div>
            <div data-reveal {...e("formTitle")}>
              <LeadForm
                form={landingForm}
                id={FORM_ANCHOR}
                title={block.formTitle}
                submitLabel={block.submitLabel}
                pagina={slug}
                note={
                  <>
                    {block.formNote && <strong>{block.formNote} </strong>}
                    <PrivacyNote newTab />
                  </>
                }
              />
            </div>
          </div>
        </section>
      );

    case "video": {
      const id = youtubeId(block.videoId);
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              {block.eyebrow && <p className="eyebrow" {...e("eyebrow")}>{block.eyebrow}</p>}
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <div className={styles.lpVideoGrid}>
              <div data-reveal {...e("videoId")}>
                {id && <VideoFacade id={id} alt={block.alt} poster={block.poster} />}
              </div>
              <div className={styles.lpVideoAside}>
                {block.steps && block.steps.length > 0 && (
                  <div data-reveal {...e("steps")}>
                    {block.stepsTitle && <h3>{block.stepsTitle}</h3>}
                    <ol className={styles.lpNumbered}>
                      {block.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {block.stats && block.stats.length > 0 && (
                  <dl className={styles.lpMiniStats} data-reveal {...e("stats")}>
                    {block.stats.map((stat) => (
                      <div key={stat.label}>
                        <dt>{stat.value}</dt>
                        <dd>{stat.label}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {block.quote && (
                  <blockquote className={styles.lpQuote} data-reveal {...e("quote")}>
                    “{block.quote}”{block.person && <cite>{block.person}</cite>}
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "funnel":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              {block.eyebrow && <p className="eyebrow" {...e("eyebrow")}>{block.eyebrow}</p>}
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            <ol className={styles.lpFunnel} data-reveal {...e("steps")}>
              {block.steps.map((step, j) => (
                // Cada degrau é mais estreito que o anterior: o desenho é do funil, não do número.
                <li key={`${j}-${step.label}`} style={{ "--degrau": j } as React.CSSProperties}>
                  <strong>{step.value}</strong>
                  <span>{step.label}</span>
                  <em>{step.percent}</em>
                </li>
              ))}
            </ol>
            {block.note && (
              <p className={styles.note} data-reveal {...e("note")}>
                {block.note}
              </p>
            )}
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              {block.eyebrow && <p className="eyebrow" {...e("eyebrow")}>{block.eyebrow}</p>}
              <h2 {...e("title")}>{block.title}</h2>
              {block.lead && <p className="lead" {...e("lead")}>{block.lead}</p>}
            </div>
            {block.stats && block.stats.length > 0 && (
              <dl className={`${styles.stats} ${styles.lpTestimonialStats}`} data-reveal {...e("stats")}>
                {block.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.value}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ul className={styles.grid} data-columns={3}>
              {block.items.map((item, j) => (
                <li key={`${j}-${item.name}`} className={styles.case} data-reveal {...e(`items.${j}`)}>
                  <p className={styles.lpStars} role="img" aria-label="Avaliação: 5 de 5 estrelas">
                    ★★★★★
                  </p>
                  <blockquote>“{item.quote}”</blockquote>
                  <p className={styles.lpPerson}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.role} · {item.company}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "ctaFinal":
      return (
        <section className={styles.lpCtaFinal} id={block.id}>
          <div className={`container ${styles.lpCtaInner}`}>
            <h2 data-reveal {...e("title")}>{block.title}</h2>
            {block.lead && (
              <p className="lead" data-reveal {...e("lead")}>
                {block.lead}
              </p>
            )}
            <ul className={styles.lpBullets} data-reveal {...e("items")}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div data-reveal>
              <ButtonLink href={`#${FORM_ANCHOR}`} size="lg" {...e("button")}>
                {block.button} →
              </ButtonLink>
            </div>
          </div>
        </section>
      );
  }
}

export function ContentPage({
  content,
  breadcrumb,
  editable,
}: {
  content: PageContent;
  breadcrumb?: React.ReactNode;
  /** Pré-visualização do editor visual: acrescenta os data-edit (lib/content/edit.ts). */
  editable?: boolean;
}) {
  const edit = editFn(editable);
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          {content.eyebrow && (
            <p className="eyebrow" data-reveal {...edit("eyebrow")}>
              {content.eyebrow}
            </p>
          )}
          <h1 data-reveal {...edit("h1")}>{content.h1}</h1>
          <p className={`lead ${styles.heroLead}`} data-reveal {...edit("lead")}>
            {content.lead}
          </p>
          {content.cta && (
            <div data-reveal>
              <ButtonLink href={content.cta.href} size="lg" {...edit("cta.label")}>
                {content.cta.label}
              </ButtonLink>
            </div>
          )}
          {breadcrumb}
        </div>
      </section>
      {content.blocks.map((block, i) => (
        <ContentBlock key={`${block.kind}-${i}`} block={block} e={scoped(edit, `blocos.b${i}`)} />
      ))}
    </>
  );
}
