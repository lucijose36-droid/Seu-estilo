"use server";

import { exigirContexto } from "@/server/dal/session";
import { obterConfiguracoes } from "@/server/dal/configuracoes";
import { criarClienteServidor } from "@/server/supabase/server";
import { atender } from "@/server/vendedor/motor";
import type { EntradaVendedor, ProdutoParaVendedor } from "@/server/vendedor/tipos";
import type { EtapaLead } from "@/lib/tipos";

export interface RespostaSimulacao {
  partes: { texto: string; origem: string }[];
  encaminharHumano: boolean;
  motivoEncaminhamento?: string;
  validadorAprovou: boolean;
  motivosValidador: string[];
  ferramentas: string[];
  provedor: string;
  latenciaMs: number;
  etapaSugerida?: EtapaLead;
  erro?: string;
}

/**
 * Simulação do atendente.
 *
 * Usa EXATAMENTE o mesmo motor, as mesmas fontes e o mesmo validador do
 * atendimento real. Um simulador com caminho próprio testaria o simulador,
 * não o produto.
 */
export async function simularAtendimento(
  mensagem: string,
  historicoJson: string,
): Promise<RespostaSimulacao> {
  const ctx = await exigirContexto();
  const configuracoes = await obterConfiguracoes();
  const supabase = await criarClienteServidor();

  const vazio: RespostaSimulacao = {
    partes: [],
    encaminharHumano: false,
    validadorAprovou: true,
    motivosValidador: [],
    ferramentas: [],
    provedor: configuracoes.vendedor_provider,
    latenciaMs: 0,
  };

  if (!supabase) {
    return { ...vazio, erro: "Banco não configurado neste ambiente." };
  }

  // Só produtos ativos, com as afirmações citáveis de cada um. É a única
  // matéria-prima que o atendente recebe.
  const { data, error } = await supabase
    .from("affiliate_products")
    .select(
      "id, titulo, publico_alvo, descricao_verificada, preco_referencia_centavos, preco_referencia_em, moeda, plataforma, product_claims(id, afirmacao, tipo, ativo)",
    )
    .eq("org_id", ctx.orgId)
    .eq("ativo", true);

  if (error) return { ...vazio, erro: error.message };

  const produtos: ProdutoParaVendedor[] = (data ?? []).map((p) => {
    const linha = p as unknown as ProdutoParaVendedor & {
      product_claims: { id: string; afirmacao: string; tipo: string; ativo: boolean }[];
    };
    return {
      id: linha.id,
      titulo: linha.titulo,
      publico_alvo: linha.publico_alvo,
      descricao_verificada: linha.descricao_verificada,
      preco_referencia_centavos: linha.preco_referencia_centavos,
      preco_referencia_em: linha.preco_referencia_em,
      moeda: linha.moeda,
      plataforma: linha.plataforma,
      claims: (linha.product_claims ?? [])
        .filter((c) => c.ativo)
        .map((c) => ({ id: c.id, afirmacao: c.afirmacao, tipo: c.tipo })),
    };
  });

  let historico: EntradaVendedor["historico"] = [];
  try {
    historico = JSON.parse(historicoJson);
  } catch {
    historico = [];
  }

  const entrada: EntradaVendedor = {
    mensagemVisitante: mensagem.slice(0, 2000),
    historico,
    produtos,
    configuracoes,
    etapaAtual: "conversando",
  };

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const r = await atender(entrada, configuracoes.vendedor_provider, base);

  return {
    partes: r.partes,
    encaminharHumano: r.encaminharHumano,
    motivoEncaminhamento: r.motivoEncaminhamento,
    validadorAprovou: r.veredito.aprovado,
    motivosValidador: r.veredito.motivos,
    ferramentas: r.saidaBruta.ferramentasUsadas,
    provedor: r.provedor,
    latenciaMs: r.latenciaMs,
    etapaSugerida: r.saidaBruta.etapaSugerida,
  };
}
