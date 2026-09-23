"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Client } from "@/content/clients";
import type { ClientLogos as ClientLogosContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { gsap, motion, useGSAP } from "@/lib/gsap";
import styles from "./ClientLogos.module.css";

// Faixa de logos em toda a largura da tela, rolando sem parar. O HTML já traz as duas
// cópias da lista (a segunda é decorativa) — os robôs leem os nomes sem depender do script.
// Animação só de transform, como manda o System; sem movimento quando a pessoa pede menos
// movimento no sistema.

const SPEED = 40; // segundos para percorrer uma cópia inteira

export function ClientLogos({
  content,
  clients,
  editable,
}: {
  content: ClientLogosContent;
  clients: Client[];
  editable?: boolean;
}) {
  const edit = editFn(editable);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(motion.noPreference, () => {
        tween.current = gsap.to(track.current, {
          xPercent: -50,
          duration: SPEED,
          ease: "none",
          repeat: -1,
        });
        return () => {
          tween.current?.kill();
          tween.current = null;
        };
      });
      return () => media.revert();
    },
    { scope: track },
  );

  const row = (copy: number) =>
    clients.map((client) => (
      <li key={`${copy}-${client.name}`} className={styles.item}>
        <Image
          src={client.logo}
          alt={`Logo da ${client.name}`}
          width={client.width}
          height={client.height}
          className={styles.logo}
          // SVG não passa pelo otimizador do Next (é servido direto de /public)
          unoptimized
        />
      </li>
    ));

  return (
    <section className={styles.section} aria-labelledby="clientes-title">
      <div className="container">
        <h2 id="clientes-title" className={styles.title} data-reveal {...edit("clientLogos.title")}>
          {content.title}
        </h2>
      </div>
      <div
        className={styles.viewport}
        {...edit("@site.clients")}
        onMouseEnter={() => tween.current?.pause()}
        onMouseLeave={() => tween.current?.resume()}
      >
        <div className={styles.track} ref={track}>
          <ul className={styles.row}>{row(0)}</ul>
          <ul className={styles.row} aria-hidden="true">
            {row(1)}
          </ul>
        </div>
      </div>
    </section>
  );
}
