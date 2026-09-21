"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { CODE_LENGTH, CODE_RESEND_SECONDS, MIN_PASSWORD_LENGTH } from "@/lib/admin/config";
import styles from "./AuthForms.module.css";

// Formulários das telas de entrada. Mesmo desenho do LeadForm do site: estado local,
// fetch para a rota de API, mensagem em uma área com role="status".

type ApiResponse = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  destino?: string;
  etapa?: string;
  email?: string;
};

async function post(url: string, body: unknown): Promise<ApiResponse> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    return (await response.json()) as ApiResponse;
  } catch {
    return { ok: false, message: "Sem conexão com o servidor. Tente de novo." };
  }
}

function Erro({ children }: { children?: string }) {
  return (
    <p className={styles.status} role="status">
      {children ?? ""}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSending(true);
        setMessage("");
        const result = await post("/api/admin/login", {
          email: data.get("email"),
          senha: data.get("senha"),
          next,
        });
        if (!result.ok) {
          setSending(false);
          setMessage(result.message ?? "Não foi possível entrar.");
          return;
        }
        if (result.etapa === "codigo") {
          const query = new URLSearchParams({ email: result.email ?? "" });
          if (next) query.set("next", next);
          router.push(`/admin/verificar?${query.toString()}`);
          return;
        }
        router.replace(result.destino ?? "/admin/leads");
        router.refresh();
      }}
    >
      <header className={styles.head}>
        <h1>Entrar no painel</h1>
        <p>Use o e-mail que recebeu acesso.</p>
      </header>

      <label className={styles.field}>
        <span>E-mail</span>
        <input type="email" name="email" required autoComplete="username" autoFocus placeholder="voce@empresa.com.br" />
      </label>

      <label className={styles.field}>
        <span>Senha</span>
        <input type="password" name="senha" required autoComplete="current-password" />
      </label>

      <button type="submit" className={buttonClass("solid", "md", styles.submit)} disabled={sending}>
        {sending ? "Entrando…" : "Entrar"}
      </button>

      <Erro>{message}</Erro>

      <p className={styles.help}>
        <Link href="/admin/recuperar">Esqueci minha senha</Link>
      </p>
    </form>
  );
}

export function CodeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const masked = params.get("email") ?? "seu e-mail";
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");
  const [wait, setWait] = useState(CODE_RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSending(true);
        setMessage("");
        const result = await post("/api/admin/login/codigo", { codigo: data.get("codigo"), next });
        setSending(false);
        if (!result.ok) {
          setMessage(result.message ?? "Código incorreto.");
          return;
        }
        router.replace(result.destino ?? "/admin/leads");
        router.refresh();
      }}
    >
      <header className={styles.head}>
        <h1>Confirme o acesso</h1>
        <p>
          Este aparelho é novo por aqui. Enviamos um código de {CODE_LENGTH} dígitos para{" "}
          <strong>{masked}</strong>.
        </p>
      </header>

      <label className={styles.field}>
        <span>Código</span>
        <input
          type="text"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          pattern={`\\d{${CODE_LENGTH}}`}
          required
          autoFocus
          className={styles.code}
          placeholder="000000"
        />
      </label>

      <button type="submit" className={buttonClass("solid", "md", styles.submit)} disabled={sending}>
        {sending ? "Conferindo…" : "Confirmar"}
      </button>

      <Erro>{message}</Erro>

      <p className={styles.help}>
        <button
          type="button"
          className={styles.linkButton}
          disabled={wait > 0}
          onClick={async () => {
            setInfo("");
            const result = await post("/api/admin/login/codigo/reenviar", {});
            setWait(CODE_RESEND_SECONDS);
            setInfo(result.ok ? "Código reenviado." : (result.message ?? "Não foi possível reenviar."));
          }}
        >
          {wait > 0 ? `Reenviar código em ${wait}s` : "Reenviar código"}
        </button>
        {info && <span className={styles.info}> {info}</span>}
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  if (done) {
    return (
      <div className={styles.form}>
        <header className={styles.head}>
          <h1>Verifique seu e-mail</h1>
          <p>{done}</p>
        </header>
        <p className={styles.help}>
          <Link href="/admin/entrar">Voltar para entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSending(true);
        const result = await post("/api/admin/senha/recuperar", { email: data.get("email") });
        setSending(false);
        setDone(result.message ?? "Se esse e-mail tiver acesso ao painel, enviamos um link em instantes.");
      }}
    >
      <header className={styles.head}>
        <h1>Definir ou recuperar senha</h1>
        <p>Informe seu e-mail e enviamos um link para criar uma senha nova.</p>
      </header>

      <label className={styles.field}>
        <span>E-mail</span>
        <input type="email" name="email" required autoComplete="username" autoFocus placeholder="voce@empresa.com.br" />
      </label>

      <button type="submit" className={buttonClass("solid", "md", styles.submit)} disabled={sending}>
        {sending ? "Enviando…" : "Enviar link"}
      </button>

      <p className={styles.help}>
        <Link href="/admin/entrar">Voltar para entrar</Link>
      </p>
    </form>
  );
}

export function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const usuario = params.get("u") ?? "";
  const token = params.get("t") ?? "";
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!usuario || !token) {
    return (
      <div className={styles.form}>
        <header className={styles.head}>
          <h1>Link inválido</h1>
          <p>Este endereço não tem o código de confirmação. Peça um link novo.</p>
        </header>
        <p className={styles.help}>
          <Link href="/admin/recuperar">Pedir novo link</Link>
        </p>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSending(true);
        setMessage("");
        setErrors({});
        const result = await post("/api/admin/senha", {
          usuario,
          token,
          senha: data.get("senha"),
          confirmacao: data.get("confirmacao"),
        });
        setSending(false);
        if (!result.ok) {
          setErrors(result.errors ?? {});
          setMessage(result.message ?? "Não foi possível definir a senha.");
          return;
        }
        router.replace(result.destino ?? "/admin/leads");
        router.refresh();
      }}
    >
      <header className={styles.head}>
        <h1>Criar sua senha</h1>
        <p>Use pelo menos {MIN_PASSWORD_LENGTH} caracteres. Depois disso você já entra no painel.</p>
      </header>

      <label className={styles.field}>
        <span>Nova senha</span>
        <input
          type="password"
          name="senha"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          autoFocus
          aria-invalid={errors.senha ? true : undefined}
        />
        {errors.senha && <span className={styles.fieldError}>{errors.senha}</span>}
      </label>

      <label className={styles.field}>
        <span>Repita a senha</span>
        <input
          type="password"
          name="confirmacao"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          aria-invalid={errors.confirmacao ? true : undefined}
        />
        {errors.confirmacao && <span className={styles.fieldError}>{errors.confirmacao}</span>}
      </label>

      <button type="submit" className={buttonClass("solid", "md", styles.submit)} disabled={sending}>
        {sending ? "Salvando…" : "Salvar e entrar"}
      </button>

      <Erro>{message}</Erro>
    </form>
  );
}
