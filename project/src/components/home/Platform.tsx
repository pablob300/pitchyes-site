import type { ReactNode } from "react";
import { platform } from "./content";
import styles from "./Platform.module.css";

type PillarKey = (typeof platform.pillars)[number]["key"];

// Structural product mocks for each pillar (wireframe: "mock estrutural da funcionalidade").
const visuals: Record<PillarKey, ReactNode> = {
  infra: (
    <div className={styles.infra}>
      <span className={styles.node}>Sua empresa</span>
      <span className={styles.link} />
      <span className={`${styles.node} ${styles.nodeCore}`}>Infraestrutura PitchYes</span>
      <span className={styles.link} />
      <span className={styles.node}>Telefonia</span>
    </div>
  ),
  build: (
    <div className={styles.build}>
      <p className={styles.prompt}>
        Um agente que qualifica leads de seguro auto e agenda a visita do corretor.
        <span className={styles.caret} />
      </p>
      <span className={styles.buildBtn}>Criar agente →</span>
    </div>
  ),
  test: (
    <div className={styles.test}>
      <strong>1.003</strong>
      <span>
        <i className={styles.okDot} /> Cenários · 0 falhando
      </span>
    </div>
  ),
  omni: (
    <ul className={styles.channels}>
      {["Voz", "WhatsApp", "SMS", "Chat"].map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  ),
  observe: (
    <ul className={styles.calls}>
      {[
        { id: "#4821", t: "02:14" },
        { id: "#4822", t: "00:48" },
        { id: "#4823", t: "01:05" },
      ].map((call) => (
        <li key={call.id}>
          <i className={styles.liveDot} />
          <span className={styles.callId}>Ligação {call.id}</span>
          <span className={styles.wave} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className={styles.callTime}>{call.t}</span>
        </li>
      ))}
    </ul>
  ),
  integrations: (
    <ul className={styles.tiles}>
      {["CRM", "Agenda", "Telefonia", "WhatsApp"].map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  ),
};

export function Platform() {
  return (
    <section className="section" aria-labelledby="plataforma-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{platform.eyebrow}</p>
          <h2 id="plataforma-title">{platform.title}</h2>
          <p className="lead">{platform.lead}</p>
        </div>
        <div className={styles.grid}>
          {platform.pillars.map((p) => (
            <article key={p.key} className={styles.card}>
              <p className="eyebrow">{p.eyebrow}</p>
              <h3>{p.title}</h3>
              <p className={styles.text}>{p.text}</p>
              <div className={styles.visual} aria-hidden="true">
                {visuals[p.key]}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
