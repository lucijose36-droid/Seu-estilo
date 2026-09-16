import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";

/**
 * Leitura da superfície pública.
 *
 * Tudo aqui passa pelas funções SECURITY DEFINER da migration 0009, que só
 * enxergam produto ativo e não devolvem campo interno. A service role NÃO é
 * usada: se uma rota pública tivesse service role, um bug nela exporia o
 * banco inteiro.
 */

export interface OfertaPublica {
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

export interface ClaimPublica {
  id: string;
  afirmacao: string;
  tipo: string;
}

export async function obterOfertaPublica(slug: string): Promise<OfertaPublica | null> {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("obter_oferta_publica", {
    p_slug: slug,
  });
  if (error) throw new Error(error.message);

  const linhas = (data ?? []) as OfertaPublica[];
  return linhas[0] ?? null;
}

export async function listarClaimsPublicas(productId: string): Promise<ClaimPublica[]> {
  const supabase = await criarClienteServidor();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("listar_claims_publicas", {
    p_product_id: productId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ClaimPublica[];
}

/**
 * Registra o clique e devolve o destino GRAVADO no produto.
 *
 * O destino nunca vem da requisição. Ver a checagem adicional em
 * src/app/go/[id]/route.ts antes de qualquer redirecionamento.
 */
export interface DestinoClique {
  destino: string;
  plataforma: string;
}

export async function registrarCliqueSaida(
  productId: string,
  sid: string,
  trackingId: string,
  utmCampaign: string,
): Promise<DestinoClique | null> {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("registrar_clique_saida", {
    p_product_id: productId,
    p_sid: sid,
    p_tracking_id: trackingId,
    p_utm_campaign: utmCampaign,
  });
  if (error) throw new Error(error.message);

  const linhas = (data ?? []) as DestinoClique[];
  return linhas[0] ?? null;
}

export async function registrarVisita(
  productId: string,
  sid: string,
  utm: Record<string, string>,
): Promise<void> {
  const supabase = await criarClienteServidor();
  if (!supabase) return;

  await supabase.rpc("registrar_visita", {
    p_product_id: productId,
    p_sid: sid,
    p_utm_source: utm.utm_source ?? "",
    p_utm_medium: utm.utm_medium ?? "",
    p_utm_campaign: utm.utm_campaign ?? "",
    p_utm_content: utm.utm_content ?? "",
    p_utm_term: utm.utm_term ?? "",
  });
}
