"use client";

import { useState } from "react";
import type { ListSpec } from "@/lib/content/schema/types";
import { FieldInput, type ImageMeta } from "./FieldInput";
import { moved, youtubeId } from "./pointer";
import styles from "./ContentEditor.module.css";

// Lista de itens de um bloco: depoimentos, perguntas, etapas, logos.
//
// Adicionar, remover e reordenar sempre reescrevem a LISTA INTEIRA. É o contrato da
// fusão: sobrepor lista por índice não consegue expressar "removi o terceiro item".

export function ListEditor({
  spec,
  items,
  onChange,
}: {
  spec: ListSpec;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const [aberto, setAberto] = useState<number | null>(items.length === 1 ? 0 : null);

  const podeRemover = !spec.fixed && items.length > (spec.min ?? 0);
  const podeAdicionar = !spec.fixed && (spec.max === undefined || items.length < spec.max);

  const trocar = (indice: number, campo: string, valor: unknown, meta?: ImageMeta) => {
    onChange(
      items.map((item, i) => {
        if (i !== indice) return item;
        const proximo = { ...item, [campo]: valor };
        // Enviar o logo já acerta largura e altura: são elas que o next/image usa para
        // reservar o espaço, e ninguém deveria precisar medir a imagem à mão.
        if (meta && "width" in item && "height" in item) {
          proximo.width = meta.largura;
          proximo.height = meta.altura;
        }
        return proximo;
      }),
    );
  };

  return (
    <section className={styles.lista}>
      <header>
        <h3>{spec.label}</h3>
        <span>{items.length}</span>
      </header>
      {spec.help && <p className={styles.nota}>{spec.help}</p>}

      <ol>
        {items.map((item, i) => {
          const titulo = String(item[spec.titleField] ?? "").trim() || `Item ${i + 1}`;
          const expandido = aberto === i;
          return (
            <li key={i} data-aberto={expandido || undefined}>
              <div className={styles.itemTopo}>
                <button
                  type="button"
                  className={styles.itemTitulo}
                  onClick={() => setAberto(expandido ? null : i)}
                  aria-expanded={expandido}
                >
                  {titulo}
                </button>
                {!spec.fixed && (
                  <div className={styles.itemAcoes}>
                    <button
                      type="button"
                      onClick={() => onChange(moved(items, i, i - 1))}
                      disabled={i === 0}
                      aria-label={`Mover ${titulo} para cima`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(moved(items, i, i + 1))}
                      disabled={i === items.length - 1}
                      aria-label={`Mover ${titulo} para baixo`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_, j) => j !== i))}
                      disabled={!podeRemover}
                      aria-label={`Remover ${titulo}`}
                      title={
                        podeRemover
                          ? undefined
                          : `A lista precisa de pelo menos ${spec.min} item(ns).`
                      }
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {expandido && (
                <div className={styles.itemCampos}>
                  {spec.fields.map((field) => (
                    <FieldInput
                      key={field.pointer}
                      field={field}
                      value={item[field.pointer]}
                      onChange={(valor, meta) =>
                        trocar(
                          i,
                          field.pointer,
                          // Colar o endereço do Short é o jeito natural de fazer isso;
                          // o site monta as URLs a partir do código, então guardamos o código.
                          field.pointer === "videoId" && typeof valor === "string"
                            ? youtubeId(valor)
                            : valor,
                          meta,
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {podeAdicionar && (
        <button
          type="button"
          className={styles.adicionar}
          onClick={() => {
            onChange([...items, { ...spec.template }]);
            setAberto(items.length);
          }}
        >
          + Adicionar
        </button>
      )}
      {spec.fixed && (
        <p className={styles.nota}>
          Esta lista tem tamanho fixo: dá para trocar o texto, não para adicionar nem remover.
        </p>
      )}
    </section>
  );
}
