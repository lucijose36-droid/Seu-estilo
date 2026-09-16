/** Tipos compartilhados entre cliente e servidor. */

export type EtapaLead =
  | "novo"
  | "conversando"
  | "interessado"
  | "encaminhado_checkout"
  | "conversao_verificada"
  | "sem_conversao_conhecida";

export const ROTULO_ETAPA: Record<EtapaLead, string> = {
  novo: "Novo",
  conversando: "Conversando",
  interessado: "Interessado",
  encaminhado_checkout: "Encaminhado ao checkout",
  conversao_verificada: "Conversão verificada",
  sem_conversao_conhecida: "Sem conversão conhecida",
};

export type StatusComissao =
  | "reported"
  | "confirmed"
  | "received"
  | "reversed"
  | "unknown";

/**
 * Rótulos das comissões. A distância entre eles é a honestidade do produto:
 * "informada" é o que alguém disse, "confirmada" é o que a plataforma
 * confirmou, "recebida" é dinheiro que entrou. Nunca colapsar em "venda".
 */
export const ROTULO_COMISSAO: Record<StatusComissao, string> = {
  reported: "Comissão informada",
  confirmed: "Comissão confirmada",
  received: "Comissão recebida",
  reversed: "Comissão revertida",
  unknown: "Situação desconhecida",
};
