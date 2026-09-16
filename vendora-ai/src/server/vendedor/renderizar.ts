import { formatarCentavos } from "@/lib/dinheiro";
import { acharPergunta } from "./perguntas";
import type { Bloco, EntradaVendedor } from "./tipos";

/**
 * Converte blocos em texto.
 *
 * Isto roda no SERVIDOR, a partir do banco. O provedor escolheu os blocos; o
 * texto é escrito aqui. Por isso um preço exibido é necessariamente o preço
 * cadastrado, e um link exibido é necessariamente /go/<id>: não há caminho
 * pelo qual o provedor influencie essas duas coisas.
 */

export interface ParteRenderizada {
  texto: string;
  /** Referência que originou o texto, para a aba de inspeção do simulador. */
  origem: string;
}

export function renderizar(
  blocos: Bloco[],
  entrada: EntradaVendedor,
  baseUrl: string,
): ParteRenderizada[] {
  const produtos = new Map(entrada.produtos.map((p) => [p.id, p]));
  const claims = new Map(entrada.produtos.flatMap((p) => p.claims.map((c) => [c.id, c])));
  const cfg = entrada.configuracoes;
  const partes: ParteRenderizada[] = [];

  for (const bloco of blocos) {
    switch (bloco.tipo) {
      case "mensagem": {
        const mapa = {
          boas_vindas: cfg.msg_boas_vindas,
          fora_horario: cfg.msg_fora_horario,
          transferir_humano: cfg.msg_transferir_humano,
          sem_resposta: cfg.msg_sem_resposta,
        };
        partes.push({
          texto: mapa[bloco.chave],
          origem: `configuração: msg_${bloco.chave}`,
        });
        break;
      }

      case "claim": {
        const c = claims.get(bloco.claimId);
        if (!c) break;
        partes.push({ texto: c.afirmacao, origem: `afirmação verificada ${c.id}` });
        break;
      }

      case "descricao": {
        const p = produtos.get(bloco.produtoId);
        if (!p) break;
        partes.push({
          texto: p.descricao_verificada,
          origem: `descrição verificada de "${p.titulo}"`,
        });
        break;
      }

      case "preco": {
        const p = produtos.get(bloco.produtoId);
        if (!p || p.preco_referencia_centavos === null) break;
        // A data e a ressalva não são opcionais: preço de infoproduto muda, e
        // citar valor sem dizer de quando e sem apontar o checkout como fonte
        // final é desinformar.
        const data = p.preco_referencia_em
          ? ` (conferido em ${formatarData(p.preco_referencia_em)})`
          : "";
        partes.push({
          texto:
            `O preço de referência é ${formatarCentavos(p.preco_referencia_centavos, p.moeda)}${data}. ` +
            `O valor e as condições finais são os que aparecerem no checkout da ${p.plataforma}.`,
          origem: `preço de referência de "${p.titulo}"`,
        });
        break;
      }

      case "cta": {
        const p = produtos.get(bloco.produtoId);
        if (!p) break;
        // O link é montado aqui, a partir do id. O provedor nunca escreve URL.
        partes.push({
          texto: `Você pode conferir os detalhes na página oficial: ${baseUrl}/go/${p.id}`,
          origem: `CTA de "${p.titulo}" (link montado pelo servidor)`,
        });
        break;
      }

      case "pergunta": {
        const q = acharPergunta(bloco.perguntaId);
        if (!q) break;
        partes.push({ texto: q.texto, origem: `pergunta de triagem "${q.id}"` });
        break;
      }

      case "livre":
        partes.push({ texto: bloco.texto, origem: "texto livre do provedor" });
        break;
    }
  }

  return partes;
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
}
