import "server-only";

import { criarClienteServidor } from "@/server/supabase/server";
import { obterContexto } from "./session";
import type { ConfiguracoesVendedor } from "@/server/vendedor/tipos";

export interface Configuracoes extends ConfiguracoesVendedor {
  vendedor_provider: string;
  teto_gasto_ia_centavos: number;
  retencao_conversas_dias: number;
}

/** Padrões usados só quando não há banco — nunca mascarados como dados salvos. */
export const CONFIG_PADRAO: Configuracoes = {
  empresa_nome: "",
  atendente_nome: "Assistente",
  msg_boas_vindas:
    "Olá! Sou um assistente automatizado. Posso tirar dúvidas sobre o material e, se fizer sentido para você, te levar até a página oficial.",
  msg_fora_horario:
    "No momento estamos fora do horário de atendimento humano, mas posso responder o que já está verificado por aqui.",
  msg_transferir_humano:
    "Essa eu não consigo responder com segurança. Vou encaminhar para uma pessoa da equipe.",
  msg_sem_resposta:
    "Não tenho essa informação confirmada. Prefiro não chutar: posso encaminhar para uma pessoa da equipe.",
  vendedor_provider: "rules",
  teto_gasto_ia_centavos: 0,
  retencao_conversas_dias: 180,
};

export async function obterConfiguracoes(): Promise<Configuracoes> {
  const ctx = await obterContexto();
  const supabase = await criarClienteServidor();
  if (!ctx || !supabase) return CONFIG_PADRAO;

  const { data, error } = await supabase
    .from("org_settings")
    .select(
      "empresa_nome, atendente_nome, msg_boas_vindas, msg_fora_horario, msg_transferir_humano, msg_sem_resposta, vendedor_provider, teto_gasto_ia_centavos, retencao_conversas_dias",
    )
    .eq("org_id", ctx.orgId)
    .maybeSingle();

  if (error || !data) return CONFIG_PADRAO;
  return data as Configuracoes;
}
