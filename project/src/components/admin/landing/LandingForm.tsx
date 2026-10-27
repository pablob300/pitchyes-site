"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { slugify, slugifyRaw } from "@/lib/blog/slug";
import styles from "./Landing.module.css";

// Nome, endereço e SEO de uma landing page. O mesmo formulário cria (a partir do modelo),
// duplica (a partir de outra página) e edita ("Configurações da página").

export type LandingFormValues = {
  nome: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  noindex?: boolean;
};

type Resposta = { ok: boolean; message?: string; errors?: Record<string, string>; pagina?: { id: string; url: string } };

function Contador({ value, ideal }: { value: string; ideal: [number, number] }) {
  const n = value.trim().length;
  const fora = n > 0 && (n < ideal[0] || n > ideal[1]);
  return (
    <em data-alerta={fora || undefined}>
      {n} caracteres · ideal {ideal[0]}–{ideal[1]}
    </em>
  );
}

export function LandingForm({
  inicial,
  modo,
  id,
  de,
  onPronto,
}: {
  inicial: LandingFormValues;
  /** criar: do modelo · duplicar: cópia de `de` · editar: a página `id`. */
  modo: "criar" | "duplicar" | "editar";
  id?: string;
  de?: string;
  onPronto: (resposta: Resposta) => void;
}) {
  const [valores, setValores] = useState(inicial);
  // Enquanto ninguém mexe no endereço, ele acompanha o nome (só na criação).
  const [slugManual, setSlugManual] = useState(modo === "editar");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const set = (campo: keyof LandingFormValues, valor: string | boolean) =>
    setValores((atual) => {
      const proximo = { ...atual, [campo]: valor };
      if (campo === "nome" && !slugManual) proximo.slug = slugify(String(valor));
      return proximo;
    });

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");
    const response = await fetch("/api/admin/landing-pages", {
      method: modo === "editar" ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(modo === "editar" ? { id, ...valores } : { acao: modo, de, ...valores }),
    });
    const json = (await response.json()) as Resposta;
    setEnviando(false);
    setErrors(json.errors ?? {});
    if (!json.ok) {
      setMensagem(json.message ?? "Não foi possível salvar.");
      return;
    }
    onPronto(json);
  }

  const campo = (nome: keyof LandingFormValues) => ({
    "aria-invalid": errors[nome] ? true : undefined,
    "aria-describedby": errors[nome] ? `lp-${nome}-erro` : undefined,
  });

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <label className={styles.field}>
        <span>Nome da página</span>
        <input type="text" value={valores.nome} maxLength={80} required onChange={(e) => set("nome", e.target.value)} {...campo("nome")} />
        <small>Só para o painel: identifica a página na lista (ex.: “Campanha clínicas — outubro”).</small>
        {errors.nome && <small id="lp-nome-erro" data-erro>{errors.nome}</small>}
      </label>

      <label className={styles.field}>
        <span>Endereço (slug)</span>
        <div className={styles.slug}>
          <code>/conteudo/</code>
          <input
            type="text"
            value={valores.slug}
            maxLength={60}
            required
            onChange={(e) => {
              setSlugManual(true);
              set("slug", slugifyRaw(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
            }}
            {...campo("slug")}
          />
        </div>
        <small>
          {modo === "editar"
            ? "Trocar o endereço mantém o antigo funcionando: ele passa a redirecionar (301) para o novo."
            : "Minúsculas, números e hífen. Pense no longo prazo: é o link que vai para os anúncios."}
        </small>
        {errors.slug && <small id="lp-slug-erro" data-erro>{errors.slug}</small>}
      </label>

      <label className={styles.field}>
        <span>
          Título para o Google <Contador value={valores.seoTitle} ideal={[30, 60]} />
        </span>
        <input type="text" value={valores.seoTitle} maxLength={70} required onChange={(e) => set("seoTitle", e.target.value)} {...campo("seoTitle")} />
        <small>Começa pelo que a pessoa busca. O “| PitchYes” do fim é automático.</small>
        {errors.seoTitle && <small id="lp-seoTitle-erro" data-erro>{errors.seoTitle}</small>}
      </label>

      <label className={styles.field}>
        <span>
          Descrição para o Google <Contador value={valores.seoDescription} ideal={[120, 160]} />
        </span>
        <textarea rows={3} value={valores.seoDescription} maxLength={170} required onChange={(e) => set("seoDescription", e.target.value)} {...campo("seoDescription")} />
        <small>A proposta de valor e um motivo para clicar.</small>
        {errors.seoDescription && <small id="lp-seoDescription-erro" data-erro>{errors.seoDescription}</small>}
      </label>

      {modo === "editar" && (
        <label className={styles.check}>
          <input type="checkbox" checked={Boolean(valores.noindex)} onChange={(e) => set("noindex", e.target.checked)} />
          <span>
            Fora do Google (noindex)
            <em>
              Para página de campanha que repete o texto de outra: conteúdo duplicado indexado prejudica o site inteiro. A
              página continua funcionando pelo link.
            </em>
          </span>
        </label>
      )}

      <div className={styles.foot}>
        <button type="submit" className={buttonClass("solid")} disabled={enviando}>
          {enviando ? "Salvando…" : modo === "editar" ? "Salvar" : modo === "duplicar" ? "Duplicar página" : "Criar página"}
        </button>
        {mensagem && (
          <p className={styles.erro} role="status">
            {mensagem}
          </p>
        )}
      </div>
    </form>
  );
}
