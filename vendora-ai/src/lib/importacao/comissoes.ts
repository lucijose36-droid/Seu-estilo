import { paraCentavos } from "@/lib/dinheiro";
import type { LinhaCsv } from "./csv";
import type { StatusComissao } from "@/lib/tipos";

/**
 * Tradução de um relatório de plataforma para registros de comissão.
 *
 * Duas regras que atravessam tudo:
 *
 *   1. Nada é adivinhado. Linha sem valor legível, sem data legível ou com
 *      status que não sabemos mapear é IGNORADA e relatada, nunca importada
 *      com um palpite. Um palpite entra no painel parecendo verificado.
 *
 *   2. Status desconhecido vira 'unknown', não 'confirmed'. Na dúvida, o
 *      sistema assume o estado que não promete dinheiro.
 */

/** Nomes de coluna que as plataformas usam para a mesma coisa. */
const SINONIMOS: Record<string, string[]> = {
  id: ["transaction", "transacao", "transação", "id", "codigo", "código", "order", "pedido"],
  valor: ["comissao", "comissão", "commission", "valor", "value", "amount", "ganho"],
  status: ["status", "situacao", "situação", "state"],
  data: ["data", "date", "data_evento", "created", "criado"],
  produto: ["produto", "product", "item"],
};

export function acharColuna(cabecalho: string[], campo: keyof typeof SINONIMOS): string | null {
  const alvos = SINONIMOS[campo]!;
  // Correspondência exata primeiro; só depois parcial, para "id" não casar
  // com "id_produto" quando existir uma coluna "id" de verdade.
  for (const alvo of alvos) {
    const exata = cabecalho.find((c) => c === alvo);
    if (exata) return exata;
  }
  for (const alvo of alvos) {
    const parcial = cabecalho.find((c) => c.includes(alvo));
    if (parcial) return parcial;
  }
  return null;
}

/**
 * Termos DELIBERADAMENTE nao mapeados, por serem ambiguos.
 *
 * "Pago" e o caso exemplar: numa plataforma pode significar "o cliente
 * pagou" (a comissao foi apenas aprovada) e noutra "a comissao foi paga a
 * voce" (dinheiro na conta). Classificar por conta propria erraria por
 * excesso justamente na metrica que o usuario mais confia. Estes termos caem
 * em 'unknown' e ficam esperando alguem decidir.
 */
const AMBIGUOS = ["pago", "paid", "pagamento", "ok", "finalizado", "concluido", "complete", "completed"];

const MAPA_STATUS: { padroes: string[]; status: StatusComissao }[] = [
  { padroes: ["aprovad", "approved", "confirmad"], status: "confirmed" },
  { padroes: ["recebid", "received", "saque", "transferid", "repassad"], status: "received" },
  { padroes: ["reembols", "refund", "chargeback", "cancelad", "estornad", "devolvid"], status: "reversed" },
  { padroes: ["pendente", "pending", "aguardando", "processando", "analise", "análise"], status: "reported" },
];

export function mapearStatus(bruto: string): StatusComissao {
  const t = bruto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  // Ambiguidade vence qualquer correspondencia parcial: "pago" nao pode cair
  // em "aprovado" nem em "recebido" por acidente de substring.
  if (AMBIGUOS.some((a) => t.trim() === a)) return "unknown";

  for (const { padroes, status } of MAPA_STATUS) {
    if (padroes.some((p) => t.includes(p.normalize("NFD").replace(/[̀-ͯ]/g, "")))) {
      return status;
    }
  }
  // Não sabemos o que é. 'unknown' é o único valor honesto aqui.
  return "unknown";
}

/** Converte data em vários formatos para ISO. Devolve null se não entender. */
export function lerData(bruto: string): string | null {
  const t = bruto.trim();
  if (t === "") return null;

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  return null;
}

export interface RegistroImportado {
  external_transaction_id: string | null;
  valor_centavos: number;
  status: StatusComissao;
  data_evento: string;
  source_reference: string;
}

export interface ResultadoAnalise {
  registros: RegistroImportado[];
  ignoradas: { linha: number; motivo: string }[];
  colunasUsadas: Record<string, string | null>;
}

export function analisarRelatorio(
  cabecalho: string[],
  linhas: LinhaCsv[],
): ResultadoAnalise {
  const colunas = {
    id: acharColuna(cabecalho, "id"),
    valor: acharColuna(cabecalho, "valor"),
    status: acharColuna(cabecalho, "status"),
    data: acharColuna(cabecalho, "data"),
  };

  const registros: RegistroImportado[] = [];
  const ignoradas: { linha: number; motivo: string }[] = [];

  linhas.forEach((linha, i) => {
    const numero = i + 2; // +1 do cabeçalho, +1 para contar a partir de 1

    if (!colunas.valor) {
      ignoradas.push({ linha: numero, motivo: "coluna de valor não encontrada" });
      return;
    }

    const centavos = paraCentavos(linha[colunas.valor] ?? "");
    if (centavos === null) {
      ignoradas.push({
        linha: numero,
        motivo: `valor ilegível: "${linha[colunas.valor] ?? ""}"`,
      });
      return;
    }
    if (centavos < 0) {
      ignoradas.push({ linha: numero, motivo: "valor negativo" });
      return;
    }

    const data = colunas.data ? lerData(linha[colunas.data] ?? "") : null;
    if (!data) {
      ignoradas.push({
        linha: numero,
        motivo: `data ilegível: "${colunas.data ? linha[colunas.data] ?? "" : "coluna ausente"}"`,
      });
      return;
    }

    const idExterno = colunas.id ? (linha[colunas.id] ?? "").trim() : "";

    registros.push({
      external_transaction_id: idExterno === "" ? null : idExterno,
      valor_centavos: centavos,
      status: colunas.status ? mapearStatus(linha[colunas.status] ?? "") : "unknown",
      data_evento: data,
      source_reference: `linha ${numero}`,
    });
  });

  return { registros, ignoradas, colunasUsadas: colunas };
}

/**
 * Impressão digital do arquivo, para a mesma importação não rodar duas vezes.
 * A unicidade real é garantida pelo índice do banco; isto é o que se compara.
 */
export async function impressaoDigital(conteudo: string): Promise<string> {
  const dados = new TextEncoder().encode(conteudo);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
