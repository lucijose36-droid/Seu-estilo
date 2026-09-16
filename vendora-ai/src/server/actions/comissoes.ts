"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/server/supabase/server";
import { exigirContexto, podeAoMenos } from "@/server/dal/session";
import { lerCsv } from "@/lib/importacao/csv";
import { analisarRelatorio, impressaoDigital } from "@/lib/importacao/comissoes";

export interface ResultadoImportacao {
  erro?: string;
  jaImportado?: boolean;
  lidas?: number;
  importadas?: number;
  duplicadas?: number;
  ignoradas?: { linha: number; motivo: string }[];
  semIdExterno?: number;
  precisamRevisao?: number;
}

const LIMITE_BYTES = 2 * 1024 * 1024;

/**
 * Importação de relatório de comissões.
 *
 * Três camadas de idempotência, porque reimportar é o erro mais fácil de
 * cometer e o mais caro de descobrir:
 *
 *   1. impressão digital do arquivo — o mesmo relatório não roda duas vezes;
 *   2. índice único (org, plataforma, id externo) no banco — a mesma
 *      transação não entra duas vezes, mesmo vinda de arquivos diferentes;
 *   3. contagem do que foi recusado, relatada na tela, para "importei e não
 *      apareceu nada" nunca ser um mistério.
 */
export async function importarComissoes(fd: FormData): Promise<ResultadoImportacao> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, "admin")) {
    return { erro: "Seu papel não permite importar comissões." };
  }

  const arquivo = fd.get("arquivo");
  const plataforma = String(fd.get("plataforma") ?? "").trim();

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha um arquivo CSV." };
  }
  if (arquivo.size > LIMITE_BYTES) {
    return { erro: "Arquivo maior que 2 MB." };
  }
  if (plataforma === "") {
    return { erro: "Informe de qual plataforma é o relatório." };
  }

  const supabase = await criarClienteServidor();
  if (!supabase) return { erro: "Banco não configurado neste ambiente." };

  const conteudo = await arquivo.text();
  const fingerprint = await impressaoDigital(conteudo);

  const { data: lote, error: erroLote } = await supabase
    .from("import_batches")
    .insert({
      org_id: ctx.orgId,
      plataforma,
      arquivo_nome: arquivo.name,
      arquivo_fingerprint: fingerprint,
      criado_por: ctx.userId,
    })
    .select("id")
    .single();

  if (erroLote) {
    // 23505 aqui só pode ser a unicidade (org, plataforma, fingerprint).
    if (erroLote.code === "23505") {
      return {
        jaImportado: true,
        erro: "Este arquivo já foi importado antes. Nada foi duplicado.",
      };
    }
    return { erro: erroLote.message };
  }

  const { cabecalho, linhas } = lerCsv(conteudo);
  const analise = analisarRelatorio(cabecalho, linhas);

  let importadas = 0;
  let duplicadas = 0;

  // Uma linha por vez, de propósito: um insert em lote falharia inteiro por
  // causa de uma duplicata, e o objetivo é justamente aproveitar o resto.
  for (const r of analise.registros) {
    const { error } = await supabase.from("commission_records").insert({
      org_id: ctx.orgId,
      plataforma,
      external_transaction_id: r.external_transaction_id,
      valor_centavos: r.valor_centavos,
      status: r.status,
      source_type: "importacao_csv",
      source_reference: r.source_reference,
      import_batch_id: lote.id,
      data_evento: r.data_evento,
      // O banco exige estas datas para os estados correspondentes; o
      // relatório é a evidência, e a data do evento é o que ele traz.
      confirmado_at:
        r.status === "confirmed" || r.status === "received"
          ? new Date(`${r.data_evento}T12:00:00Z`).toISOString()
          : null,
      recebido_at:
        r.status === "received"
          ? new Date(`${r.data_evento}T12:00:00Z`).toISOString()
          : null,
    });

    if (!error) {
      importadas++;
    } else if (error.code === "23505") {
      duplicadas++;
    } else {
      analise.ignoradas.push({ linha: 0, motivo: error.message });
    }
  }

  await supabase
    .from("import_batches")
    .update({
      status: "processado",
      linhas_lidas: linhas.length,
      linhas_importadas: importadas,
      linhas_ignoradas: analise.ignoradas.length + duplicadas,
    })
    .eq("id", lote.id)
    .eq("org_id", ctx.orgId);

  revalidatePath("/comissoes");
  revalidatePath("/painel");

  return {
    lidas: linhas.length,
    importadas,
    duplicadas,
    ignoradas: analise.ignoradas,
    semIdExterno: analise.registros.filter((r) => r.external_transaction_id === null).length,
    precisamRevisao: analise.registros.filter((r) => r.status === "unknown").length,
  };
}
