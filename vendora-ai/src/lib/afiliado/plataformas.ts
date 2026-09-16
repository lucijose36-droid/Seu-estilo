/**
 * Plataformas de afiliado conhecidas e seus hostnames legítimos.
 *
 * Por que uma lista, e não apenas "tem que ser https":
 * o link de afiliado é o ativo do negócio inteiro. Um campo de URL livre é a
 * porta para apontar o CTA da própria loja para um domínio de terceiro — por
 * engano de digitação ou por alguém com acesso ao painel. A lista transforma
 * "confio em quem preenche" em "o sistema recusa".
 *
 * Os sufixos abaixo foram escritos a partir dos domínios publicamente usados
 * por essas plataformas. NÃO são uma verificação de que você tem afiliação
 * aprovada nelas — isso é o campo `status_aprovacao`, preenchido por você
 * depois de conferir no painel do produtor.
 */

export interface Plataforma {
  id: string;
  nome: string;
  /** Hostnames aceitos: o domínio exato ou qualquer subdomínio dele. */
  dominios: string[];
}

export const PLATAFORMAS: Plataforma[] = [
  { id: "hotmart", nome: "Hotmart", dominios: ["hotmart.com", "hotmart.com.br"] },
  { id: "kiwify", nome: "Kiwify", dominios: ["kiwify.com.br", "kiwify.app"] },
  { id: "eduzz", nome: "Eduzz", dominios: ["eduzz.com", "sun.eduzz.com"] },
  { id: "monetizze", nome: "Monetizze", dominios: ["monetizze.com.br"] },
  { id: "braip", nome: "Braip", dominios: ["braip.com", "ev.braip.com"] },
  { id: "perfectpay", nome: "PerfectPay", dominios: ["perfectpay.com.br"] },
];

export function acharPlataforma(id: string): Plataforma | undefined {
  return PLATAFORMAS.find((p) => p.id === id);
}

export type MotivoUrlRecusada =
  | "vazia"
  | "malformada"
  | "protocolo"
  | "credenciais"
  | "porta"
  | "host-nao-permitido";

export const EXPLICACAO_RECUSA: Record<MotivoUrlRecusada, string> = {
  vazia: "Informe o link de afiliado.",
  malformada: "Este texto não é uma URL válida.",
  protocolo: "O link precisa começar com https://. Links http:// podem ser interceptados e ter o destino trocado.",
  credenciais:
    "O link não pode conter usuário ou senha antes do domínio — é a forma clássica de disfarçar o destino real.",
  porta: "O link não pode especificar uma porta diferente da padrão.",
  "host-nao-permitido":
    "O domínio não corresponde à plataforma escolhida. Confira se você copiou o link do painel de afiliado certo.",
};

export interface UrlAnalisada {
  ok: boolean;
  motivo?: MotivoUrlRecusada;
  /** URL normalizada, que é o que deve ser gravado. */
  normalizada?: string;
  hostname?: string;
}

/**
 * Valida um link de afiliado contra a plataforma escolhida.
 *
 * A comparação de hostname é por igualdade ou por sufixo de rótulo completo
 * (`.dominio`). Comparar com `includes()` aceitaria `hotmart.com.invasor.net`,
 * que é exatamente o ataque que essa função existe para barrar.
 */
export function analisarUrlAfiliado(
  bruta: string,
  plataformaId: string,
): UrlAnalisada {
  const texto = bruta.trim();
  if (texto === "") return { ok: false, motivo: "vazia" };

  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return { ok: false, motivo: "malformada" };
  }

  if (url.protocol !== "https:") return { ok: false, motivo: "protocolo" };
  if (url.username !== "" || url.password !== "") {
    return { ok: false, motivo: "credenciais" };
  }
  if (url.port !== "") return { ok: false, motivo: "porta" };

  const plataforma = acharPlataforma(plataformaId);
  if (!plataforma) return { ok: false, motivo: "host-nao-permitido" };

  const host = url.hostname.toLowerCase();
  const permitido = plataforma.dominios.some(
    (d) => host === d || host.endsWith(`.${d}`),
  );
  if (!permitido) return { ok: false, motivo: "host-nao-permitido", hostname: host };

  return { ok: true, normalizada: url.toString(), hostname: host };
}
