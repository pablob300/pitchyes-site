"use client";

import { useState } from "react";
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
//
// Nas landing pages a estrutura também é editável: `estrutura` liga os botões de remover
// um bloco e de adicionar um bloco novo (a paleta de tipos).

export type SectionState = { key: string; hidden?: boolean };

export type Estrutura = {
  paleta: { kind: string; label: string }[];
  onAdicionar: (kind: string) => void;
  onRemover: (key: string) => void;
};

export function SectionOrder({
  schema,
  sections,
  onChange,
  onSelecionar,
  estrutura,
}: {
  schema: PageSchema;
  sections: SectionState[];
  onChange: (sections: SectionState[]) => void;
  onSelecionar: (key: string) => void;
  estrutura?: Estrutura;
}) {
  // Remover pede um segundo clique no mesmo bloco, em vez de uma caixa de confirmação.
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [novo, setNovo] = useState("");
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
                {estrutura && (
                  <button
                    type="button"
                    onClick={() => {
                      if (removendo === section.key) estrutura.onRemover(section.key);
                      else setRemovendo(section.key);
                    }}
                    onBlur={() => setRemovendo((atual) => (atual === section.key ? null : atual))}
                    disabled={Boolean(motivo)}
                    title={motivo ?? (removendo === section.key ? "Clique de novo para remover" : "Remover o bloco")}
                    aria-label={
                      removendo === section.key
                        ? `Confirmar: remover ${rotulo(section.key)}`
                        : `Remover ${rotulo(section.key)}`
                    }
                    data-confirmar={removendo === section.key || undefined}
                  >
                    {removendo === section.key ? "Remover?" : "×"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className={styles.nota}>
        Seção oculta sai do HTML da página, e não apenas da tela: é o que mantém o texto
        coerente para os buscadores.
      </p>
      {estrutura && (
        <div className={styles.novoBloco}>
          <label htmlFor="novo-bloco">Adicionar bloco no fim da página</label>
          <div>
            <select id="novo-bloco" value={novo} onChange={(e) => setNovo(e.target.value)}>
              <option value="">Escolha o tipo</option>
              {estrutura.paleta.map((item) => (
                <option key={item.kind} value={item.kind}>
                  {item.label}
                </option>
              ))}
            </select>
            <button type="button" disabled={!novo} onClick={() => estrutura.onAdicionar(novo)}>
              Adicionar
            </button>
          </div>
          <p className={styles.nota}>O bloco novo nasce com um texto de exemplo; depois é só mover com as setas.</p>
        </div>
      )}
    </section>
  );
}
