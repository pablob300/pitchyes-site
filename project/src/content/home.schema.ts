// Formato do conteúdo da página inicial.
//
// Os tipos moram aqui, e não em components/home/content.ts, porque agora existem duas
// fontes para o mesmo formato: o padrão escrito no código e a sobreposição que vem do
// banco (editor visual). Os dois precisam satisfazer exatamente este contrato.
//
// Regra ao mexer: nada de tipo DERIVADO do valor (`typeof x[number]["key"]`). O dado do
// banco é mutável e tem chave `string`, então um tipo derivado de um objeto literal não
// o aceita — e a fusão passa a não compilar. Chave fechada se escreve à mão, como
// PillarKey abaixo.

/** As seis pilastras têm ilustração própria em JSX (Platform.tsx), então a chave é fechada. */
export type PillarKey = "infra" | "build" | "test" | "omni" | "observe" | "integrations";

export type Agent = {
  name: string;
  audio: string;
};

export type Hero = {
  /** Parte fixa do h1, em preto. */
  title: string;
  /**
   * Palavras que se revezam na linha de baixo do h1, coloridas (RotatingWords.tsx): cada
   * uma fica 2s, a última 5s, e o ciclo recomeça. Todas vão no HTML do servidor.
   */
  titleWords: { text: string }[];
  lead: string;
  /** Só o rótulo do botão: o endereço é TALK_TO_AI_HREF, de lib/routes.ts. */
  cta: string;
  stat: { value: string; label: string };
  widget: {
    eyebrow: string;
    agents: Agent[];
    /** Texto abaixo do círculo enquanto nada está tocando. */
    hint: string;
  };
};

export type ClientLogos = {
  title: string;
};

export type Pillar = {
  key: PillarKey;
  eyebrow: string;
  title: string;
  text: string;
};

export type Platform = {
  eyebrow: string;
  title: string;
  lead: string;
  pillars: Pillar[];
};

export type LatencyRow = {
  label: string;
  /** Em milissegundos. A barra é proporcional ao maior valor da lista. */
  value: number;
  /** Segundos que o número leva para subir de zero até `value`. */
  duration: number;
  highlight: boolean;
};

export type Latency = {
  title: string;
  unit: string;
  rows: LatencyRow[];
};

export type Testimonial = {
  /** Empresa que aparece no depoimento — é o título do vídeo no canal da PitchYes. */
  company: string;
  /** Id do Short no YouTube. */
  videoId: string;
  /** Capa em 9:16, baixada do próprio vídeo (servida pelo site, não pelo YouTube). */
  thumb: string;
  /** Duração em segundos, para os dados estruturados. */
  seconds: number;
  /** Data de publicação no YouTube (ISO), para os dados estruturados. */
  published: string;
  /** TODO(conteúdo): nome e cargo de quem fala, quando o time confirmar. */
  person?: string;
  role?: string;
  headline?: string;
  quote?: string;
};

export type Testimonials = {
  eyebrow: string;
  title: string;
  lead: string;
  items: Testimonial[];
};

export type RolloutStep = {
  day: string;
  title: string;
  text: string;
  live?: boolean;
};

export type Rollout = {
  title: string;
  steps: RolloutStep[];
};

/**
 * Certificação e o controle que aparece embaixo dela, no MESMO item.
 *
 * Antes eram dois vetores pareados por índice (`controls[i]` sob `certifications[i]`), o
 * que deixava o editor produzir um estado que o componente não sabe renderizar: basta
 * apagar uma certificação para o controle da última sobrar sem par.
 */
export type SecurityItem = {
  status: string;
  name: string;
  detail: string;
  controlTitle: string;
  controlText: string;
};

export type Security = {
  title: string;
  lead: string;
  items: SecurityItem[];
  /** Só o rótulo: o endereço é /privacidade. */
  cta: string;
};

export type UseCases = {
  title: string;
  items: { title: string; text: string }[];
};

export type Faq = {
  title: string;
  items: { q: string; a: string }[];
};

/** Seções da home, na ordem em que aparecem. A chave amarra conteúdo e componente. */
export type SectionKey =
  | "hero"
  | "clientLogos"
  | "platform"
  | "latency"
  | "testimonials"
  | "rollout"
  | "security"
  | "useCases"
  | "faq";

export type Section = {
  key: SectionKey;
  /**
   * Seção oculta não é renderizada — nunca escondida por CSS. `display:none` e
   * `visibility:hidden` tiram o texto do que o robô lê (SEO.md §9.1).
   */
  hidden?: boolean;
};

/** O hero carrega o único <h1> da página: não pode ser ocultado nem sair do primeiro lugar. */
export const FIXED_FIRST_SECTION: SectionKey = "hero";

export type HomeContent = {
  sections: Section[];
  hero: Hero;
  clientLogos: ClientLogos;
  platform: Platform;
  latency: Latency;
  testimonials: Testimonials;
  rollout: Rollout;
  security: Security;
  useCases: UseCases;
  faq: Faq;
};
