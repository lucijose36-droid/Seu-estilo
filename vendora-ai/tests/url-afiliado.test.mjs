import { test } from "node:test";
import assert from "node:assert/strict";
import { analisarUrlAfiliado, PLATAFORMAS } from "../src/lib/afiliado/plataformas.ts";

test("aceita link legítimo da plataforma escolhida", () => {
  const r = analisarUrlAfiliado("https://pay.hotmart.com/X123456?off=abc", "hotmart");
  assert.equal(r.ok, true);
  assert.equal(r.hostname, "pay.hotmart.com");
});

test("aceita o domínio exato, não só subdomínio", () => {
  assert.equal(analisarUrlAfiliado("https://hotmart.com/produto", "hotmart").ok, true);
});

test("recusa http — o destino de um clique com comissão não trafega em claro", () => {
  const r = analisarUrlAfiliado("http://pay.hotmart.com/X", "hotmart");
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "protocolo");
});

test("recusa esquemas perigosos", () => {
  for (const u of ["javascript:alert(1)", "data:text/html,<script>", "file:///etc/passwd"]) {
    assert.equal(analisarUrlAfiliado(u, "hotmart").ok, false, u);
  }
});

test("recusa domínio sósia — o ataque que a lista existe para barrar", () => {
  // includes('hotmart.com') aceitaria todos estes. endsWith('.hotmart.com') não.
  const sosias = [
    "https://hotmart.com.invasor.net/X",
    "https://evil-hotmart.com/X",
    "https://hotmart.com.br.attacker.io/X",
    "https://nothotmart.com/X",
  ];
  for (const u of sosias) {
    const r = analisarUrlAfiliado(u, "hotmart");
    assert.equal(r.ok, false, `deveria recusar ${u}`);
    assert.equal(r.motivo, "host-nao-permitido");
  }
});

test("recusa credenciais embutidas na URL", () => {
  const r = analisarUrlAfiliado("https://pay.hotmart.com@invasor.net/x", "hotmart");
  assert.equal(r.ok, false);
  // O parser trata "pay.hotmart.com" como usuário e "invasor.net" como host:
  // a URL PARECE da Hotmart e não é. Recusada de todo modo.
  assert.ok(r.motivo === "credenciais" || r.motivo === "host-nao-permitido");
});

test("recusa porta fora do padrão", () => {
  assert.equal(analisarUrlAfiliado("https://pay.hotmart.com:8443/x", "hotmart").motivo, "porta");
});

test("recusa link de uma plataforma quando outra foi escolhida", () => {
  const r = analisarUrlAfiliado("https://pay.kiwify.com.br/abc", "hotmart");
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "host-nao-permitido");
});

test("recusa plataforma desconhecida", () => {
  assert.equal(analisarUrlAfiliado("https://qualquer.com/x", "inexistente").ok, false);
});

test("toda plataforma cadastrada tem ao menos um domínio", () => {
  for (const p of PLATAFORMAS) {
    assert.ok(p.dominios.length > 0, p.id);
    for (const d of p.dominios) assert.ok(!d.startsWith("."), d);
  }
});
