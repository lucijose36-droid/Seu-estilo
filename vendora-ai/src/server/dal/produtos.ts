import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";
import { obterContexto } from "./session";

/**
 * DTO administrativo: inclui comissão estimada e regras internas.
 * Só chega a telas da área logada.
 */
export interface ProdutoAdmin {
  id: string;
  titulo: string;
  slug: string;
  plataforma: string;
  produto_external_id: string | null;
  descricao_verificada: string;
  publico_alvo: string;
  preco_referencia_centavos: number | null;
  preco_referencia_em: string | null;
  comissao_estimada_centavos: number | null;
  moeda: string;
  affiliate_url: string;
  status_aprovacao: "nao_solicitado" | "pendente" | "aprovado" | "recusado";
  regras_divulgacao: string;
  fonte_verificacao: string;
  verificado_at: string | null;
  ativo: boolean;
}

/**
 * DTO público: o que a página de oferta e o atendente podem ver.
 *
 * Note o que NÃO está aqui: comissão estimada, regras internas de divulgação
 * e a fonte de verificação. Não é uma questão de esconder na tela — o tipo
 * não tem os campos, então não existe caminho de código que os vaze para o
 * visitante.
 */
export interface ProdutoPublico {
  id: string;
  titulo: string;
  slug: string;
  plataforma: string;
  descricao_verificada: string;
  publico_alvo: string;
  preco_referencia_centavos: number | null;
  preco_referencia_em: string | null;
  moeda: string;
}

const COLUNAS_ADMIN =
  "id, titulo, slug, plataforma, produto_external_id, descricao_verificada, publico_alvo, preco_referencia_centavos, preco_referencia_em, comissao_estimada_centavos, moeda, affiliate_url, status_aprovacao, regras_divulgacao, fonte_verificacao, verificado_at, ativo";

export async function listarProdutos(): Promise<ProdutoAdmin[]> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return [];

  // O filtro por org_id é redundante com a RLS de propósito: se alguém um dia
  // afrouxar uma policy, a consulta ainda não atravessa organizações.
  const { data, error } = await supabase
    .from("affiliate_products")
    .select(COLUNAS_ADMIN)
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProdutoAdmin[];
}

export async function obterProduto(id: string): Promise<ProdutoAdmin | null> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return null;

  const { data, error } = await supabase
    .from("affiliate_products")
    .select(COLUNAS_ADMIN)
    .eq("org_id", ctx.orgId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as ProdutoAdmin) ?? null;
}

export interface Claim {
  id: string;
  afirmacao: string;
  tipo: string;
  fonte: string;
  verificado_at: string | null;
  ativo: boolean;
}

export async function listarClaims(productId: string): Promise<Claim[]> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return [];

  const { data, error } = await supabase
    .from("product_claims")
    .select("id, afirmacao, tipo, fonte, verificado_at, ativo")
    .eq("org_id", ctx.orgId)
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Claim[];
}

/**
 * Afirmações citáveis por produto: apenas as ativas, que por CHECK do banco
 * só existem com fonte e data de verificação. É a ÚNICA origem permitida
 * para o que o atendente automatizado diz sobre o produto.
 */
export async function listarClaimsCitaveis(productId: string): Promise<Claim[]> {
  const todas = await listarClaims(productId);
  return todas.filter((c) => c.ativo);
}
