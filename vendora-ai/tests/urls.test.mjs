import { test } from "node:test";
import assert from "node:assert/strict";
import { destinoSeguro } from "../src/lib/urls.ts";

test("destinoSeguro aceita caminho interno", () => {
  assert.equal(destinoSeguro("/produtos"), "/produtos");
  assert.equal(destinoSeguro("/comissoes?estado=confirmed"), "/comissoes?estado=confirmed");
});

test("destinoSeguro recusa redirecionamento externo", () => {
  // Estes sao os vetores reais de open redirect numa tela de login.
  assert.equal(destinoSeguro("https://site-falso.example"), "/painel");
  assert.equal(destinoSeguro("//site-falso.example"), "/painel");
  assert.equal(destinoSeguro("/\\site-falso.example"), "/painel");
  assert.equal(destinoSeguro("javascript:alert(1)"), "/painel");
});

test("destinoSeguro cai no painel quando nao ha destino", () => {
  assert.equal(destinoSeguro(undefined), "/painel");
  assert.equal(destinoSeguro(null), "/painel");
  assert.equal(destinoSeguro(""), "/painel");
});
