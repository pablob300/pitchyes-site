"use client";

import { useState } from "react";
import { hero } from "./content";
import styles from "./AgentWidget.module.css";

const { eyebrow, agents, hint } = hero.widget;

// TODO: connect to the voice agent (browser call). Until then the button only
// acknowledges the click instead of pretending a call started.
export function AgentWidget() {
  const [agent, setAgent] = useState<string>(agents[0]);
  const [requested, setRequested] = useState(false);

  return (
    <div id="fale-com-a-ia" className={styles.widget}>
      <p className={styles.eyebrow}>{eyebrow}</p>

      <div className={styles.pills} role="radiogroup" aria-label="Escolha o agente">
        {agents.map((name) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={agent === name}
            className={styles.pill}
            onClick={() => {
              setAgent(name);
              setRequested(false);
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={styles.orb}
          data-active={requested}
          onClick={() => setRequested(true)}
          aria-label={`Falar com o agente ${agent}`}
        >
          <span className={styles.orbCore} aria-hidden="true" />
        </button>
        <p className={styles.agentName}>Agente {agent}</p>
        <p className={styles.hint} role="status">
          {requested ? "A conversa pelo navegador estará disponível em breve." : hint}
        </p>
      </div>
    </div>
  );
}
