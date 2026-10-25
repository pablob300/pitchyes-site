import { Fragment } from "react";
import { CATEGORY_LABEL } from "@/lib/admin/pagespeed/guide";
import {
  PRIORITY_LABEL,
  STRATEGY_LABEL,
  savingsText,
  type Priority,
  type Report,
  type ReportTask,
} from "@/lib/admin/pagespeed/report";
import { CATEGORIES, STRATEGIES } from "@/lib/admin/pagespeed/types";
import styles from "./PageSpeed.module.css";

// Plano de ação do relatório: uma tarefa por auditoria que falhou, da mais para a
// menos impactante. As de prioridade alta já vêm abertas.

/** Converte os trechos de Markdown do Lighthouse (`código` e [link](url)) em elementos. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\)|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link && /^https?:\/\//.test(link[2])) {
          return (
            <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">
              {link[1]}
            </a>
          );
        }
        if (/^`[^`]+`$/.test(part)) return <code key={index}>{part.slice(1, -1)}</code>;
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

function Task({ task, index }: { task: ReportTask; index: number }) {
  const where = STRATEGIES.filter((strategy) => task.where[strategy]);
  return (
    <li>
      <details className={styles.task} open={task.priority === "alta" || undefined}>
        <summary>
          <span className={styles.taskIndex}>{index + 1}.</span>
          <span>
            <span className={styles.taskTitle}>
              <RichText text={task.title} />
            </span>
            <span className={styles.taskMeta}>
              <span className={styles.priority} data-prioridade={task.priority}>
                {PRIORITY_LABEL[task.priority]}
              </span>
              <span className={styles.tag}>
                {CATEGORY_LABEL[task.category]}
                {task.groupLabel ? ` › ${task.groupLabel}` : ""}
              </span>
              {where.map((strategy) => {
                const text = savingsText(task.where[strategy]);
                return (
                  <span key={strategy} className={styles.tag}>
                    {STRATEGY_LABEL[strategy]}
                    {text ? `: ${text}` : ""}
                  </span>
                );
              })}
            </span>
          </span>
          {task.priority !== "esperado" && (
            <span className={styles.taskImpact} title="Pontos estimados que a correção devolve à nota">
              ~{task.impact.toFixed(1).replace(".", ",")} pts
            </span>
          )}
        </summary>

        <div className={styles.taskBody}>
          {task.note && <p className={styles.notice}>{task.note}</p>}
          <div>
            <h3>O que fazer</h3>
            <p>
              <RichText text={task.action} />
            </p>
          </div>
          <div>
            <h3>Por que importa</h3>
            <p className={styles.original}>
              <RichText text={task.description} />
            </p>
          </div>
          {task.items.length > 0 && (
            <div>
              <h3>
                Itens afetados
                {task.itemCount > task.items.length ? ` (${task.items.length} de ${task.itemCount})` : ` (${task.items.length})`}
              </h3>
              <ul className={styles.items}>
                {task.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <div className={styles.itemLabel}>{item.label}</div>
                    {item.detail && <div className={styles.itemDetail}>{item.detail}</div>}
                    {item.snippet && <code className={styles.itemSnippet}>{item.snippet}</code>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className={styles.muted}>
            Auditoria <code>{task.id}</code>
            {task.originalTitle ? ` · “${task.originalTitle}”` : ""}
          </p>
        </div>
      </details>
    </li>
  );
}

export function ActionPlan({ report }: { report: Report }) {
  const count = (priority: Priority) => report.tasks.filter((task) => task.priority === priority).length;
  return (
    <>
      <div className={styles.summary}>
        {(["alta", "media", "baixa", "esperado"] as Priority[]).map((priority) =>
          count(priority) ? (
            <span key={priority} className={styles.priority} data-prioridade={priority}>
              {count(priority)} {PRIORITY_LABEL[priority].toLowerCase()}
            </span>
          ) : null,
        )}
      </div>

      {report.tasks.length ? (
        <ol className={styles.plan}>
          {report.tasks.map((task, index) => (
            <Task key={task.id} task={task} index={index} />
          ))}
        </ol>
      ) : (
        <p className={styles.notice}>Nenhuma auditoria abaixo de 90. A página está no máximo que o Lighthouse mede.</p>
      )}

      <details className={styles.passed}>
        <summary>Já está certo ({report.passed.length})</summary>
        {CATEGORIES.map((category) => {
          const passed = report.passed.filter((audit) => audit.category === category);
          if (!passed.length) return null;
          return (
            <div key={category} className={styles.passedGroup}>
              <h3>{CATEGORY_LABEL[category]}</h3>
              <ul>
                {passed.map((audit) => (
                  <li key={audit.id}>
                    <RichText text={audit.title} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </details>
    </>
  );
}
