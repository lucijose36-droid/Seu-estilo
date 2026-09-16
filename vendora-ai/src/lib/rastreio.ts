/**
 * Identificadores de sessão anônima e de clique.
 *
 * Deliberadamente sem fingerprint, sem IP e sem user agent: a métrica que o
 * produto precisa é "quantos visitantes distintos", e coletar mais do que
 * isso seria dado pessoal sem finalidade declarada.
 */

export type ChaveUtm =
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_content"
  | "utm_term";

export function novoId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/**
 * Extrai apenas as UTMs conhecidas, com tamanho limitado.
 *
 * Aceitar qualquer parâmetro deixaria o visitante escrever o que quisesse na
 * nossa própria base de métricas.
 */
export function lerUtms(params: URLSearchParams | Record<string, string | string[] | undefined>): Record<ChaveUtm, string> {
  const pegar = (k: string): string => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    const texto = Array.isArray(v) ? v[0] : v;
    return (texto ?? "").slice(0, 200);
  };

  return {
    utm_source: pegar("utm_source"),
    utm_medium: pegar("utm_medium"),
    utm_campaign: pegar("utm_campaign"),
    utm_content: pegar("utm_content"),
    utm_term: pegar("utm_term"),
  };
}

export const COOKIE_SESSAO_ANONIMA = "vendora_sid";
