"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { company } from "@/lib/company";
import styles from "./PhoneConfirmDialog.module.css";

// Modal das landing pages entre o formulário e a ligação da IA, em dois passos:
//   "confirm" — a pessoa confere o telefone digitado. Nada foi enviado ainda: o lead só é
//               gravado (e o evento "lead" só sai) depois do "Sim, está correto".
//   "unlock"  — o lead já foi gravado; a pessoa copia o número da IA para salvar nos
//               contatos. "Já salvei" só libera UNLOCK_SECONDS depois de copiar.
// É montado só quando o formulário pede (não existe no HTML do servidor).

export type DialogStep = "confirm" | "unlock";

const UNLOCK_SECONDS = 5;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Navegador sem a API (ou sem permissão): cópia pelo jeito antigo.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function PhoneConfirmDialog({
  step,
  phone,
  sending,
  error,
  onCorrect,
  onConfirm,
  onClose,
  onCallNow,
}: {
  step: DialogStep;
  /** Telefone como a pessoa digitou (já formatado pelo formulário). */
  phone: string;
  sending: boolean;
  /** Falha ao gravar o lead, mostrada no passo "confirm". */
  error?: string;
  onCorrect: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onCallNow: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(UNLOCK_SECONDS);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  // showModal() foca o primeiro botão (o X); o foco certo é a ação principal de cada passo.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [step]);

  useEffect(() => {
    if (!copied || left <= 0) return;
    const timer = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [copied, left]);

  function copy() {
    // A contagem não espera a área de transferência: ela pode ficar pendente (permissão).
    setCopied(true);
    void copyText(company.aiCaller.copy);
  }

  const unlocked = copied && left <= 0;
  const titleId = `phone-dialog-${step}`;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: o mesmo que o X, sem fechar o <dialog> por conta própria.
        event.preventDefault();
        if (!sending) onClose();
      }}
    >
      <button type="button" className={styles.close} onClick={onClose} disabled={sending} aria-label="Fechar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {step === "confirm" ? (
        <div className={styles.body}>
          <span className={styles.icon} data-tone="accent" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
              <path d="M14.5 2a7.5 7.5 0 0 1 7.5 7.5M14.5 5.5a4 4 0 0 1 4 4" />
            </svg>
          </span>
          <h2 id={titleId} className={styles.title}>
            Confirme seu telefone
          </h2>
          <p className={styles.text}>A IA vai ligar para o número abaixo. Confirme se está correto:</p>
          <p className={styles.number} data-box>
            {phone}
          </p>
          <p className={styles.hint}>Se o número estiver errado, a ligação não será concluída.</p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={buttonClass("outline", "lg")} onClick={onCorrect} disabled={sending}>
              Corrigir número
            </button>
            <button type="button" className={buttonClass("solid", "lg")} onClick={onConfirm} disabled={sending} data-autofocus>
              {sending ? "Enviando…" : "Sim, está correto"}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.body}>
          <span className={styles.icon} data-tone="warning" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </span>
          <h2 id={titleId} className={styles.title}>
            Importante: desbloqueie seu telefone
          </h2>
          <p className={styles.text}>Para receber a ligação da nossa IA, é fundamental que você:</p>
          <p className={styles.label}>Adicione este número aos seus contatos:</p>
          <p className={styles.number}>{company.aiCaller.display}</p>
          <p className={styles.text}>
            <strong>Ou</strong> desbloqueie temporariamente chamadas de números desconhecidos.
          </p>
          <p className={styles.hint}>
            Muitas pessoas perdem a demonstração por terem bloqueios ativos. Não deixe isso acontecer com você!
          </p>
          <div className={styles.stack}>
            <button type="button" className={buttonClass("solid", "lg")} onClick={copy} data-autofocus>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              {copied ? "Número copiado" : "Copiar número"}
            </button>
            <button type="button" className={buttonClass("solid", "lg", styles.callNow)} onClick={onCallNow} disabled={!unlocked}>
              {copied && !unlocked ? `Já salvei o contato, pode ligar (${left}s)` : "Já salvei o contato, pode ligar"}
            </button>
          </div>
          <p className={styles.hint} role="status">
            {copied
              ? unlocked
                ? "Pronto! Toque no botão acima para receber a ligação."
                : `Salve o número como "PitchYes IA" nos seus contatos. Liberando em ${left}s…`
              : "Copie o número e salve nos seus contatos para liberar a ligação."}
          </p>
        </div>
      )}
    </dialog>
  );
}
