"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { GTM_ID, type BrandImage, type SiteSettings } from "@/lib/site-settings";
import styles from "./Settings.module.css";

// Configuração geral: nome do site, logo, favicon e Google Tag Manager.
// As imagens sobem pelo mesmo envio do resto do painel (/api/admin/midia, pasta "marca").

type Upload = { ok: boolean; url?: string; largura?: number; altura?: number; message?: string };

async function enviarImagem(file: File): Promise<Upload> {
  const data = new FormData();
  data.set("arquivo", file);
  data.set("pasta", "marca");
  const response = await fetch("/api/admin/midia", { method: "POST", body: data });
  return (await response.json()) as Upload;
}

export function GeneralSettingsForm({
  inicial,
  padraoNome,
  robots,
}: {
  inicial: SiteSettings;
  padraoNome: string;
  robots: string;
}) {
  const [siteName, setSiteName] = useState(inicial.siteName ?? "");
  const [gtmId, setGtmId] = useState(inicial.gtmId ?? "");
  const [logo, setLogo] = useState<BrandImage | null>(inicial.logo);
  const [favicon, setFavicon] = useState<string | null>(inicial.favicon);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<{ tipo: "ocioso" | "salvando" | "ok" | "erro"; mensagem?: string }>({ tipo: "ocioso" });

  const gtmInvalido = gtmId.trim() !== "" && !GTM_ID.test(gtmId.trim().toUpperCase());

  async function trocarImagem(file: File | undefined, campo: "logo" | "favicon") {
    if (!file) return;
    setEstado({ tipo: "salvando", mensagem: "Enviando imagem…" });
    const result = await enviarImagem(file);
    if (!result.ok || !result.url) {
      setEstado({ tipo: "erro", mensagem: result.message ?? "Não foi possível enviar a imagem." });
      return;
    }
    if (campo === "logo") setLogo({ src: result.url, width: result.largura ?? 0, height: result.altura ?? 0 });
    else setFavicon(result.url);
    setEstado({ tipo: "ocioso", mensagem: "Imagem enviada. Salve para aplicar no site." });
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setEstado({ tipo: "salvando", mensagem: "Salvando…" });
    const response = await fetch("/api/admin/configuracoes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteName, gtmId, logo, favicon }),
    });
    const json = (await response.json()) as { ok: boolean; message?: string; errors?: Record<string, string> };
    setErrors(json.errors ?? {});
    setEstado({ tipo: json.ok ? "ok" : "erro", mensagem: json.message });
  }

  return (
    <form className={styles.form} onSubmit={salvar}>
      <section className={styles.group}>
        <h2>Identidade</h2>
        <label className={styles.field}>
          <span>Nome do site</span>
          <input
            type="text"
            value={siteName}
            maxLength={40}
            placeholder={padraoNome}
            aria-invalid={errors.siteName ? true : undefined}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <small>
            Vai no fim do título de cada página (“Planos | {siteName.trim() || padraoNome}”), no nome do site nas
            redes sociais e nos dados estruturados. Vazio = “{padraoNome}”.
          </small>
          {errors.siteName && <small data-erro>{errors.siteName}</small>}
        </label>

        <div className={styles.field}>
          <span>Logo</span>
          <div className={styles.image}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo?.src ?? "/brand/pitchyes-logo.svg"} alt="Logo atual do site" />
            <input type="file" accept="image/png,image/webp" aria-label="Enviar logo" onChange={(e) => void trocarImagem(e.target.files?.[0], "logo")} />
            {logo && (
              <button type="button" className={styles.linkButton} onClick={() => setLogo(null)}>
                Voltar ao logo padrão
              </button>
            )}
          </div>
          <small>PNG ou WebP com fundo transparente, para fundo claro. Aparece no cabeçalho e no rodapé do site e das landing pages.</small>
          {errors.logo && <small data-erro>{errors.logo}</small>}
        </div>

        <div className={styles.field}>
          <span>Favicon (ícone da aba)</span>
          <div className={styles.image}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={favicon ?? "/brand/icon.svg"} alt="Favicon atual do site" />
            <input type="file" accept="image/png,image/webp" aria-label="Enviar favicon" onChange={(e) => void trocarImagem(e.target.files?.[0], "favicon")} />
            {favicon && (
              <button type="button" className={styles.linkButton} onClick={() => setFavicon(null)}>
                Voltar ao ícone padrão
              </button>
            )}
          </div>
          <small>PNG quadrado, de preferência 512 × 512 px.</small>
          {errors.favicon && <small data-erro>{errors.favicon}</small>}
        </div>
      </section>

      <section className={styles.group}>
        <h2>Google Tag Manager</h2>
        <label className={styles.field}>
          <span>ID do contêiner</span>
          <input
            type="text"
            value={gtmId}
            placeholder="GTM-XXXXXXX"
            aria-invalid={gtmInvalido || errors.gtmId ? true : undefined}
            onChange={(e) => setGtmId(e.target.value.toUpperCase())}
          />
          <small>
            O código é instalado em todas as páginas do site e das landing pages — nunca no painel. Os formulários disparam o
            evento <code>lead</code> (nome, e-mail e telefone), menos quando o time comercial é “Sem time comercial” ou “1
            vendedor”. Vazio = sem GTM.
          </small>
          {(gtmInvalido || errors.gtmId) && <small data-erro>{errors.gtmId ?? "O ID tem o formato GTM-XXXXXXX."}</small>}
        </label>
      </section>

      <section className={styles.group}>
        <h2>robots.txt</h2>
        <p>
          O que o site entrega hoje aos buscadores e robôs de IA. A lista é mantida no código (app/robots.ts); no endereço
          provisório (workers.dev) tudo fica bloqueado de propósito.{" "}
          <a href="/robots.txt" target="_blank" rel="noopener">
            Abrir /robots.txt
          </a>
        </p>
        <pre className={styles.robots}>{robots}</pre>
      </section>

      <div className={styles.foot}>
        <button type="submit" className={buttonClass("solid")} disabled={estado.tipo === "salvando" || gtmInvalido}>
          Salvar configurações
        </button>
        {estado.mensagem && (
          <p className={styles.status} role="status" data-erro={estado.tipo === "erro" || undefined}>
            {estado.mensagem}
          </p>
        )}
      </div>
    </form>
  );
}
