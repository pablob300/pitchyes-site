"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Field } from "@/components/admin/ui/Field";
import { buttonClass } from "@/components/ui/Button";
import styles from "./UsersTable.module.css";

// Lista de quem tem acesso ao painel, com convidar, editar e remover.
// Toda regra é conferida de novo no servidor: o que some daqui é conveniência,
// não proteção.

export type UserRow = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  papelLabel: string;
  situacao: "ativo" | "suspenso";
  superadmin: boolean;
  temSenha: boolean;
  ultimoAcesso: string | null;
  aparelhos: number;
  papeis: { value: string; label: string }[];
};

type Aberto = { tipo: "novo" } | { tipo: "editar"; user: UserRow } | { tipo: "remover"; user: UserRow } | null;

export function UsersTable({ rows, actorId }: { rows: UserRow[]; actorId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState<Aberto>(null);
  const [busy, setBusy] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const papeis = rows[0]?.papeis ?? [{ value: "admin", label: "Admin" }];

  async function enviar(url: string, method: string, body?: unknown) {
    setBusy(true);
    setErros({});
    try {
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        errors?: Record<string, string>;
        convite?: string;
      };
      setBusy(false);
      if (!data.ok) {
        setErros(data.errors ?? {});
        if (!data.errors) setAviso({ tipo: "erro", texto: data.message ?? "Não foi possível concluir." });
        return false;
      }
      setAviso({ tipo: "ok", texto: data.convite ?? data.message ?? "Pronto." });
      setAberto(null);
      router.refresh();
      return true;
    } catch {
      setBusy(false);
      setAviso({ tipo: "erro", texto: "Sem conexão com o servidor." });
      return false;
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={buttonClass("solid")} onClick={() => setAberto({ tipo: "novo" })}>
          Convidar usuário
        </button>
        {aviso && (
          <p className={styles.aviso} data-tipo={aviso.tipo} role="status">
            {aviso.texto}
          </p>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
            <th scope="col">Papel</th>
            <th scope="col">Situação</th>
            <th scope="col">Último acesso</th>
            <th scope="col">
              <span className={styles.srOnly}>Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className={styles.nome}>{row.nome}</span>
                {row.superadmin && <span className={styles.badge} data-tipo="super">Superadmin</span>}
                {row.id === actorId && <span className={styles.badge}>Você</span>}
              </td>
              <td className={styles.email}>{row.email}</td>
              <td>{row.papelLabel}</td>
              <td>
                <span className={styles.situacao} data-situacao={row.situacao}>
                  {row.situacao === "ativo" ? "Ativo" : "Suspenso"}
                </span>
                {!row.temSenha && <span className={styles.badge}>Convite pendente</span>}
              </td>
              <td className={styles.email}>
                {row.ultimoAcesso ?? "—"}
                {row.aparelhos > 0 && (
                  <span className={styles.aparelhos}>
                    {row.aparelhos} {row.aparelhos === 1 ? "aparelho" : "aparelhos"}
                  </span>
                )}
              </td>
              <td className={styles.acoes}>
                <button type="button" className={styles.link} onClick={() => setAberto({ tipo: "editar", user: row })}>
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.link}
                  data-perigo
                  disabled={row.superadmin || row.id === actorId}
                  title={
                    row.superadmin
                      ? "Superadmin não pode ser removido."
                      : row.id === actorId
                        ? "Você não pode remover a própria conta."
                        : undefined
                  }
                  onClick={() => setAberto({ tipo: "remover", user: row })}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {aberto?.tipo === "novo" && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await enviar("/api/admin/usuarios", "POST", {
              nome: data.get("nome"),
              email: data.get("email"),
              papel: data.get("papel"),
            });
          }}
        >
          <Dialog
            title="Convidar usuário"
            description="A pessoa recebe um e-mail para criar a própria senha. Você não define senha por ela."
            onClose={() => setAberto(null)}
            footer={
              <>
                <button type="button" className={buttonClass("outline")} onClick={() => setAberto(null)}>
                  Cancelar
                </button>
                <button type="submit" className={buttonClass("solid")} disabled={busy}>
                  {busy ? "Enviando…" : "Enviar convite"}
                </button>
              </>
            }
          >
            <div className={styles.form}>
              <Field label="Nome completo" name="nome" required autoFocus error={erros.nome} />
              <Field label="E-mail" name="email" type="email" required error={erros.email} />
              <Field
                label="Papel"
                name="papel"
                type="select"
                options={papeis}
                hint="Admin tem acesso total ao painel."
              />
            </div>
          </Dialog>
        </form>
      )}

      {aberto?.tipo === "editar" && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await enviar(`/api/admin/usuarios/${aberto.user.id}`, "PATCH", {
              nome: data.get("nome"),
              papel: data.get("papel"),
              situacao: data.get("situacao"),
            });
          }}
        >
          <Dialog
            title={`Editar ${aberto.user.nome}`}
            description={aberto.user.superadmin ? "Superadmin: papel e situação ficam travados." : undefined}
            onClose={() => setAberto(null)}
            footer={
              <>
                {!aberto.user.temSenha && (
                  <button
                    type="button"
                    className={buttonClass("ghost")}
                    disabled={busy}
                    onClick={() => enviar(`/api/admin/usuarios/${aberto.user.id}`, "PATCH", { reenviarConvite: true })}
                  >
                    Reenviar convite
                  </button>
                )}
                <button type="button" className={buttonClass("outline")} onClick={() => setAberto(null)}>
                  Cancelar
                </button>
                <button type="submit" className={buttonClass("solid")} disabled={busy}>
                  {busy ? "Salvando…" : "Salvar"}
                </button>
              </>
            }
          >
            <div className={styles.form}>
              <Field label="Nome completo" name="nome" defaultValue={aberto.user.nome} required autoFocus error={erros.nome} />
              <Field
                label="E-mail"
                name="email"
                defaultValue={aberto.user.email}
                readOnly
                hint="O e-mail é a identidade da conta e não muda."
              />
              {!aberto.user.superadmin && (
                <>
                  <Field label="Papel" name="papel" type="select" defaultValue={aberto.user.papel} options={papeis} />
                  <Field
                    label="Situação"
                    name="situacao"
                    type="select"
                    defaultValue={aberto.user.situacao}
                    options={[
                      { value: "ativo", label: "Ativo" },
                      { value: "suspenso", label: "Suspenso — perde o acesso na hora" },
                    ]}
                  />
                </>
              )}
            </div>
          </Dialog>
        </form>
      )}

      {aberto?.tipo === "remover" && (
        <Dialog
          title={`Remover ${aberto.user.nome}?`}
          description={`A conta ${aberto.user.email} perde o acesso imediatamente, junto com os aparelhos e sessões dela. Não dá para desfazer.`}
          onClose={() => setAberto(null)}
          footer={
            <>
              <button type="button" className={buttonClass("outline")} onClick={() => setAberto(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`${buttonClass("solid")} ${styles.perigo}`}
                disabled={busy}
                onClick={() => enviar(`/api/admin/usuarios/${aberto.user.id}`, "DELETE")}
              >
                {busy ? "Removendo…" : "Remover acesso"}
              </button>
            </>
          }
        />
      )}
    </>
  );
}
