import { test } from "node:test";
import assert from "node:assert/strict";
import { formatarCentavos, paraCentavos } from "../src/lib/dinheiro.ts";

/** Espaco nao-quebravel que o Intl.NumberFormat usa apos o simbolo da moeda. */
const NBSP = "\u00A0";

test("paraCentavos entende o formato pt-BR", () => {
  assert.equal(paraCentavos("1.234,56"), 123456);
  assert.equal(paraCentavos("R$ 97,00"), 9700);
  assert.equal(paraCentavos("97"), 9700);
  assert.equal(paraCentavos("0,01"), 1);
});

test("paraCentavos entende o formato com ponto decimal", () => {
  assert.equal(paraCentavos("1234.56"), 123456);
  assert.equal(paraCentavos("97.5"), 9750);
});

test("paraCentavos recusa entrada invalida em vez de adivinhar", () => {
  assert.equal(paraCentavos("abc"), null);
  assert.equal(paraCentavos(""), null);
  assert.equal(paraCentavos("1,234"), null); // 3 casas decimais nao e centavo
});

test("nao ha erro de ponto flutuante na soma de centavos", () => {
  // O motivo de tudo ser inteiro: 0.1 + 0.2 !== 0.3 em ponto flutuante.
  const soma = paraCentavos("0,10") + paraCentavos("0,20");
  assert.equal(soma, 30);
  assert.equal(formatarCentavos(soma), `R$${NBSP}0,30`);
});

test("formatarCentavos usa o padrao brasileiro", () => {
  assert.equal(formatarCentavos(123456), `R$${NBSP}1.234,56`);
  assert.equal(formatarCentavos(0), `R$${NBSP}0,00`);
});

test("o separador apos R$ e espaco nao-quebravel, nao espaco comum", () => {
  // Intl emite U+00A0 de proposito, para o valor nunca quebrar linha entre o
  // simbolo e o numero. Fixado em teste porque e o tipo de detalhe invisivel
  // que quebra comparacao de string e exportacao de arquivo sem aviso.
  assert.ok(formatarCentavos(100).includes(NBSP));
  assert.ok(!formatarCentavos(100).includes("R$ "));
});
