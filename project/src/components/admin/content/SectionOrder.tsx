"use client";

import type { PageSchema } from "@/lib/content/schema/types";
import { moved } from "./pointer";
import styles from "./ContentEditor.module.css";

// Ordem das seções da página, com a opção de ocultar.
//
// Ocultar REMOVE a seção do HTML — não é CSS. `display:none` e `visibility:hidden` tiram
// o texto do que o robô lê, e isso já custou 651 palavras nesta home uma vez.
//
// O topo é intocável: é onde mora o único <h1> da página. O botão fica desabilitado com o
// motivo escrito, em vez de simplesmente não existir.

export type SectionState = { key: string; hidden?: boolean };

export function SectionOrder({
  schema,
  sections,
  onChange,
  onSelecionar,
}: {
  schema: PageSchema;
  sections: SectionState[];
  onChange: (sections: SectionState[]) => void;
  onSelecionar: (key: string) => void;
}) {
  const rotulo = (key: string) =>
    schema.sections.find((s) => s.key === key)?.label ?? key;
  const travada = (key: string) => schema.sections.find((s) => s.key === key)?.lockedReason;

  return (
    <section className={styles.ordem}>
      <h3>Seções da página</h3>
      <ol>
        {sections.map((section, i) => {
          const motivo = travada(section.key);
          return (
            <li key={section.key} data-oculta={section.hidden || undefined}>
              <button type="button" onClick={() => onSelecionar(section.key)}>
                {rotulo(section.key)}
              </button>
              <div className={styles.itemAcoes}>
                <button
                  type="button"
                  onClick={() => onChange(moved(sections, i, i - 1))}
                  disabled={i === 0 || Boolean(motivo)}
                  title={motivo}
                  aria-label={`Mover ${rotulo(section.key)} para cima`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moved(sections, i, i + 1))}
                  disabled={i === sections.length - 1 || Boolean(motivo)}
                  title={motivo}
                  aria-label={`Mover ${rotulo(section.key)} para baixo`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      sections.map((s, j) =>
                        j === i ? { key: s.key, hidden: !s.hidden } : s,
                      ),
                    )
                  }
                  disabled={Boolean(motivo)}
                  title={motivo ?? (section.hidden ? "Mostrar no site" : "Tirar do site")}
                  aria-label={
                    section.hidden
                      ? `Mostrar ${rotulo(section.key)}`
                      : `Ocultar ${rotulo(section.key)}`
                  }
                >
                  {section.hidden ? "☒" : "☑"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={styles.nota}>
        Seção oculta sai do HTML da página, e não apenas da tela: é o que mantém o texto
        coerente para os buscadores.
      </p>
    </section>
  );
}
