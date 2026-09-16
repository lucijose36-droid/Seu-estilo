import type { Bloco, EntradaVendedor, SaidaVendedor } from "./tipos";

/**
 * Validação da resposta antes de qualquer coisa chegar ao visitante.
 *
 * Duas camadas:
 *
 *   1. Referências: todo bloco que aponta para um claim, produto ou mensagem
 *      precisa apontar para algo que existe e está ativo. Um id inventado
 *      reprova a resposta inteira.
 *
 *   2. Texto livre: o único lugar onde o provedor escreve. Por isso é o mais
 *      fiscalizado — sem números, sem links, sem promessa de resultado.
 *
 * Reprovar não é "corrigir": a resposta é descartada e o atendimento vai para
 * uma pessoa. Tentar consertar automaticamente uma resposta suspeita é como
 * reescrever uma nota fiscal errada em vez de emiti-la de novo.
 */

export interface Veredito {
  aprovado: boolean;
  motivos: string[];
}

/**
 * Promessas que este produto não faz, em nenhuma circunstância.
 *
 * A lista cobre exatamente o que a identidade proíbe: renda fácil, garantia
 * de resultado, escassez inventada e urgência fabricada. Não é uma tentativa
 * de detectar toda mentira possível — é a defesa contra as frases que um
 * gerador de texto produz sozinho quando o assunto é vender infoproduto.
 */
const PROMESSAS_PROIBIDAS: { padrao: RegExp; motivo: string }[] = [
  { padrao: /\bganh\w*\s+(dinheiro|renda|grana)/, motivo: "promessa de ganho" },
  { padrao: /\brenda\s+(extra|garantida|passiva|mensal)/, motivo: "promessa de renda" },
  { padrao: /\blucro\s+(certo|garantido|rapido|facil)/, motivo: "promessa de lucro" },
  { padrao: /\bgarant\w*\s+(resultado|retorno|lucro|ganho|venda)/, motivo: "garantia de resultado" },
  { padrao: /\bresultado\s+garantid\w+/, motivo: "garantia de resultado" },
  { padrao: /\bultimas?\s+vagas?\b/, motivo: "escassez alegada" },
  { padrao: /\bvagas?\s+limitad\w+/, motivo: "escassez alegada" },
  { padrao: /\bso\s+hoje\b/, motivo: "urgencia fabricada" },
  { padrao: /\bpor\s+tempo\s+limitado\b/, motivo: "urgencia fabricada" },
  { padrao: /\bdesconto\s+(exclusiv\w+|especial|secreto)/, motivo: "desconto nao verificado" },
  { padrao: /\bcupom\b/, motivo: "cupom nao verificado" },
  { padrao: /\bdinheiro\s+de\s+volta\b/, motivo: "garantia de reembolso nao verificada" },
  { padrao: /\bmudou\s+minha\s+vida\b/, motivo: "depoimento fabricado" },
  { padrao: /\beu\s+(usei|comprei|fiz)\s+e\b/, motivo: "depoimento fabricado" },
];

/**
 * Normaliza antes de comparar: minusculas e sem acento.
 *
 * Duas razoes. A primeira e um bug sutil: em JavaScript, `\b` considera
 * apenas [A-Za-z0-9_], entao /\bultimas/ NAO casa com "Ultimas" acentuado —
 * a letra acentuada nao e caractere de palavra, e a borda falha. Num produto
 * inteiro em portugues, isso deixaria metade da lista sem efeito.
 *
 * A segunda: normalizar tambem derruba a evasao por acentuacao, em que
 * "ultimas vagas" e "ultimas vagas" com acento precisariam de duas regras.
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Qualquer valor monetario ou percentual no texto livre. */
const NUMERO_SENSIVEL = /(r\$|\bbrl\b|\d+\s*%|\d+[.,]\d{2}\b)/;

/** Qualquer coisa que pareca um endereco. */
const PARECE_LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|com\.br|net|io|app|me)\b)/;

const LIMITE_TEXTO_LIVRE = 240;

export function validarSaida(
  saida: SaidaVendedor,
  entrada: EntradaVendedor,
): Veredito {
  const motivos: string[] = [];

  const produtosPorId = new Map(entrada.produtos.map((p) => [p.id, p]));
  const claimsPorId = new Map(
    entrada.produtos.flatMap((p) => p.claims.map((c) => [c.id, { ...c, produtoId: p.id }])),
  );

  if (saida.blocos.length === 0 && !saida.encaminharHumano) {
    motivos.push("resposta vazia");
  }

  for (const bloco of saida.blocos) {
    switch (bloco.tipo) {
      case "claim":
        if (!claimsPorId.has(bloco.claimId)) {
          motivos.push(
            `afirmação ${bloco.claimId} não existe entre as verificadas e ativas`,
          );
        }
        break;

      case "descricao":
      case "preco":
      case "cta": {
        const produto = produtosPorId.get(bloco.produtoId);
        if (!produto) {
          motivos.push(`produto ${bloco.produtoId} não está ativo nesta organização`);
          break;
        }
        if (bloco.tipo === "preco" && produto.preco_referencia_centavos === null) {
          motivos.push(
            `preço citado para "${produto.titulo}", que não tem preço de referência cadastrado`,
          );
        }
        if (bloco.tipo === "descricao" && produto.descricao_verificada.trim() === "") {
          motivos.push(`descrição citada para "${produto.titulo}", que está vazia`);
        }
        break;
      }

      case "livre": {
        motivos.push(...validarTextoLivre(bloco.texto));
        break;
      }

      case "mensagem":
      case "pergunta":
        break;
    }
  }

  // No máximo três produtos por resposta. Mais do que isso deixa de ser
  // recomendação e vira catálogo despejado.
  const produtosCitados = new Set(
    saida.blocos
      .filter((b): b is Extract<Bloco, { produtoId: string }> => "produtoId" in b)
      .map((b) => b.produtoId),
  );
  if (produtosCitados.size > 3) {
    motivos.push(`${produtosCitados.size} produtos numa só resposta; o limite é 3`);
  }

  return { aprovado: motivos.length === 0, motivos };
}

export function validarTextoLivre(texto: string): string[] {
  const motivos: string[] = [];
  const normalizado = normalizar(texto);

  if (texto.length > LIMITE_TEXTO_LIVRE) {
    motivos.push(`texto livre com ${texto.length} caracteres; o limite é ${LIMITE_TEXTO_LIVRE}`);
  }
  if (NUMERO_SENSIVEL.test(normalizado)) {
    motivos.push(
      "valor ou percentual em texto livre; preço só pode sair de um bloco de preço verificado",
    );
  }
  if (PARECE_LINK.test(normalizado)) {
    motivos.push("endereço em texto livre; links só saem do bloco de CTA");
  }
  for (const { padrao, motivo } of PROMESSAS_PROIBIDAS) {
    if (padrao.test(normalizado)) motivos.push(`${motivo}: "${texto.slice(0, 60)}"`);
  }

  return motivos;
}
