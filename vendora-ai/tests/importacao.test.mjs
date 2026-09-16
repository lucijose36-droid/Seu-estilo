import { test } from "node:test";
import assert from "node:assert/strict";
import { lerCsv } from "../src/lib/importacao/csv.ts";
import {
  analisarRelatorio,
  impressaoDigital,
  lerData,
  mapearStatus,
} from "../src/lib/importacao/comissoes.ts";

// ------------------------------------------------------------------- CSV

test("campo com vírgula dentro de aspas não desloca as colunas", () => {
  const csv = 'id,produto,valor\nTX1,"Curso de Excel, módulo 2",97,00\n';
  // Com separador vírgula, "97,00" seria duas células — este arquivo é
  // ambíguo de propósito. O que importa: as aspas foram respeitadas.
  const { linhas } = lerCsv(csv);
  assert.equal(linhas[0].produto, "Curso de Excel, módulo 2");
});

test("aspas escapadas viram uma aspa só", () => {
  const { linhas } = lerCsv('a\n"diz ""oi"" aqui"\n');
  assert.equal(linhas[0].a, 'diz "oi" aqui');
});

test("detecta ponto e vírgula, que é o padrão do Excel em pt-BR", () => {
  const { cabecalho, linhas } = lerCsv("id;valor;status\nTX1;97,00;Aprovada\n");
  assert.deepEqual(cabecalho, ["id", "valor", "status"]);
  assert.equal(linhas[0].valor, "97,00");
});

test("remove BOM, que o Excel insere e estragaria o nome da primeira coluna", () => {
  const { cabecalho } = lerCsv("﻿id,valor\nTX1,10\n");
  assert.equal(cabecalho[0], "id");
});

test("ignora linha em branco no fim do arquivo", () => {
  const { linhas } = lerCsv("id,valor\nTX1,10\n\n");
  assert.equal(linhas.length, 1);
});

// ---------------------------------------------------------------- status

test("status conhecidos mapeiam para os estados certos", () => {
  assert.equal(mapearStatus("Aprovada"), "confirmed");
  assert.equal(mapearStatus("aprovado"), "confirmed");
  assert.equal(mapearStatus("Recebido"), "received");
  assert.equal(mapearStatus("Saque realizado"), "received");
  assert.equal(mapearStatus("Reembolsado"), "reversed");
  assert.equal(mapearStatus("Chargeback"), "reversed");
  assert.equal(mapearStatus("Pendente"), "reported");
  assert.equal(mapearStatus("Aguardando"), "reported");
});

test("'Pago' é ambíguo e NÃO é classificado sozinho", () => {
  // Numa plataforma significa "o cliente pagou" (comissão apenas aprovada),
  // noutra "a comissão foi paga a você" (dinheiro na conta). Classificar
  // erraria por excesso na métrica em que o usuário mais confia.
  assert.equal(mapearStatus("Pago"), "unknown");
  assert.equal(mapearStatus("pagamento"), "unknown");
  assert.equal(mapearStatus("Finalizado"), "unknown");
  assert.equal(mapearStatus("paid"), "unknown");
  assert.equal(mapearStatus("completed"), "unknown");
});

test("status desconhecido vira 'unknown', NUNCA 'confirmed'", () => {
  // Na dúvida, o sistema assume o estado que não promete dinheiro.
  for (const s of ["Blargh", "", "processado internamente", "XPTO"]) {
    assert.notEqual(mapearStatus(s), "confirmed");
    assert.notEqual(mapearStatus(s), "received");
  }
  assert.equal(mapearStatus("Blargh"), "unknown");
});

// ------------------------------------------------------------------ data

test("lê data em ISO e em formato brasileiro", () => {
  assert.equal(lerData("2026-09-16"), "2026-09-16");
  assert.equal(lerData("16/09/2026"), "2026-09-16");
  assert.equal(lerData("2026-09-16T10:30:00Z"), "2026-09-16");
});

test("data ilegível devolve null em vez de chutar hoje", () => {
  assert.equal(lerData("ontem"), null);
  assert.equal(lerData(""), null);
});

// ------------------------------------------------------------- relatório

test("importa as linhas boas e relata as ruins, sem adivinhar", () => {
  const csv = [
    "transacao,comissao,situacao,data",
    "TX-1,97|00,Aprovada,16/09/2026",     // valor ilegível
    "TX-2,48'50,Pendente,16/09/2026",     // valor ilegível
    "TX-3,97,Aprovada,data-invalida",     // data ilegível
    "TX-4,150,Aprovada,16/09/2026",       // boa
  ].join("\n");

  const { cabecalho, linhas } = lerCsv(csv);
  const r = analisarRelatorio(cabecalho, linhas);

  assert.equal(r.registros.length, 1);
  assert.equal(r.registros[0].external_transaction_id, "TX-4");
  assert.equal(r.registros[0].valor_centavos, 15000);
  assert.equal(r.registros[0].status, "confirmed");
  assert.equal(r.ignoradas.length, 3);
  assert.ok(r.ignoradas[2].motivo.includes("data ilegível"));
});

test("reconhece colunas com nomes diferentes entre plataformas", () => {
  const a = lerCsv("transaction,commission,status,date\nX1,10.00,received,2026-01-02\n");
  const ra = analisarRelatorio(a.cabecalho, a.linhas);
  assert.equal(ra.registros.length, 1);
  assert.equal(ra.registros[0].status, "received");

  const b = lerCsv("codigo;valor;situacao;data\nY1;20,00;Reembolsado;02/01/2026\n");
  const rb = analisarRelatorio(b.cabecalho, b.linhas);
  assert.equal(rb.registros[0].valor_centavos, 2000);
  assert.equal(rb.registros[0].status, "reversed");
});

test("coluna 'id' exata ganha de 'id_produto'", () => {
  const { cabecalho, linhas } = lerCsv("id_produto,id,valor,data\nP9,TX-7,10,2026-01-02\n");
  const r = analisarRelatorio(cabecalho, linhas);
  assert.equal(r.registros[0].external_transaction_id, "TX-7");
});

test("linha sem id externo entra, mas sem chave de deduplicação", () => {
  const { cabecalho, linhas } = lerCsv("valor,data\n10,2026-01-02\n");
  const r = analisarRelatorio(cabecalho, linhas);
  assert.equal(r.registros.length, 1);
  assert.equal(r.registros[0].external_transaction_id, null);
});

// --------------------------------------------------------- idempotência

test("o mesmo conteúdo produz a mesma impressão digital", async () => {
  const a = await impressaoDigital("id,valor\nTX1,10\n");
  const b = await impressaoDigital("id,valor\nTX1,10\n");
  const c = await impressaoDigital("id,valor\nTX1,11\n");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 64);
});
