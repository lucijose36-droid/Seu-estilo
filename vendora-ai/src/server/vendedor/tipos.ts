/**
 * Contrato do atendente automatizado.
 *
 * A decisão de projeto que sustenta "nunca inventar":
 * o provedor NÃO devolve texto sobre o produto. Ele devolve REFERÊNCIAS a
 * conteúdo já verificado — o id de uma afirmação, o id de um produto, a
 * chave de uma mensagem configurada. Quem monta o texto final é o servidor,
 * a partir do banco.
 *
 * A diferença é decisiva. Se o provedor escrevesse texto livre, "não invente
 * preço" seria um pedido, e todo guardrail viraria uma tentativa de detectar
 * mentira em linguagem natural — problema que ninguém resolve de forma
 * confiável. Referenciando, um provedor só consegue escolher ENTRE fatos
 * verificados; inventar um preço é literalmente inexprimível no formato.
 *
 * Isso vale igual para o motor de regras de hoje e para um modelo de
 * linguagem amanhã: o contrato é o mesmo, e o guardrail também.
 */

import type { EtapaLead } from "@/lib/tipos";

export type ChaveMensagem =
  | "boas_vindas"
  | "fora_horario"
  | "transferir_humano"
  | "sem_resposta";

/** Um pedaço da resposta. Cada variante é verificável contra o banco. */
export type Bloco =
  /** Texto configurado pelo dono da organização, em org_settings. */
  | { tipo: "mensagem"; chave: ChaveMensagem }
  /** Uma afirmação verificada (product_claims.ativo = true). */
  | { tipo: "claim"; claimId: string }
  /** A descrição verificada do produto. */
  | { tipo: "descricao"; produtoId: string }
  /** Preço de referência, sempre renderizado com data e ressalva. */
  | { tipo: "preco"; produtoId: string }
  /** Chamada para a página oficial, via /go. O link nunca vem do provedor. */
  | { tipo: "cta"; produtoId: string }
  /** Pergunta de triagem, escolhida de um conjunto fixo. */
  | { tipo: "pergunta"; perguntaId: string }
  /**
   * Texto de ligação, sem conteúdo factual: "certo", "entendi", "posso te
   * ajudar com mais alguma coisa?". Passa pelo guardrail mais rígido —
   * sem números, sem links, sem promessa.
   */
  | { tipo: "livre"; texto: string };

export interface EntradaVendedor {
  mensagemVisitante: string;
  historico: { autoria: "visitante" | "assistente" | "humano"; conteudo: string }[];
  /** Produtos ativos da organização, já filtrados pelo servidor. */
  produtos: ProdutoParaVendedor[];
  configuracoes: ConfiguracoesVendedor;
  etapaAtual: EtapaLead;
}

export interface ProdutoParaVendedor {
  id: string;
  titulo: string;
  publico_alvo: string;
  descricao_verificada: string;
  preco_referencia_centavos: number | null;
  preco_referencia_em: string | null;
  moeda: string;
  plataforma: string;
  claims: { id: string; afirmacao: string; tipo: string }[];
}

export interface ConfiguracoesVendedor {
  empresa_nome: string;
  atendente_nome: string;
  msg_boas_vindas: string;
  msg_fora_horario: string;
  msg_transferir_humano: string;
  msg_sem_resposta: string;
}

export interface SaidaVendedor {
  blocos: Bloco[];
  encaminharHumano: boolean;
  motivoEncaminhamento?: string;
  etapaSugerida?: EtapaLead;
  /** Para a aba de inspeção do simulador. */
  ferramentasUsadas: string[];
}

export interface ProvedorVendedor {
  readonly nome: string;
  responder(entrada: EntradaVendedor): Promise<SaidaVendedor>;
}
