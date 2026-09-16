import type {
  Bloco,
  EntradaVendedor,
  ProvedorVendedor,
  SaidaVendedor,
} from "../tipos";
import { PERGUNTAS } from "../perguntas";

/**
 * Motor por regras — o provedor do MVP.
 *
 * Não custa nada por conversa e não depende de chave de API. Classifica a
 * intenção por palavras-chave e monta a resposta com REFERÊNCIAS ao conteúdo
 * verificado, respeitando o mesmo contrato que um provedor de IA respeitaria.
 *
 * Sua limitação é honesta: ele não entende nuance. Por isso, diante de
 * qualquer coisa que não reconheça, ele encaminha para uma pessoa em vez de
 * responder à toa. Um atendimento que diz "não sei, vou chamar alguém" é
 * melhor do que um que inventa.
 */

const PALAVRAS = {
  preco: /\b(preç|preco|valor|quanto custa|quanto é|quanto e|caro|barato|invest)/i,
  compra: /\b(quero|comprar|adquirir|como faço|como faco|link|onde compro|me manda)/i,
  garantia: /\b(garantia|reembolso|devolv|arrepend|7 dias|30 dias)/i,
  conteudo: /\b(conteúdo|conteudo|aula|módulo|modulo|aprend|ensina|inclui|material)/i,
  suporte: /\b(suporte|dúvida|duvida|tira dúvida|professor|mentor|acompanha)/i,
  humano: /\b(humano|atendente|pessoa|falar com alguém|falar com alguem|gerente)/i,
  saudacao: /^\s*(oi|olá|ola|bom dia|boa tarde|boa noite|e aí|opa|hey)\b/i,
};

/** Tipos de claim que respondem a cada intenção. */
const CLAIM_PARA_INTENCAO: Record<string, string[]> = {
  garantia: ["garantia"],
  conteudo: ["conteudo"],
  suporte: ["suporte"],
  bonus: ["bonus"],
};

export const provedorRegras: ProvedorVendedor = {
  nome: "rules",

  async responder(entrada: EntradaVendedor): Promise<SaidaVendedor> {
    const msg = entrada.mensagemVisitante;
    const ferramentas: string[] = ["listar_produtos_ativos"];
    const primeiraInteracao = entrada.historico.length === 0;

    // Pedido explícito de humano é atendido de imediato, sempre.
    if (PALAVRAS.humano.test(msg)) {
      return {
        blocos: [{ tipo: "mensagem", chave: "transferir_humano" }],
        encaminharHumano: true,
        motivoEncaminhamento: "visitante pediu atendimento humano",
        ferramentasUsadas: ferramentas,
      };
    }

    // Sem produto ativo não há o que recomendar — e recomendar assim mesmo
    // seria exatamente o comportamento que este produto existe para evitar.
    if (entrada.produtos.length === 0) {
      return {
        blocos: [{ tipo: "mensagem", chave: "sem_resposta" }],
        encaminharHumano: true,
        motivoEncaminhamento: "nenhum produto ativo cadastrado",
        ferramentasUsadas: ferramentas,
      };
    }

    const produto = entrada.produtos[0]!;
    const blocos: Bloco[] = [];

    if (primeiraInteracao) {
      blocos.push({ tipo: "mensagem", chave: "boas_vindas" });
      blocos.push({ tipo: "pergunta", perguntaId: PERGUNTAS[0].id });
      return {
        blocos,
        encaminharHumano: false,
        etapaSugerida: "conversando",
        ferramentasUsadas: ferramentas,
      };
    }

    if (PALAVRAS.preco.test(msg)) {
      ferramentas.push("consultar_preco_referencia");
      if (produto.preco_referencia_centavos === null) {
        // Não há preço verificado: não se estima, não se arredonda.
        return {
          blocos: [
            { tipo: "mensagem", chave: "sem_resposta" },
            { tipo: "cta", produtoId: produto.id },
          ],
          encaminharHumano: false,
          etapaSugerida: "interessado",
          ferramentasUsadas: ferramentas,
        };
      }
      return {
        blocos: [
          { tipo: "preco", produtoId: produto.id },
          { tipo: "cta", produtoId: produto.id },
        ],
        encaminharHumano: false,
        etapaSugerida: "interessado",
        ferramentasUsadas: ferramentas,
      };
    }

    if (PALAVRAS.compra.test(msg)) {
      return {
        blocos: [{ tipo: "cta", produtoId: produto.id }],
        encaminharHumano: false,
        etapaSugerida: "encaminhado_checkout",
        ferramentasUsadas: ferramentas,
      };
    }

    for (const [intencao, tipos] of Object.entries(CLAIM_PARA_INTENCAO)) {
      const chave = PALAVRAS[intencao as keyof typeof PALAVRAS];
      if (!chave || !chave.test(msg)) continue;

      ferramentas.push("listar_afirmacoes_verificadas");
      const encontradas = produto.claims.filter((c) => tipos.includes(c.tipo));

      if (encontradas.length === 0) {
        // Este é o caso que define o produto: a pergunta é legítima, mas não
        // há afirmação verificada para respondê-la. Não se improvisa.
        return {
          blocos: [{ tipo: "mensagem", chave: "sem_resposta" }],
          encaminharHumano: true,
          motivoEncaminhamento: `sem afirmação verificada do tipo "${intencao}"`,
          ferramentasUsadas: ferramentas,
        };
      }

      return {
        blocos: [
          ...encontradas.slice(0, 3).map((c): Bloco => ({ tipo: "claim", claimId: c.id })),
          { tipo: "pergunta", perguntaId: "seguir" },
        ],
        encaminharHumano: false,
        etapaSugerida: "interessado",
        ferramentasUsadas: ferramentas,
      };
    }

    if (PALAVRAS.saudacao.test(msg)) {
      return {
        blocos: [{ tipo: "pergunta", perguntaId: "objetivo" }],
        encaminharHumano: false,
        etapaSugerida: "conversando",
        ferramentasUsadas: ferramentas,
      };
    }

    // Nada reconhecido. O motor por regras admite o limite em vez de fingir.
    return {
      blocos: [{ tipo: "mensagem", chave: "sem_resposta" }],
      encaminharHumano: true,
      motivoEncaminhamento: "intenção não reconhecida pelo motor de regras",
      ferramentasUsadas: ferramentas,
    };
  },
};
