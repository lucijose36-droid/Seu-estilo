import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";
import { obterContexto } from "./session";
import type { StatusComissao } from "@/lib/tipos";

export interface Comissao {
  id: string;
  plataforma: string;
  external_transaction_id: string | null;
  valor_centavos: number;
  moeda: string;
  status: StatusComissao;
  source_type: string;
  source_reference: string;
  data_evento: string;
}

export async function listarComissoes(): Promise<Comissao[]> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return [];

  const { data, error } = await supabase
    .from("commission_records")
    .select(
      "id, plataforma, external_transaction_id, valor_centavos, moeda, status, source_type, source_reference, data_evento",
    )
    .eq("org_id", ctx.orgId)
    .order("data_evento", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as Comissao[];
}
