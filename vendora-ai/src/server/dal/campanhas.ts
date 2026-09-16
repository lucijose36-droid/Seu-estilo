import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";
import { obterContexto } from "./session";

export interface Campanha {
  id: string;
  nome: string;
  canal: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  orcamento_limite_centavos: number;
  status: string;
}

export interface CampanhaComGasto extends Campanha {
  gastoRegistradoCentavos: number;
  cliques: number;
}

export async function listarCampanhas(): Promise<CampanhaComGasto[]> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return [];

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "id, nome, canal, utm_source, utm_medium, utm_campaign, orcamento_limite_centavos, status, expense_records(valor_centavos), outbound_clicks(id)",
    )
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((linha) => {
    const c = linha as unknown as Campanha & {
      expense_records: { valor_centavos: number }[];
      outbound_clicks: { id: string }[];
    };
    return {
      id: c.id,
      nome: c.nome,
      canal: c.canal,
      utm_source: c.utm_source,
      utm_medium: c.utm_medium,
      utm_campaign: c.utm_campaign,
      orcamento_limite_centavos: c.orcamento_limite_centavos,
      status: c.status,
      gastoRegistradoCentavos: (c.expense_records ?? []).reduce(
        (t, d) => t + d.valor_centavos,
        0,
      ),
      cliques: (c.outbound_clicks ?? []).length,
    };
  });
}
