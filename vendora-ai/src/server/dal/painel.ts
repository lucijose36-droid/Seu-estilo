import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";
import { obterContexto } from "./session";

/**
 * Métricas do painel.
 *
 * Cada campo carrega sua procedência no nome. O produto inteiro depende de
 * nunca colapsar estes números: um clique não é uma venda, uma venda
 * informada não é uma comissão confirmada, e uma comissão confirmada não é
 * dinheiro na conta.
 */
export interface MetricasPainel {
  visitantes: number;
  conversas: number;
  cliquesSaida: number;
  leads: number;

  comissoesInformadasCentavos: number;
  comissoesConfirmadasCentavos: number;
  comissoesRecebidasCentavos: number;
  comissoesRevertidasCentavos: number;

  gastosRegistradosCentavos: number;
  gastosPagosCentavos: number;

  /** Confirmadas menos gastos registrados. É estimativa, e o rótulo diz isso. */
  resultadoEstimadoCentavos: number;
  /** Recebidas menos gastos pagos. É caixa de verdade. */
  caixaRealizadoCentavos: number;

  temAlgumDado: boolean;
}

const ZERO: MetricasPainel = {
  visitantes: 0,
  conversas: 0,
  cliquesSaida: 0,
  leads: 0,
  comissoesInformadasCentavos: 0,
  comissoesConfirmadasCentavos: 0,
  comissoesRecebidasCentavos: 0,
  comissoesRevertidasCentavos: 0,
  gastosRegistradosCentavos: 0,
  gastosPagosCentavos: 0,
  resultadoEstimadoCentavos: 0,
  caixaRealizadoCentavos: 0,
  temAlgumDado: false,
};

/**
 * @param dias janela de apuração.
 *
 * O corte é calculado AQUI, e não no componente: ler o relógio durante a
 * renderização é chamada impura, e o resultado mudaria a cada re-render.
 */
export async function obterMetricas(dias: number): Promise<MetricasPainel> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return ZERO;

  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const desdeIso = desde.toISOString();
  const desdeData = desdeIso.slice(0, 10);

  const [visitas, conversas, cliques, leads, comissoes, despesas] = await Promise.all([
    supabase
      .from("visits")
      .select("anonymous_session_id")
      .eq("org_id", ctx.orgId)
      .gte("occurred_at", desdeIso),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId)
      .gte("iniciada_at", desdeIso),
    supabase
      .from("outbound_clicks")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId)
      .gte("occurred_at", desdeIso),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId)
      .gte("created_at", desdeIso),
    supabase
      .from("commission_records")
      .select("status, valor_centavos")
      .eq("org_id", ctx.orgId)
      .gte("data_evento", desdeData),
    supabase
      .from("expense_records")
      .select("valor_centavos, pago")
      .eq("org_id", ctx.orgId)
      .gte("ocorrido_em", desdeData),
  ]);

  // Visitantes distintos, não visitas: recarregar a página não inventa gente.
  const visitantes = new Set(
    (visitas.data ?? []).map((v) => (v as { anonymous_session_id: string }).anonymous_session_id),
  ).size;

  const somaPorStatus = (alvo: string) =>
    (comissoes.data ?? [])
      .filter((c) => (c as { status: string }).status === alvo)
      .reduce((t, c) => t + (c as { valor_centavos: number }).valor_centavos, 0);

  const informadas = somaPorStatus("reported");
  const confirmadas = somaPorStatus("confirmed");
  const recebidas = somaPorStatus("received");
  const revertidas = somaPorStatus("reversed");

  const linhasDespesa = (despesas.data ?? []) as { valor_centavos: number; pago: boolean }[];
  const gastos = linhasDespesa.reduce((t, d) => t + d.valor_centavos, 0);
  const gastosPagos = linhasDespesa
    .filter((d) => d.pago)
    .reduce((t, d) => t + d.valor_centavos, 0);

  const metricas: MetricasPainel = {
    visitantes,
    conversas: conversas.count ?? 0,
    cliquesSaida: cliques.count ?? 0,
    leads: leads.count ?? 0,
    comissoesInformadasCentavos: informadas,
    comissoesConfirmadasCentavos: confirmadas,
    comissoesRecebidasCentavos: recebidas,
    comissoesRevertidasCentavos: revertidas,
    gastosRegistradosCentavos: gastos,
    gastosPagosCentavos: gastosPagos,
    // Confirmadas já excluem revertidas, porque uma comissão revertida muda de
    // status: ela deixa de ser 'confirmed'. Subtrair de novo contaria duas vezes.
    resultadoEstimadoCentavos: confirmadas - gastos,
    caixaRealizadoCentavos: recebidas - gastosPagos,
    temAlgumDado: false,
  };

  metricas.temAlgumDado =
    visitantes > 0 ||
    metricas.conversas > 0 ||
    metricas.cliquesSaida > 0 ||
    metricas.leads > 0 ||
    informadas + confirmadas + recebidas + revertidas > 0 ||
    gastos > 0;

  return metricas;
}
