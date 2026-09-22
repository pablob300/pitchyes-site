// Definição dos formulários do site e a validação deles. Este arquivo roda nos dois lados:
// no navegador (feedback imediato) e no servidor (a validação que vale), em /api/leads.
// Campo novo aqui aparece sozinho no formulário e na ficha do lead em /admin/leads.

export type LeadField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Ocupa metade da linha no desktop; o padrão é a linha inteira. */
  half?: boolean;
  autoComplete?: string;
};

export type LeadFormDef = {
  id: string;
  /** Rótulo do formulário no painel. */
  label: string;
  /**
   * Onde o envio é gravado. "leads" é a Central de leads; "newsletter" é a lista
   * de assinaturas do rodapé, que tem tela e tabela próprias.
   */
  storage?: "leads" | "newsletter";
  /** Campo usado como nome, e-mail, telefone e empresa na listagem de /admin/leads. */
  identity: { name?: string; email: string; phone?: string; company?: string };
  fields: LeadField[];
};

export const MAX_TEXT = 2000;

export const contatoForm: LeadFormDef = {
  id: "contato",
  label: "Contato",
  identity: { name: "nome", email: "email", phone: "telefone", company: "empresa" },
  fields: [
    { name: "nome", label: "Nome Completo", type: "text", required: true, placeholder: "Seu nome completo", half: true, autoComplete: "name" },
    { name: "email", label: "Email Corporativo", type: "email", required: true, placeholder: "seu.email@empresa.com", half: true, autoComplete: "email" },
    { name: "empresa", label: "Empresa", type: "text", required: true, placeholder: "Nome da sua empresa", half: true, autoComplete: "organization" },
    { name: "telefone", label: "Telefone", type: "tel", required: true, placeholder: "(11) 99999-9999", half: true, autoComplete: "tel" },
    {
      name: "tamanho",
      label: "Tamanho da Empresa",
      type: "select",
      half: true,
      options: ["1 a 10 funcionários", "11 a 50 funcionários", "51 a 200 funcionários", "201 a 500 funcionários", "Mais de 500 funcionários"],
    },
    {
      name: "interesse",
      label: "Interesse Principal",
      type: "select",
      half: true,
      options: [
        "Ligações ativas (prospecção)",
        "Atendimento receptivo",
        "Agendamento e confirmação",
        "Cobrança e recuperação",
        "Suporte ao cliente",
        "Ainda estou avaliando",
      ],
    },
    {
      name: "faturamento",
      label: "Faturamento Mensal",
      type: "select",
      half: true,
      options: [
        "Até R$ 100 mil",
        "R$ 100 mil a R$ 500 mil",
        "R$ 500 mil a R$ 1 milhão",
        "R$ 1 milhão a R$ 5 milhões",
        "Acima de R$ 5 milhões",
        "Prefiro não informar",
      ],
    },
    {
      name: "equipe",
      label: "Quantas pessoas você tem na equipe de vendas?",
      type: "select",
      half: true,
      options: ["1 a 3 pessoas", "4 a 10 pessoas", "11 a 30 pessoas", "31 a 100 pessoas", "Mais de 100 pessoas"],
    },
    { name: "data", label: "Data Preferida para Demonstração", type: "date" },
    { name: "desafio", label: "Conte-nos sobre seu desafio atual", type: "textarea", placeholder: "Descreva brevemente seus principais desafios em vendas..." },
  ],
};

/** Newsletter do rodapé: um campo só, mas alimenta o mesmo painel. */
export const newsletterForm: LeadFormDef = {
  id: "newsletter",
  label: "Newsletter",
  storage: "newsletter",
  identity: { email: "email" },
  fields: [
    { name: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" },
  ],
};

export const leadForms: Record<string, LeadFormDef> = {
  [contatoForm.id]: contatoForm,
  [newsletterForm.id]: newsletterForm,
};

export function getLeadForm(id: string): LeadFormDef | undefined {
  return leadForms[id];
}

// --- Validação ---------------------------------------------------------------

// Nome: pelo menos 3 caracteres e só letras (com acento), espaço, apóstrofo e hífen.
const NAME_OK = /^[\p{L}][\p{L}\s'.-]*$/u;
// E-mail: um @, domínio com ponto e sem espaços. Proposital: não reinventar a RFC.
const EMAIL_OK = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Só os dígitos de um telefone digitado com máscara. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara brasileira enquanto a pessoa digita: (11) 99999-9999. */
export function formatPhone(value: string): string {
  const d = phoneDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Telefone brasileiro: DDD de 11 a 99, fixo com 8 dígitos ou celular com 9 começando em 9. */
export function isBrazilianPhone(value: string): boolean {
  const d = phoneDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  if (d.length === 10 && !"2345".includes(d[2])) return false;
  return true;
}

export function validateField(field: LeadField, raw: string): string | null {
  const value = raw.trim();
  if (!value) return field.required ? `${field.label} é obrigatório.` : null;
  if (value.length > MAX_TEXT) return `${field.label} passou de ${MAX_TEXT} caracteres.`;

  switch (field.type) {
    case "text":
      if (field.name === "nome") {
        if (value.length < 3) return "Escreva o nome completo (mínimo de 3 caracteres).";
        if (!NAME_OK.test(value)) return "O nome deve conter apenas letras.";
      } else if (value.length < 2) {
        return `${field.label} precisa de pelo menos 2 caracteres.`;
      }
      return null;
    case "email":
      return EMAIL_OK.test(value) ? null : "Informe um e-mail válido, como nome@empresa.com.br.";
    case "tel":
      return isBrazilianPhone(value) ? null : "Informe um telefone brasileiro com DDD, como (11) 99999-9999.";
    case "select":
      return field.options?.includes(value) ? null : `Escolha uma opção em ${field.label}.`;
    case "date": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Escolha uma data válida.";
      const today = new Date().toISOString().slice(0, 10);
      return value < today ? "A data preferida não pode estar no passado." : null;
    }
    case "textarea":
      return null;
  }
}

export type LeadValues = Record<string, string>;

export function validateLead(form: LeadFormDef, values: LeadValues) {
  const errors: Record<string, string> = {};
  const clean: LeadValues = {};
  for (const field of form.fields) {
    const raw = typeof values[field.name] === "string" ? values[field.name] : "";
    const error = validateField(field, raw);
    if (error) errors[field.name] = error;
    else if (raw.trim()) clean[field.name] = raw.trim();
  }
  return { ok: Object.keys(errors).length === 0, errors, values: clean };
}

/**
 * Texto de busca de um lead: mesma dobra usada na consulta (ver lib/fold.ts).
 * Reexportado aqui porque é daqui que a gravação e a busca de leads a chamam.
 */
export { fold as foldForSearch } from "./fold";
