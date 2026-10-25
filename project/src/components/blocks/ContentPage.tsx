import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/forms/LeadForm";
import { ButtonLink } from "@/components/ui/Button";
import type { Block, PageContent } from "@/content/types";
import { getLeadForm } from "@/lib/leads";
import styles from "./blocks.module.css";

function Blocks({ block }: { block: Block }) {
  switch (block.kind) {
    case "prose":
      return (
        <section className="section" id={block.id}>
          <div className={`container ${styles.prose}`}>
            {block.eyebrow && <p className="eyebrow" data-reveal>{block.eyebrow}</p>}
            {block.title && <h2 data-reveal>{block.title}</h2>}
            {block.paragraphs.map((p) => (
              <p key={p} data-reveal>
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
              {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={block.columns ?? 3}>
              {block.items.map((item) => (
                <li key={item.title} className={styles.card} data-reveal>
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
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ol className={styles.steps}>
              {block.steps.map((step) => (
                <li key={step.title} data-reveal>
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
                <h2>{block.title}</h2>
                {block.lead && <p className="lead">{block.lead}</p>}
              </div>
            )}
            <dl className={styles.stats}>
              {block.items.map((item) => (
                <div key={item.label} data-reveal>
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
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ul className={styles.checklist}>
              {block.items.map((item) => (
                <li key={item} data-reveal>
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
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={3}>
              {block.items.map((item) => (
                <li key={item.company} className={styles.case} data-reveal>
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
            <h2 className={styles.logosTitle} data-reveal>
              {block.title}
            </h2>
            <ul className={styles.logos}>
              {block.items.map((item) => (
                <li key={item.name} data-reveal>
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
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ul className={styles.plans}>
              {block.plans.map((plan) => (
                <li key={plan.name} className={styles.plan} data-highlight={plan.highlight} data-reveal>
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
            {block.note && <p className={styles.note} data-reveal>{block.note}</p>}
          </div>
        </section>
      );

    case "table":
      return (
        <section className="section" id={block.id}>
          <div className="container">
            <div className="section-head" data-reveal>
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <div className={styles.tableWrap} data-reveal>
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
            <div data-reveal>
              <LeadForm
                form={form}
                title={block.title}
                benefits={block.benefits}
                submitLabel={block.submitLabel}
                note={
                  <>
                    Ao enviar este formulário, você concorda em receber comunicações da PitchYes.
                    Tratamos os seus dados conforme a{" "}
                    <Link href="/privacidade">Política de Privacidade</Link>.
                  </>
                }
              />
            </div>
            <div className={styles.contactAside}>
              <ul className={styles.channels}>
                {block.channels.map((channel) => (
                  <li key={channel.label} data-reveal>
                    <p className={styles.channelLabel}>{channel.label}</p>
                    <p className={styles.channelValue}>
                      {channel.href ? <a href={channel.href}>{channel.value}</a> : channel.value}
                    </p>
                    {channel.hint && <p className={styles.channelHint}>{channel.hint}</p>}
                  </li>
                ))}
              </ul>
              {block.highlight && (
                <div className={styles.highlight} data-reveal>
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
            <h2 className={styles.faqTitle} data-reveal>
              {block.title}
            </h2>
            <div className={styles.faqList}>
              {block.items.map((item) => (
                <details key={item.q} name="faq-page" className={styles.faqItem} data-reveal>
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
              <h2>{block.title}</h2>
              {block.lead && <p className="lead">{block.lead}</p>}
            </div>
            <ul className={styles.grid} data-columns={2}>
              {block.items.map((item) => (
                <li key={item.href} className={styles.card} data-reveal>
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
          <figure className={`container ${styles.figure}`} data-reveal>
            <Image src={block.src} alt={block.alt} width={1600} height={900} />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        </section>
      );
  }
}

export function ContentPage({ content, breadcrumb }: { content: PageContent; breadcrumb?: React.ReactNode }) {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          {content.eyebrow && (
            <p className="eyebrow" data-reveal>
              {content.eyebrow}
            </p>
          )}
          <h1 data-reveal>{content.h1}</h1>
          <p className={`lead ${styles.heroLead}`} data-reveal>
            {content.lead}
          </p>
          {content.cta && (
            <div data-reveal>
              <ButtonLink href={content.cta.href} size="lg">
                {content.cta.label}
              </ButtonLink>
            </div>
          )}
          {breadcrumb}
        </div>
      </section>
      {content.blocks.map((block, i) => (
        <Blocks key={`${block.kind}-${i}`} block={block} />
      ))}
    </>
  );
}
