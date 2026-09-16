import "server-only";

import { provedorRegras } from "./provedores/regras";
import { validarSaida, type Veredito } from "./guardrails";
import { renderizar, type ParteRenderizada } from "./renderizar";
import type { EntradaVendedor, ProvedorVendedor, SaidaVendedor } from "./tipos";

/**
 * Orquestrador do atendente.
 *
 * Sequência: provedor escolhe blocos → guardrail valida → servidor renderiza.
 * O guardrail vem ANTES da renderização de propósito: nada reprovado chega a
 * virar texto.
 */

const PROVEDORES: Record<string, ProvedorVendedor> = {
  rules: provedorRegras,
};

export function escolherProvedor(nome: string): ProvedorVendedor {
  // Um provedor pago configurado mas não implementado não pode virar
  // silenciosamente o motor de regras: quem configurou precisa saber.
  const p = PROVEDORES[nome];
  if (!p) {
    console.warn(
      `[vendedor] provedor "${nome}" não implementado nesta versão; usando "rules"`,
    );
    return provedorRegras;
  }
  return p;
}

export interface ResultadoAtendimento {
  partes: ParteRenderizada[];
  encaminharHumano: boolean;
  motivoEncaminhamento?: string;
  veredito: Veredito;
  saidaBruta: SaidaVendedor;
  provedor: string;
  latenciaMs: number;
}

export async function atender(
  entrada: EntradaVendedor,
  nomeProvedor: string,
  baseUrl: string,
): Promise<ResultadoAtendimento> {
  const provedor = escolherProvedor(nomeProvedor);
  const inicio = Date.now();

  let saida: SaidaVendedor;
  try {
    saida = await provedor.responder(entrada);
  } catch (erro) {
    console.error("[vendedor] provedor falhou", erro);
    saida = {
      blocos: [{ tipo: "mensagem", chave: "transferir_humano" }],
      encaminharHumano: true,
      motivoEncaminhamento: "falha no provedor",
      ferramentasUsadas: [],
    };
  }

  const veredito = validarSaida(saida, entrada);

  // Reprovado: a resposta é DESCARTADA, não corrigida. Consertar
  // automaticamente uma resposta suspeita esconde o problema em vez de
  // resolvê-lo — e o caso vai para uma pessoa, que é quem pode julgar.
  if (!veredito.aprovado) {
    console.warn("[vendedor] resposta reprovada pelo validador", veredito.motivos);
    const substituta: SaidaVendedor = {
      blocos: [{ tipo: "mensagem", chave: "transferir_humano" }],
      encaminharHumano: true,
      motivoEncaminhamento: `validador reprovou: ${veredito.motivos.join("; ")}`,
      ferramentasUsadas: saida.ferramentasUsadas,
    };
    return {
      partes: renderizar(substituta.blocos, entrada, baseUrl),
      encaminharHumano: true,
      motivoEncaminhamento: substituta.motivoEncaminhamento,
      veredito,
      saidaBruta: saida,
      provedor: provedor.nome,
      latenciaMs: Date.now() - inicio,
    };
  }

  return {
    partes: renderizar(saida.blocos, entrada, baseUrl),
    encaminharHumano: saida.encaminharHumano,
    motivoEncaminhamento: saida.motivoEncaminhamento,
    veredito,
    saidaBruta: saida,
    provedor: provedor.nome,
    latenciaMs: Date.now() - inicio,
  };
}
