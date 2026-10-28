"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Agent, Hero } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { gsap, motion, useGSAP } from "@/lib/gsap";
import { useHeroSync } from "./HeroSync";
import styles from "./AgentWidget.module.css";

// Hero player: a circular 3D carousel of agent cards (pattern from bland.ai's home).
// The front card plays its MP3; arrows, dots, swipe/drag, trackpad and the keyboard spin
// the ring. Documented in System/components/agent-widget.html.
//
// Every card is in the server HTML with its final text. The ring position is a single
// float (`pos`) tweened by GSAP; each frame writes transform/opacity straight to the
// cards, so React only re-renders when the front card changes.
//
// One card per word of the h1 (hero.titleWords): the front card follows the word that is
// showing (HeroSync), and spinning the ring moves the word too. Mouse over the player or
// audio playing pauses the rotation.

/** Orb colors cycle through these; built only from the two brand accents and their tints. */
const TONES = 4;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Wraps a card's distance to the front into [-n/2, n/2): the ring has no ends. */
function offsetOf(index: number, pos: number, n: number) {
  let o = (((index - pos) % n) + n) % n;
  if (o >= n / 2) o -= n;
  return o;
}

/** Where a card sits for a given distance to the front (0 = front, ±1 = neighbors). */
function place(o: number) {
  const a = Math.abs(o);
  const s = Math.sign(o);
  const near = Math.min(a, 1);
  // Past the neighbors the card keeps sliding a little and fades out behind them.
  const x = s * (near * 58 + Math.max(0, a - 1) * 18); // % of the card width
  const z = -Math.min(a, 2) * 150;
  const rotate = -s * near * 32;
  const opacity = a <= 1 ? 1 : Math.max(0, 1 - (a - 1) / 0.6);
  return {
    transform: `translate3d(${x.toFixed(3)}%, 0, ${z.toFixed(2)}px) rotateY(${rotate.toFixed(3)}deg)`,
    opacity: Number(opacity.toFixed(3)),
    zIndex: 100 - Math.round(a * 10),
  };
}

export function AgentWidget({
  content,
  agents,
  editable,
}: {
  content: Hero["widget"];
  agents: Agent[];
  editable?: boolean;
}) {
  const { eyebrow, hint } = content;
  const n = agents.length;
  const edit = editFn(editable);

  const { index: active, setIndex, setPaused } = useHeroSync();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ring = useRef({ pos: 0, target: 0 });
  const orbTimelines = useRef<gsap.core.Timeline[]>([]);
  const reduced = useRef(false);
  const suppressClick = useRef(false);

  const render = useCallback(() => {
    const { pos } = ring.current;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const p = place(offsetOf(i, pos, n));
      card.style.transform = p.transform;
      card.style.opacity = String(p.opacity);
      card.style.zIndex = String(p.zIndex);
      card.style.pointerEvents = p.opacity < 0.05 ? "none" : "";
    });
  }, [n]);

  /** Spins the ring to an absolute (unbounded) position; the front card is pos mod n. */
  const spinTo = useCallback(
    (target: number, velocity = 0) => {
      ring.current.target = target;
      setIndex(((target % n) + n) % n);
      gsap.to(ring.current, {
        pos: target,
        duration: reduced.current ? 0 : Math.min(0.9, 0.55 + Math.abs(velocity) * 0.1),
        ease: "power3.out",
        overwrite: true,
        onUpdate: render,
      });
    },
    [n, render, setIndex],
  );

  // The shared clock moved on to the next word: follow it the short way around the ring.
  useEffect(() => {
    const at = ((Math.round(ring.current.target) % n) + n) % n;
    if (n > 1 && at !== active) spinTo(ring.current.target + offsetOf(active, ring.current.target, n));
  }, [active, n, spinTo]);

  // While a sample plays, the words and the cards stay put.
  useEffect(() => setPaused("audio", playing), [playing, setPaused]);

  const step = useCallback((dir: number) => spinTo(ring.current.target + dir), [spinTo]);

  /** Shortest way around the ring to a given card. */
  const goTo = useCallback(
    (index: number) => spinTo(ring.current.target + offsetOf(index, ring.current.target, n)),
    [n, spinTo],
  );

  // Liquid-metal orbs: every layer loops slowly on transform only. Playing speeds the
  // front orb up, so it looks like it is talking. Paused while the hero is off screen.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motion.reduce, () => {
        reduced.current = true;
      });
      mm.add(motion.noPreference, () => {
        reduced.current = false;
        orbTimelines.current = cardRefs.current.map((card, i) => {
          const q = gsap.utils.selector(card);
          const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "sine.inOut" } });
          // Every layer spans exactly one loop (3d) and ends where it started — whole turns,
          // even number of yoyo legs — so the restart is seamless.
          const d = 5 + (i % 3);
          const loop = d * 3;
          tl.to(q("[data-orb=swirl]"), { rotation: 720, duration: loop, ease: "none" }, 0)
            .to(q("[data-orb=flow]"), { rotation: -360, duration: loop, ease: "none" }, 0)
            .to(q("[data-orb=band]"), { scaleY: 1.35, scaleX: 0.92, y: -3, duration: loop / 6, yoyo: true, repeat: 5 }, 0)
            .to(q("[data-orb=arc-top]"), { y: 5, scaleX: 1.08, duration: loop / 8, yoyo: true, repeat: 7 }, 0)
            .to(q("[data-orb=arc-bottom]"), { y: -5, scaleX: 0.94, duration: loop / 10, yoyo: true, repeat: 9 }, 0)
            .to(q("[data-orb=glint]"), { x: 10, y: 6, opacity: 0.55, duration: loop / 4, yoyo: true, repeat: 3 }, 0);
          return tl;
        });
        const io = new IntersectionObserver(([entry]) => {
          orbTimelines.current.forEach((tl) => (entry.isIntersecting ? tl.play() : tl.pause()));
        });
        if (rootRef.current) io.observe(rootRef.current);
        return () => {
          io.disconnect();
          orbTimelines.current = [];
        };
      });
    },
    { scope: rootRef, dependencies: [n] },
  );

  // The server HTML already has the resting layout; this also disables clicks on the
  // fully faded cards behind the neighbors (and re-lays out if the list is edited).
  useEffect(() => render(), [render]);

  useEffect(() => {
    orbTimelines.current.forEach((tl, i) => {
      gsap.to(tl, { timeScale: playing && i === active ? 3 : 1, duration: 0.6, overwrite: true });
    });
  }, [playing, active]);

  // A new front card always starts from zero, without downloading its audio early.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setFailed(false);
  }, [active]);

  // Swipe / drag. touch-action: pan-y leaves vertical scrolling to the browser.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || n < 2) return;
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastT = 0;
    let vx = 0;
    let pointerId: number | null = null;
    let dragging = false;

    const width = () => (cardRefs.current[0]?.offsetWidth ?? 280) * 0.58;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startPos = ring.current.pos;
      vx = 0;
      dragging = false;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        try {
          stage.setPointerCapture(e.pointerId);
        } catch {
          // pointer already gone (e.g. released between events): the drag still works
        }
        gsap.killTweensOf(ring.current);
      }
      const now = performance.now();
      vx = (e.clientX - lastX) / Math.max(1, now - lastT); // px per ms
      lastX = e.clientX;
      lastT = now;
      ring.current.pos = startPos - dx / width();
      render();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      // A flick carries the ring further; never more than two cards per gesture.
      const fling = Math.max(-2, Math.min(2, (-vx * 220) / width()));
      const from = Math.round(startPos);
      const target = Math.round(ring.current.pos + fling);
      spinTo(Math.max(from - 2, Math.min(from + 2, target)), fling);
    };
    const cancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (dragging) spinTo(Math.round(ring.current.pos));
      dragging = false;
    };

    // Two-finger horizontal swipe on a trackpad: one card per gesture.
    let wheelLock = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelLock = now + 450;
      step(e.deltaX > 0 ? 1 : -1);
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", cancel);
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", cancel);
      stage.removeEventListener("wheel", wheel);
    };
  }, [n, render, spinTo, step]);

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

  function onCardClick(index: number) {
    if (suppressClick.current) return;
    if (index === active) void toggle();
    else goTo(index);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  }

  if (n === 0) return null;
  const agent = agents[active] ?? agents[0];
  const progress = duration ? Math.min(1, elapsed / duration) : 0;
  const status = failed
    ? "Não foi possível tocar o áudio. Tente novamente."
    : playing
      ? `Tocando · ${formatTime(elapsed)}${duration ? ` de ${formatTime(duration)}` : ""}`
      : elapsed > 0
        ? `Pausado · ${formatTime(elapsed)}${duration ? ` de ${formatTime(duration)}` : ""}`
        : hint;

  return (
    <div
      id="fale-com-a-ia"
      ref={rootRef}
      className={styles.widget}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Agentes de voz da PitchYes"
      onKeyDown={onKeyDown}
      // Mouse over the player pauses the rotation (touch has no hover: a tap would leave it paused).
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused("hover", true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused("hover", false)}
    >
      <div ref={stageRef} className={styles.stage} {...edit("hero.titleWords")}>
        {agents.map((item, i) => {
          const isFront = i === active;
          const p = place(offsetOf(i, 0, n));
          return (
            <button
              key={`${item.name}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              type="button"
              className={styles.card}
              style={{ transform: p.transform, opacity: p.opacity, zIndex: p.zIndex } as CSSProperties}
              data-tone={i % TONES}
              data-front={isFront || undefined}
              data-playing={(isFront && playing) || undefined}
              tabIndex={isFront ? 0 : -1}
              aria-roledescription="slide"
              onClick={() => onCardClick(i)}
            >
              <span className={styles.orb} aria-hidden="true">
                <span className={styles.sphere}>
                  <span className={styles.swirl} data-orb="swirl" />
                  <span className={styles.flow} data-orb="flow" />
                  <span className={styles.band} data-orb="band" />
                  <span className={styles.arcTop} data-orb="arc-top" />
                  <span className={styles.arcBottom} data-orb="arc-bottom" />
                  <span className={styles.glint} data-orb="glint" />
                </span>
                <span className={styles.play}>
                  {isFront && playing ? <span className={styles.pauseIcon} /> : <span className={styles.playIcon} />}
                </span>
              </span>
              <span className={styles.eyebrow} {...(i === 0 ? edit("hero.widget.eyebrow") : {})}>
                {eyebrow}
              </span>
              <span className={styles.name}>{item.name}</span>
              {/* Sem aria-label: o nome acessível sai do texto visível ("Ouça nosso agente de
                  Saúde") mais a ação, só para leitor de tela — quem navega por comando de voz
                  fala o que vê (WCAG 2.5.3, PageSpeed "label-content-name-mismatch"). */}
              <span className="visually-hidden">
                {`, ${isFront ? (playing ? "pausar" : "tocar") : "mostrar"} (${i + 1} de ${n})`}
              </span>
              <span className={styles.progress} aria-hidden="true">
                <span style={{ transform: `scaleX(${isFront ? progress : 0})` }} />
              </span>
            </button>
          );
        })}
      </div>

      {n > 1 && (
        <div className={styles.controls}>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => step(-1)} aria-label="Agente anterior">
            <span aria-hidden="true" />
          </button>
          <div className={styles.dots}>
            {agents.map((item, i) => (
              <button
                key={`${item.name}-${i}`}
                type="button"
                className={styles.dot}
                aria-current={i === active || undefined}
                aria-label={`Agente de ${item.name}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => step(1)} aria-label="Próximo agente">
            <span aria-hidden="true" />
          </button>
        </div>
      )}

      <p className={styles.hint} role="status" {...edit("hero.widget.hint")}>
        <span className={styles.cursor} aria-hidden="true" />
        {status}
      </p>

      {/* preload="none": the MP3 is only downloaded when someone presses play */}
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
  );
}
