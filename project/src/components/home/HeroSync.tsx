"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

// Um relógio só para o hero: a palavra do h1 (RotatingWords) e o card do player
// (AgentWidget) mostram sempre o mesmo item. A cada HOLD segundos (a última palavra fica
// LAST_HOLD) o índice avança; os dois componentes animam a partir dele. Clicar ou arrastar
// um card muda o índice e a palavra vai junto.
//
// A rolagem pausa por qualquer motivo registrado em `setPaused`: mouse sobre os cards,
// áudio tocando ou hero fora da tela. Não renderiza elemento nenhum: o HTML do hero é o
// mesmo com ou sem ele.

const HOLD = 2;
const LAST_HOLD = 5;
/** Duração da troca (a palavra rola e o anel gira nesse tempo). */
export const ROLL = 0.5;

type HeroSyncValue = {
  index: number;
  /** Troca feita pela pessoa (clique, arrasto, teclado): o relógio recomeça desse item. */
  setIndex: (index: number) => void;
  setPaused: (reason: string, paused: boolean) => void;
};

const Ctx = createContext<HeroSyncValue>({ index: 0, setIndex: () => {}, setPaused: () => {} });

export const useHeroSync = () => useContext(Ctx);

export function HeroSync({ count, children }: { count: number; children: ReactNode }) {
  const [raw, setRaw] = useState(0);
  const index = count > 0 ? raw % count : 0;
  const pauses = useRef(new Set<string>());
  const call = useRef<gsap.core.Tween | null>(null);

  // Cada troca de índice agenda a próxima; uma troca feita pela pessoa reinicia a contagem.
  useEffect(() => {
    if (count < 2) return;
    const hold = index === count - 1 ? LAST_HOLD : HOLD;
    call.current = gsap.delayedCall((index === 0 && raw === 0 ? 0 : ROLL) + hold, () => setRaw((i) => (i + 1) % count));
    if (pauses.current.size) call.current.pause();
    return () => {
      call.current?.kill();
      call.current = null;
    };
  }, [index, raw, count]);

  const setIndex = useCallback((i: number) => setRaw(((i % count) + count) % count), [count]);

  const setPaused = useCallback((reason: string, paused: boolean) => {
    if (paused) pauses.current.add(reason);
    else pauses.current.delete(reason);
    if (pauses.current.size) call.current?.pause();
    else call.current?.resume();
  }, []);

  const value = useMemo(() => ({ index, setIndex, setPaused }), [index, setIndex, setPaused]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
