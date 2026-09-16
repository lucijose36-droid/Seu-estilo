/**
 * Dinheiro em centavos inteiros, BRL.
 *
 * Nunca ponto flutuante: 0.1 + 0.2 nao e 0.3, e erro de centavo em relatorio
 * de comissao destroi a confianca no numero inteiro. Todo valor monetario do
 * sistema e `number` inteiro de centavos, e a conversao acontece so aqui.
 *
 * Atencao ao exportar arquivo: `formatarCentavos` produz texto para humano,
 * com espaco nao-quebravel (U+00A0) apos o "R$". Exportacao de CSV e
 * comparacao de valor usam os centavos inteiros, nunca esta string.
 */

export const MOEDA_PADRAO = "BRL";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarCentavos(centavos: number, moeda = MOEDA_PADRAO): string {
  if (!Number.isFinite(centavos)) return "—";
  if (moeda === MOEDA_PADRAO) return formatadorBRL.format(centavos / 100);
  // Outras moedas exigem regra de conversao explicita; ate la, exibimos o
  // valor com o codigo ISO em vez de misturar silenciosamente com BRL.
  return `${new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(centavos / 100)}`;
}

/** Converte "1.234,56", "1234.56" ou "1234" em centavos inteiros. */
export function paraCentavos(entrada: string): number | null {
  const limpo = entrada.trim().replace(/\s|R\$/g, "");
  if (limpo === "") return null;

  // pt-BR usa virgula como decimal; aceitamos tambem o formato com ponto.
  const normalizado =
    limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  const valor = Number(normalizado);
  if (!Number.isFinite(valor)) return null;
  return Math.round(valor * 100);
}
