# Vendora AI — Arquitetura e decisões do MVP de afiliados

**Versão:** 1.0 — revisão de produto para implementação; **status:** especificação, não software implementado.  
**Nome oficial do produto:** Vendora AI. **Nome técnico:** `vendora-ai`.  
**Data:** 16/09/2026. **Orçamento inicial total:** R$ 300.  
**Origem:** revisão do documento `vendeai/ARQUITETURA.md` apresentado pelo Claude e da proposta posterior de afiliados. Este arquivo substitui a **direção de negócio** anterior, não comprova mudanças no repositório.

## 0. Decisões e escopo

1. **Identidade:** todas as novas interfaces, documentação, metadados, títulos e textos devem usar **Vendora AI**, não VendeAI. Identificadores técnicos novos devem usar `vendora-ai` ou `vendora_ai`, conforme convenção. Não renomear cegamente variáveis/rotas existentes: primeiro localizar referências e preparar migração segura.
2. **Negócio inicial:** atuar como afiliado de **um infoproduto aprovado**, em uma plataforma compatível (Hotmart, Kiwify ou outra). O produtor fornece conteúdo e suporte conforme suas condições; a plataforma realiza checkout e contabiliza as transações conforme seus próprios procedimentos.
3. **Função da Vendora AI:** captar visitantes com permissão, apresentar informações verificadas, responder dúvidas, registrar origem/click-out, encaminhar pelo link oficial de afiliado e conciliar comissões verificadas.
4. **Não desenvolver agora:** estoque físico, reserva de produtos, Pix próprio, captura de cartão, emissão de nota do produtor, transportadora, confirmação própria de pagamento, disparo massivo de mensagens ou gestão automática de verba publicitária.
5. **Desenvolvimento:** Claude pode escrever código; uma assinatura de chat do Claude **não equivale** a créditos de API para o vendedor. No MVP, começar por motor de regras e simulação sem custo por token; integração de IA via API só após autorização e teto de gastos.
6. **Critério financeiro:** não prometer faturamento, lucratividade ou retorno. Nunca confundir clique, intenção, venda informada, comissão confirmada e dinheiro recebido.
7. **Preservação:** Seu Estilo é outro produto. Nada de imports cruzados, banco compartilhado inadvertidamente ou substituição do deploy existente.

## 1. Identidade do produto

- **Marca:** Vendora AI (grafia exata, `AI` em caixa alta).
- **Assinatura proposta:** “Seu vendedor digital, do interesse à comissão.”
- **Descrição curta:** Plataforma de captação, atendimento e análise para vendas de afiliados, com automação responsável.
- **Tom:** confiável, claro, objetivo; sem promessas de renda fácil, contagem regressiva falsa, escassez inventada ou testemunhos fabricados.
- **Interface:** painel SaaS premium, responsivo; fundo claro ou escuro consistente, azul-escuro com violeta como acento e verde reservado para estados confirmados. Boa leitura, contraste e acessibilidade acima de efeitos decorativos.
- **Logo:** marca tipográfica original “Vendora AI” com símbolo opcional de conversa + fluxo; **não afirmar exclusividade ou disponibilidade jurídica**. Verificar marca, domínio e perfis antes de comprar ou publicar.
- **Domínio:** indefinido. Não pressupor disponibilidade de `vendora.ai`, `vendoraai.com.br` ou similares.
- **Labels:** “Comissão confirmada”, “Comissão recebida”, “Cliques de saída”, “Gasto em anúncios” e “Resultado líquido estimado”; nunca “Venda realizada” apenas por clique.

## 2. Estado inicial do repositório: observações do documento do Claude

O documento fonte descreve o repositório `Seu-estilo` com Next.js 16.3.5, React 19.2.8, Tailwind v4, 16 rotas e `localStorage`; relata build anterior bem-sucedido. **Essas são observações relatadas pelo Claude, não uma inspeção nova deste ambiente.** O app existente tem CSS global mobile-only e provider de estado próprios: não reaproveitá-los na Vendora AI.

**Preferência:** repositório autônomo `vendora-ai`. Se for necessário manter uma subpasta no mesmo repositório, usar `vendora-ai/` com `package.json`, lockfile, configuração, env, build e deploy próprios; auditar `tsconfig` e ESLint da raiz. Alterar a raiz **apenas se inevitável**, com diff mínimo, backup/commit e builds dos dois aplicativos antes/depois. A afirmação “zero alteração no Seu Estilo” só vale se for efetivamente possível.

## 3. Arquitetura lógica

```text
Conteúdo orgânico / anúncios autorizados
                │ UTMs e campanha
                ▼
 Página pública Vendora AI (divulgação de afiliação)
                │
                ▼
 Chat de qualificação / perguntas frequentes
 (MVP: regras; depois IA via API com teto de custo)
                │ consulta dados aprovados
                ▼
 Catálogo editorial de infoprodutos autorizados
                │
                ▼
 Botão explícito "Ver oferta na plataforma"
                │ registra click-out + atribuição permitida
                ▼
 Checkout EXTERNO oficial do produtor/plataforma
                │
                ▼
 Relatório/importação ou integração oficial autorizada
                │ conciliação + deduplicação
                ▼
 Comissões: informada → confirmada → recebida
                │ ajustes: pendente / reembolsada / cancelada
                ▼
 Dashboard: gastos, cliques, leads, comissões, saldo
```

**Fronteira de confiança:** o clique e a conversa são eventos locais; a compra e a comissão dependem de comprovação externa. Nunca inferir comissão apenas pela navegação de retorno ou por mensagem do visitante.

## 4. Tecnologias e integrações

- **Frontend/backend:** Next.js App Router + TypeScript strict + Tailwind, projeto autônomo.
- **Persistência/auth:** Supabase Postgres + Auth + RLS em todas as tabelas de negócio; migrations versionadas; banco dedicado preferencialmente.
- **Hospedagem:** Vercel ou alternativa compatível; conferir termos de uso, limites e custo do plano antes de operação comercial. Nenhuma premissa de hospedagem comercial gratuita garantida.
- **Atendente:** interface `SellerProvider` com `rules` no MVP e futuro adaptador de IA (`anthropic`, `openai` etc.) opcional. Claude usado para desenvolver não é automaticamente provedor do app.
- **Afiliados:** saída para HotLink/link autorizado; integrações de vendas apenas mediante documentação, permissões e credenciais reais. Sem scraping de painel ou API suposta.
- **Anúncios:** publicação manual inicialmente. APIs e gestão de orçamento apenas em versão posterior com aprovação explícita e limites rígidos.
- **WhatsApp:** fora do MVP. Integração futura oficial, consentimento, políticas de mensagens e custo verificados na implementação.
- **Pagamentos:** feitos integralmente no checkout externo. Nenhuma tela própria deve simular confirmação.

## 5. Modelo de dados — MVP afiliado

Todas as entidades de negócio contêm `org_id`, `created_at` quando aplicável e políticas de acesso compatíveis. Montantes monetários: centavos inteiros em BRL; se moedas múltiplas forem necessárias, adicionar código ISO e regra explícita de conversão, sem mistura silenciosa.

| Entidade | Dados essenciais | Regra |
|---|---|---|
| `organizations` | id, nome, timezone | `America/Sao_Paulo` como padrão configurável |
| `memberships` | org_id, user_id, role (`owner`,`admin`,`agent`) | permissões por função e organização |
| `affiliate_products` | id, org_id, titulo, plataforma, produto_external_id opcional, descrição verificada, público, preço_referencia_centavos opcional, comissão_estimada_centavos opcional, affiliate_url, status_aprovacao, regras_divulgacao, fonte_verificacao, verificado_at, ativo | sem ativar sem afiliação e URL verificadas |
| `product_claims` | product_id, afirmação, tipo, fonte, verificado_at, ativo | fatos e garantias citáveis; nada inventado |
| `campaigns` | id, org_id, nome, canal, utms, orçamento_limite_centavos, custo_registrado_centavos, status | gasto informado/importado, não assumido |
| `visits` | id, org_id, campaign_id opcional, anonymous_session_id, UTMs, occurred_at | evitar identificação pessoal desnecessária |
| `leads` | id, org_id, nome opcional, contato opcional, origem, consentimento/finalidade, etapa, timestamps | não exigir telefone para visitante anônimo |
| `conversations` / `messages` | org_id, lead_id opcional, sessão, mensagens, autoria, handoff | retenção limitada; aviso sobre atendente automatizado |
| `outbound_clicks` | id, org_id, product_id, campaign_id, lead_id opcional, tracking_id próprio, destino_aprovado, occurred_at | registrar clique sem tratá-lo como compra |
| `commission_records` | org_id, plataforma, external_transaction_id opcional, product_id, valor_centavos, moeda, status, source_type, source_reference, data_evento, confirmado_at, recebido_at | chave de deduplicação por plataforma+identificador quando disponível; relatórios sem ID exigem reconciliação |
| `commission_events` | commission_id, tipo, valor, referência, timestamp | eventos de reembolso/cancelamento preservam histórico |
| `expense_records` | org_id, campanha opcional, categoria, valor_centavos, ocorrido_em, comprovante opcional | registrar despesas de anúncio, API, domínio etc. |
| `ai_runs` | org_id, conversation_id, provider, model, tokens, custo_estimado, tools, validação, timestamp | auditoria; sem segredos nos logs |
| `import_batches` | org_id, plataforma, arquivo_fingerprint, importado_at, status, linhas_importadas | importação idempotente e rastreável |

**Remover da implementação inicial:** tabelas de `stock`, `order_items`, `payments` e webhooks de Pix próprio definidas na proposta de loja física. Reservar esses módulos para outra linha de produto, com migrations específicas futuras; não excluir dados preexistentes sem investigação.

**Comissão:** estados explícitos `reported`, `confirmed`, `received`, `reversed` e `unknown`; uma informação de venda fornecida pelo usuário não é confirmação oficial. Receita líquida estimada = comissões confirmadas **menos** despesas registradas; disponibilizar também visão de caixa com somente comissões recebidas menos despesas pagas, sem confundir as duas métricas.

## 6. Segurança e regras de acesso

1. DAL server-only resolve a organização e role pela sessão autenticada, não confia em `org_id` arbitrário do cliente. Isolamento RLS por organização, com `USING` e `WITH CHECK`, e testes cruzados entre duas organizações.
2. `memberships`: `owner` gerencia equipe e credenciais; `admin` gerencia campanhas/produtos; `agent` atende e lê dados necessários, sem exportar lista inteira de clientes, mudar papéis ou acessar segredos. Aplicar permissões também a operações de escrita; simples `is_member()` **não é suficiente**.
3. Funções `SECURITY DEFINER` estritamente necessárias, `search_path` fixo e privilégio `EXECUTE` explícito; evitar recursão na própria RLS de memberships. Views agregadas com `security_invoker` quando suportado e testes de isolamento.
4. Credenciais de terceiros apenas em ambiente/cofre do servidor; nunca `NEXT_PUBLIC_`, banco acessível ao cliente ou commits. Não solicitar chaves secretas pelo chat.
5. URLs de afiliado: validar HTTPS, hostname permitido, destinos e redirecionamentos; não permitir URL arbitrária enviada por visitante. No registro de click-out, não aceitar parâmetros que sobrescrevam o link aprovado.
6. Proteger formulários de abuso, limites de taxa para chat e endpoints; impedir prompt injection: entrada do usuário nunca altera regras de comissão, URL ou preços. Dados de catálogo verificados; validação estruturada e fallback humano.
7. LGPD: finalidade, transparência, retenção e exclusão por política aplicável; consentimento quando necessário para marketing; bloqueio de follow-up sem autorização adequada. Não prometer apagar eventos financeiros legalmente retidos sem avaliar obrigações.
8. Não usar avaliações, garantias, preço ou imagens do produtor sem confirmar licença/regras e atualização. Exibir claramente a condição de afiliado no material aplicável.

## 7. Regras do vendedor e etapas

- `rules` faz triagem por perguntas/intenções configuradas, apresenta no máximo 1–3 produtos ativos, usa exclusivamente `product_claims` verificados e o preço de referência com data, avisando que a oferta final está no checkout.
- Sempre permitir atendimento humano e deixar claro que é atendimento automatizado.
- Não prometer renda, resultado pessoal, vagas escassas, prazo promocional, reembolso, bônus ou desconto sem fonte válida e atualizada.
- Não inventar nem reescrever links; o CTA usa o `affiliate_url` cadastrado e validado.
- Máquina de estados do lead: `novo` → `conversando` → `interessado` → `encaminhado_checkout` → `conversao_verificada` ou `sem_conversao_conhecida`. Atribuição pode ser incerta e conversão sem lead identificado é possível.
- Transferência humana para dúvida não respondida, solicitação explícita, conflito de informação ou validação reprovada.
- Logs de ferramentas e respostas para auditoria, com minimização de dados pessoais.

## 8. Telas (primeiro release)

| Rota | Responsabilidade |
|---|---|
| `/entrar` | Supabase Auth, autenticação segura |
| `/painel` | clique, leads, outbound, comissão informada/confirmada/recebida, gastos e estimativas corretamente rotuladas |
| `/produtos` | cadastrar um infoproduto, aprovação, link, restrições, claims e fontes |
| `/campanhas` | UTMs, criativos, orçamento autorizado, despesas registradas, métricas com procedência |
| `/vendedor` | simulador com perguntas prontas, resposta, claims consultadas e logs do validador |
| `/conversas` | histórico autorizado e assumir atendimento |
| `/comissoes` | importação manual/CSV, conciliação, deduplicação, ajustes e origem da comprovação |
| `/configuracoes` | empresa, marca, mensagens, limites de custo, privacidade e provedores |
| `/oferta/[slug]` | página pública objetiva, aviso de afiliação, benefícios verificados e CTA externo |
| `/go/[id]` | redirecionamento server-side com validação e registro de click-out; evitar redirecionador aberto |

**Estado vazio:** telas novas exibem passos de configuração, nunca vendas fictícias. Seed de demonstração isolado de produção e marcado como demonstração.

## 9. Estrutura de pastas sugerida

```text
vendora-ai/
  ARQUITETURA.md
  IDENTIDADE.md
  package.json
  .env.example
  supabase/migrations/
  src/app/(auth)/entrar/
  src/app/(app)/painel/
  src/app/(app)/produtos/
  src/app/(app)/campanhas/
  src/app/(app)/vendedor/
  src/app/(app)/conversas/
  src/app/(app)/comissoes/
  src/app/(app)/configuracoes/
  src/app/oferta/[slug]/
  src/app/go/[id]/
  src/server/dal/
  src/server/affiliate/
  src/server/seller/{engine,tools,guardrails,providers}/
  src/server/imports/
  src/lib/{money,validation}/
  src/components/
  tests/
```

Se o app novo já estiver em `vendeai/` e houver código, **não criar uma segunda aplicação por acidente**: executar inventário, escolher migração única da pasta com `git mv`, ajustar Vercel Root Directory e imports/paths de modo transacional. Até confirmar o estado real, a estrutura acima é alvo, não uma migração realizada.

## 10. Orçamento e operação

**Teto: R$ 300 para o experimento inteiro, sem promessa de retorno.** Proposta inicial, ajustável antes de cada gasto: R$ 220 para teste de mídia, R$ 40 para eventuais serviços/API e R$ 40 de reserva. Não há obrigação de usar todo o orçamento. Mídia só após aprovar afiliação, direito de divulgação e página/CTA testados. Começar com anúncios pequenos e interromper ao atingir limite; sem recarga ou aumento automático.

O uso real de hospedagem, domínio, IA, API de WhatsApp e preços das plataformas precisa ser confirmado antes de contratar. MVP sem WhatsApp API e sem IA paga é viável para testar o fluxo técnico, **não garante desempenho de vendas**.

## 11. Sequência de implementação e portões de qualidade

| Etapa | Entrega | Aceite |
|---|---|---|
| 0 | Inventário do repo/branch e renomeação segura; atualizar documentos | Seu Estilo preservado; builds base registrados; sem referências visuais antigas no novo app |
| 1 | App independente, identidade, auth e shell | login e navegação responsivos; build passa |
| 2 | Migrations, RLS e roles | migrations do zero, duas organizações isoladas, agente sem poderes de dono |
| 3 | Cadastro de um produto afiliado e claims | URL HTTPS válida, status de afiliação exigido; links não autorizados bloqueados |
| 4 | Página pública + UTMs + `/go` | click-out rastreado com redirecionamento seguro; nenhuma venda inventada |
| 5 | Motor por regras + simulador + handoff | respostas só de fontes verificadas; injection e preço falso reprovados |
| 6 | Campanhas + despesas + painel inicial | números conferem com eventos e gastos registrados |
| 7 | Importação e conciliação de comissão | CSV não duplica, reembolso reverte e distingue estados |
| 8 | Teste ponta a ponta + deploy isolado | Seu Estilo continua funcionando, Vendora AI no deploy correto, orçamento controlado |

Executar build, lint e testes aplicáveis a cada etapa. Validar rotas públicas e fluxos sensíveis manualmente. Não afirmar que as migrations foram aplicadas, APIs integradas ou anúncios publicados sem evidência real. Preservar checkpoints/commits reversíveis.

## 12. Critérios de sucesso do experimento

- Um produto com afiliação confirmada e regras de tráfego documentadas.
- Página funcional, CTA rastreável e logs sem dados sensíveis.
- Ao menos uma conciliação de comissão **real**, caso venda ocorra; ausência de vendas não é erro de software.
- Métricas separando visitantes, conversas, cliques, transações informadas, comissão confirmada, comissão recebida e reembolso.
- Orçamento total nunca ultrapassa R$ 300 sem nova autorização.
- Nenhuma modificação regressiva no Seu Estilo.

## 13. Pendências que não podem ser presumidas

- Produto específico, preço, comissão e status de aprovação: **a verificar na conta de afiliado**.
- Direitos de uso das peças do produtor e permissões de anúncios: **a verificar**.
- Integração oficial de comissões e acesso a webhook/API por plataforma: **a verificar**; CSV/manual como fallback.
- Disponibilidade de domínio e marca Vendora AI: **a verificar**.
- Projeto Supabase, credenciais, limites de serviços e contas de mídia: **a configurar em ambiente seguro**.
- Estado atual do código da pasta `vendeai/`: **inspecionar antes de renomear ou implementar**.

**Instrução para o Claude:** leia este arquivo e `IDENTIDADE.md`, faça inventário e apresente plano de alterações mínimo. Depois implemente etapa por etapa, sem reverter a escolha Vendora AI e sem retornar ao modelo de estoque/Pix próprio no MVP.
