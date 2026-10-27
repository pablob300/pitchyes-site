"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { editorHref } from "@/lib/content/pages";
import type { PageSchema, SectionSpec } from "@/lib/content/schema/types";
import { FieldInput } from "./FieldInput";
import { ListEditor } from "./ListEditor";
import { SectionOrder } from "./SectionOrder";
import { VersionHistory } from "./VersionHistory";
import { getAt, withAt } from "./pointer";
import styles from "./ContentEditor.module.css";

// Editor visual de conteúdo.
//
// À esquerda, a PÁGINA DE VERDADE dentro de um iframe: é a rota /editor, que renderiza
// os mesmos componentes do site com o rascunho. À direita, a gaveta do bloco selecionado,
// gerada pelo schema. Em cima, PUBLICAR e o histórico.
//
// A moldura do editor (contornos, alças) vive toda AQUI, no painel, desenhada por cima do
// iframe. Nada disso entra no HTML da página — é o que garante que o site público não
// ganha um byte por existir um editor.

export type ScopeData = {
  rev: number;
  /** Conteúdo já resolvido (padrão do código + o que foi editado). */
  resolved: Record<string, unknown>;
  /** Só o que foi sobreposto, para a gaveta saber o que mostrar como "Editada". */
  override: Record<string, unknown>;
};

type Scope = "pagina" | "site";

export function ContentEditor({
  schema,
  pagePath,
  sitePath,
  inicial,
  editadoPor,
  trancadoPor,
}: {
  schema: PageSchema;
  pagePath: string;
  sitePath: string;
  inicial: Record<Scope, ScopeData>;
  editadoPor: string | null;
  trancadoPor: string | null;
}) {
  const [dados, setDados] = useState(inicial);
  const [sujos, setSujos] = useState<Record<Scope, string[]>>({ pagina: [], site: [] });
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [estado, setEstado] = useState<
    { tipo: "ocioso" | "salvando" | "publicando" } | { tipo: "erro"; mensagem: string } | { tipo: "ok"; mensagem: string }
  >({ tipo: "ocioso" });
  const [historico, setHistorico] = useState(false);
  const [aviso, setAviso] = useState(trancadoPor);
  const iframe = useRef<HTMLIFrameElement>(null);

  const secao = schema.sections.find((s) => s.key === selecionada) ?? null;
  const pendentes = sujos.pagina.length + sujos.site.length;

  const caminhoDe = useCallback(
    (scope: Scope) => (scope === "site" ? sitePath : pagePath),
    [pagePath, sitePath],
  );

  /** Liga um `data-edit` da página à seção do schema que o edita. */
  const localizar = useCallback(
    (marca: string): SectionSpec | null => {
      const global = marca.startsWith("@site.");
      const ponteiro = global ? marca.slice("@site.".length) : marca;
      const scope: Scope = global ? "site" : "pagina";
      return (
        schema.sections.find((s) => {
          if (s.scope !== scope) return false;
          if (s.lists?.some((l) => ponteiro === l.pointer || ponteiro.startsWith(`${l.pointer}.`)))
            return true;
          // Seção sem prefixo (topo das páginas internas): os campos dela estão na raiz.
          if (!s.prefix) return s.fields.some((f) => ponteiro === f.pointer || ponteiro.startsWith(`${f.pointer}.`));
          return ponteiro === s.prefix || ponteiro.startsWith(`${s.prefix}.`);
        }) ?? null
      );
    },
    [schema],
  );

  // Clicar num campo dentro do iframe abre a gaveta daquele bloco. O iframe é da mesma
  // origem, então o painel enxerga o documento dele diretamente.
  const ligarIframe = useCallback(() => {
    const doc = iframe.current?.contentDocument;
    // Pode ser chamada mais de uma vez para o mesmo documento (load + montagem): liga só uma.
    if (!doc || doc.documentElement.dataset.editLigado) return;
    doc.documentElement.dataset.editLigado = "1";
    const alvos = Array.from(doc.querySelectorAll<HTMLElement>("[data-edit]"));
    for (const alvo of alvos) {
      alvo.dataset.editAtivo = "1";
      alvo.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const marca = alvo.getAttribute("data-edit");
        if (marca) setSelecionada(localizar(marca)?.key ?? null);
      });
    }
    // Contorno ao passar o mouse e no bloco escolhido: CSS injetado no iframe, para não
    // precisar de marcação extra nos componentes do site.
    const estilo = doc.createElement("style");
    estilo.textContent = `
      [data-edit]{outline:1px dashed rgba(230,88,30,.45);outline-offset:4px;cursor:pointer;border-radius:2px}
      [data-edit]:hover{outline:2px solid #e6581e;background:rgba(230,88,30,.06)}
      a[data-edit],button[data-edit]{pointer-events:auto}
    `;
    doc.head.appendChild(estilo);
  }, [localizar]);

  // Recarrega a pré-visualização mantendo a posição da rolagem. Mudança de estrutura
  // (item novo, item removido, ordem) precisa de um render do servidor: as seções são
  // renderizadas lá, não dá para remontá-las no navegador.
  const recarregar = useCallback(() => {
    const frame = iframe.current;
    const janela = frame?.contentWindow;
    if (!frame || !janela) return;
    const y = janela.scrollY;
    frame.addEventListener(
      "load",
      () => {
        frame.contentWindow?.scrollTo(0, y);
        ligarIframe();
      },
      { once: true },
    );
    janela.location.reload();
  }, [ligarIframe]);

  useEffect(() => {
    const frame = iframe.current;
    if (!frame) return;
    // O iframe pode terminar de carregar antes de o painel montar (página lenta): aí o
    // "load" já passou e nada ficaria clicável. Liga na hora se o documento já está pronto.
    const doc = frame.contentDocument;
    if (doc?.readyState === "complete" && doc.location.href !== "about:blank") ligarIframe();
    frame.addEventListener("load", ligarIframe);
    return () => frame.removeEventListener("load", ligarIframe);
  }, [ligarIframe]);

  /** Escreve o campo no estado local e, quando dá, na hora dentro do iframe. */
  function alterar(scope: Scope, ponteiro: string, valor: unknown, estrutural = false) {
    setDados((atual) => ({
      ...atual,
      [scope]: { ...atual[scope], resolved: withAt(atual[scope].resolved, ponteiro, valor) },
    }));
    setSujos((atual) => ({
      ...atual,
      [scope]: atual[scope].includes(ponteiro) ? atual[scope] : [...atual[scope], ponteiro],
    }));
    if (!estrutural && typeof valor === "string") espelhar(scope, ponteiro, valor);
  }

  /** Troca o texto direto no nó do iframe, para a página responder enquanto se digita. */
  function espelhar(scope: Scope, ponteiro: string, valor: string) {
    const doc = iframe.current?.contentDocument;
    if (!doc) return;
    const marca = scope === "site" ? `@site.${ponteiro}` : ponteiro;
    const alvo = doc.querySelector<HTMLElement>(`[data-edit="${CSS.escape(marca)}"]`);
    // Só quando o campo é o texto inteiro do elemento: um h1 montado em três pedaços,
    // por exemplo, só fica correto depois de um render do servidor.
    if (alvo && alvo.children.length === 0) alvo.textContent = valor;
  }

  async function chamar(corpo: Record<string, unknown>) {
    const response = await fetch("/api/admin/conteudo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(corpo),
    });
    return (await response.json()) as {
      ok: boolean;
      message?: string;
      rev?: number;
    };
  }

  /** Devolve a seção ao texto que está no código, tirando a sobreposição do rascunho. */
  async function voltarAoPadrao(secaoAlvo: SectionSpec) {
    const scope: Scope = secaoAlvo.scope === "site" ? "site" : "pagina";
    const ponteiros = [
      ...(secaoAlvo.prefix ? [secaoAlvo.prefix] : secaoAlvo.fields.map((f) => f.pointer)),
      ...(secaoAlvo.lists ?? []).map((l) => l.pointer),
    ];
    setEstado({ tipo: "salvando" });
    const json = await chamar({
      caminho: caminhoDe(scope),
      acao: "limpar",
      rev: dados[scope].rev,
      campos: ponteiros.map((ponteiro) => ({ ponteiro })),
    });
    if (!json.ok) {
      setEstado({ tipo: "erro", mensagem: json.message ?? "Não foi possível voltar ao padrão." });
      return;
    }
    // O conteúdo resolvido muda inteiro: mais simples recarregar do que refazer a fusão aqui.
    window.location.reload();
  }

  async function salvar() {
    setEstado({ tipo: "salvando" });
    for (const scope of ["pagina", "site"] as Scope[]) {
      const ponteiros = sujos[scope];
      if (ponteiros.length === 0) continue;
      const json = await chamar({
        caminho: caminhoDe(scope),
        acao: "salvar",
        rev: dados[scope].rev,
        campos: ponteiros.map((ponteiro) => ({
          ponteiro,
          valor: getAt(dados[scope].resolved, ponteiro),
        })),
      });
      if (!json.ok) {
        setEstado({ tipo: "erro", mensagem: json.message ?? "Não foi possível salvar." });
        return;
      }
      setDados((atual) => ({ ...atual, [scope]: { ...atual[scope], rev: json.rev ?? atual[scope].rev } }));
      setSujos((atual) => ({ ...atual, [scope]: [] }));
    }
    setAviso(null);
    setEstado({ tipo: "ok", mensagem: "Rascunho salvo." });
    recarregar();
  }

  async function publicar() {
    if (pendentes > 0) {
      setEstado({ tipo: "erro", mensagem: "Salve o bloco antes de publicar." });
      return;
    }
    setEstado({ tipo: "publicando" });
    for (const scope of ["pagina", "site"] as Scope[]) {
      const json = await chamar({ caminho: caminhoDe(scope), acao: "publicar" });
      // Uma página sem rascunho responde 400: é o caso de quem só mexeu no outro escopo.
      if (!json.ok && !json.message?.includes("rascunho")) {
        setEstado({ tipo: "erro", mensagem: json.message ?? "Não foi possível publicar." });
        return;
      }
    }
    setEstado({ tipo: "ok", mensagem: "Publicado. O site já mostra o conteúdo novo." });
  }

  const mensagem = useMemo(() => {
    if (estado.tipo === "salvando") return "Salvando…";
    if (estado.tipo === "publicando") return "Publicando…";
    if (estado.tipo === "erro" || estado.tipo === "ok") return estado.mensagem;
    if (pendentes > 0) return `${pendentes} alteração(ões) por salvar`;
    return editadoPor ? `Rascunho de ${editadoPor}` : "Sem alterações no rascunho";
  }, [estado, pendentes, editadoPor]);

  return (
    <div className={styles.tela}>
      <header className={styles.barra}>
        <div className={styles.esquerda}>
          <Link href="/admin/paginas" className={styles.voltar}>
            ← Páginas
          </Link>
          <div>
            <h1>{schema.label}</h1>
            <p data-erro={estado.tipo === "erro" || undefined}>{mensagem}</p>
          </div>
        </div>

        <div className={styles.acoes}>
          <button type="button" className={styles.discreto} onClick={() => setHistorico(true)}>
            Histórico
          </button>
          <button
            type="button"
            className={styles.salvar}
            onClick={() => void salvar()}
            disabled={pendentes === 0 || estado.tipo === "salvando"}
          >
            Salvar
          </button>
          <button
            type="button"
            className={styles.publicar}
            onClick={() => void publicar()}
            disabled={estado.tipo === "publicando"}
          >
            PUBLICAR
          </button>
        </div>
      </header>

      {aviso && (
        <p className={styles.conflito}>
          {aviso} abriu esta página há pouco. Combine antes de salvar, para ninguém perder
          trabalho.
        </p>
      )}

      <div className={styles.corpo}>
        <div className={styles.moldura}>
          <iframe
            ref={iframe}
            src={editorHref(pagePath)}
            title={`Pré-visualização do rascunho: ${schema.label}`}
            className={styles.frame}
          />
        </div>

        <aside className={styles.gaveta}>
          {secao ? (
            <SectionDrawer
              secao={secao}
              dados={dados}
              onChange={alterar}
              onFechar={() => setSelecionada(null)}
              onVoltarAoPadrao={() => void voltarAoPadrao(secao)}
            />
          ) : (
            <div className={styles.vazio}>
              <h2>Escolha um bloco</h2>
              <p>
                Clique em qualquer texto ou imagem da página ao lado para editar. Os blocos
                editáveis aparecem contornados.
              </p>
              {Array.isArray(getAt(dados.pagina.resolved, "sections")) ? (
                <SectionOrder
                  schema={schema}
                  sections={getAt(dados.pagina.resolved, "sections") as { key: string; hidden?: boolean }[]}
                  onChange={(lista) => alterar("pagina", "sections", lista, true)}
                  onSelecionar={setSelecionada}
                />
              ) : (
                <ul className={styles.blocos}>
                  {schema.sections.map((s) => (
                    <li key={s.key}>
                      <button type="button" onClick={() => setSelecionada(s.key)}>
                        {s.label}
                        {s.scope === "site" && <span> · site inteiro</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>

      {historico && (
        <VersionHistory
          caminhos={[
            { caminho: pagePath, rotulo: schema.label },
            { caminho: sitePath, rotulo: "Conteúdo do site inteiro" },
          ]}
          onFechar={() => setHistorico(false)}
          onRestaurado={() => window.location.reload()}
        />
      )}
    </div>
  );
}

function SectionDrawer({
  secao,
  dados,
  onChange,
  onFechar,
  onVoltarAoPadrao,
}: {
  secao: SectionSpec;
  dados: Record<Scope, ScopeData>;
  onChange: (scope: Scope, ponteiro: string, valor: unknown, estrutural?: boolean) => void;
  onFechar: () => void;
  onVoltarAoPadrao: () => void;
}) {
  const scope = secao.scope === "site" ? "site" : "pagina";
  const raiz = dados[scope].resolved;
  const absoluto = (relativo: string) => (secao.prefix ? `${secao.prefix}.${relativo}` : relativo);

  // "Editada" quer dizer que esta seção tem sobreposição gravada — e, portanto, que uma
  // mudança feita no código não aparece mais nela até alguém voltar ao padrão.
  const editada = [
    ...(secao.prefix ? [secao.prefix] : secao.fields.map((f) => f.pointer)),
    ...(secao.lists ?? []).map((l) => l.pointer),
  ].some((ponteiro) => getAt(dados[scope].override, ponteiro) !== undefined);

  return (
    <>
      <div className={styles.gavetaTopo}>
        <div>
          <p className={styles.rotulo}>
            {secao.scope === "site" ? "Site inteiro" : "Bloco"}
            {editada && <span className={styles.selo}>Editada</span>}
          </p>
          <h2>{secao.label}</h2>
        </div>
        <button type="button" onClick={onFechar} aria-label="Fechar o bloco">
          ×
        </button>
      </div>

      <div className={styles.gavetaCorpo}>
        {secao.note && <p className={styles.nota}>{secao.note}</p>}

        {secao.fields.map((field) => (
          <FieldInput
            key={field.pointer}
            field={field}
            value={getAt(raiz, absoluto(field.pointer))}
            onChange={(valor) => onChange(scope, absoluto(field.pointer), valor)}
          />
        ))}

        {secao.lists?.map((lista) => (
          <ListEditor
            key={lista.pointer}
            spec={lista}
            items={(getAt(raiz, lista.pointer) as Record<string, unknown>[]) ?? []}
            onChange={(proxima) => onChange(scope, lista.pointer, proxima, true)}
          />
        ))}

        {editada && (
          <div className={styles.padrao}>
            <p>
              Este bloco tem texto editado pelo painel, então melhorias escritas no código
              não aparecem mais nele.
            </p>
            <button type="button" onClick={onVoltarAoPadrao}>
              Voltar ao padrão do código
            </button>
          </div>
        )}
      </div>
    </>
  );
}
