"use client";

import { useEffect, useRef, useState } from "react";
import type { Hero } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import styles from "./AgentWidget.module.css";

// Amostra de voz de cada agente: o círculo laranja é o play/pause do áudio.
// TODO: conversa ao vivo pelo navegador. Por enquanto o widget toca a locução de exemplo.

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function AgentWidget({
  content,
  editable,
}: {
  content: Hero["widget"];
  editable?: boolean;
}) {
  const { eyebrow, agents, hint } = content;
  const edit = editFn(editable);
  const [agent, setAgent] = useState(agents[0]);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Trocar de agente sempre começa do zero, sem carregar o áudio antes da hora.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setFailed(false);
  }, [agent]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setFailed(true);
    }
  }

  const status = failed
    ? "Não foi possível tocar o áudio. Tente novamente."
    : playing
      ? `Tocando · ${formatTime(elapsed)}${duration ? ` de ${formatTime(duration)}` : ""}`
      : elapsed > 0
        ? `Pausado · ${formatTime(elapsed)}${duration ? ` de ${formatTime(duration)}` : ""}`
        : hint;

  return (
    <div id="fale-com-a-ia" className={styles.widget}>
      <p className={styles.eyebrow} {...edit("hero.widget.eyebrow")}>{eyebrow}</p>

      <div className={styles.pills} role="radiogroup" aria-label="Escolha o agente" {...edit("hero.widget.agents")}>
        {agents.map((item) => (
          <button
            key={item.name}
            type="button"
            role="radio"
            aria-checked={agent.name === item.name}
            className={styles.pill}
            onClick={() => setAgent(item)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={styles.orb}
          data-playing={playing || undefined}
          onClick={toggle}
          aria-label={playing ? `Pausar a amostra do agente ${agent.name}` : `Ouvir o agente ${agent.name}`}
        >
          {playing ? (
            <span className={styles.pauseIcon} aria-hidden="true" />
          ) : (
            <span className={styles.playIcon} aria-hidden="true" />
          )}
        </button>
        <p className={styles.agentName}>Agente {agent.name}</p>
        <p className={styles.hint} role="status">
          {status}
        </p>
        {/* preload="none": o MP3 só é baixado quando a pessoa dá play */}
        <audio
          ref={audioRef}
          src={agent.audio}
          preload="none"
          onPlay={() => {
            setPlaying(true);
            setFailed(false);
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
            setPlaying(false);
            setElapsed(0);
          }}
          onError={() => {
            setPlaying(false);
            setFailed(true);
          }}
        >
          <track kind="captions" />
        </audio>
      </div>
    </div>
  );
}
