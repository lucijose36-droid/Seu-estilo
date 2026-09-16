-- ===========================================================================
-- 0005 — Conversas, mensagens e cliques de saida
-- ===========================================================================

create table conversations (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations(id) on delete cascade,
  lead_id            uuid references leads(id) on delete set null,
  product_id         uuid references affiliate_products(id) on delete set null,
  anonymous_session_id text not null check (length(anonymous_session_id) between 8 and 64),
  status             status_conversa not null default 'ativa',
  assumida_por       uuid references auth.users(id) on delete set null,
  assumida_at        timestamptz,
  iniciada_at        timestamptz not null default now(),
  ultima_mensagem_at timestamptz,

  constraint assumida_exige_quem_e_quando
    check (
      (status <> 'assumida_humano')
      or (assumida_por is not null and assumida_at is not null)
    )
);

create index conversations_org_idx on conversations (org_id, iniciada_at desc);
create index conversations_espera_idx on conversations (org_id, status);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  autoria         autoria_mensagem not null,
  conteudo        text not null,
  -- Quais claims embasaram a resposta e o veredito do validador. E o que
  -- permite auditar depois por que o atendente disse o que disse.
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index messages_conversa_idx on messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Cliques de saida.
--
-- Um clique registra INTENCAO, jamais compra. `destino_aprovado` guarda a URL
-- efetivamente usada no momento do clique: se o link do produto mudar amanha,
-- ainda da para saber para onde a pessoa foi de fato enviada.
-- ---------------------------------------------------------------------------
create table outbound_clicks (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations(id) on delete cascade,
  product_id       uuid not null references affiliate_products(id) on delete cascade,
  campaign_id      uuid references campaigns(id) on delete set null,
  lead_id          uuid references leads(id) on delete set null,
  conversation_id  uuid references conversations(id) on delete set null,
  tracking_id      text not null check (length(tracking_id) between 8 and 64),
  destino_aprovado text not null,
  anonymous_session_id text not null default '',
  occurred_at      timestamptz not null default now(),

  unique (org_id, tracking_id),

  constraint clique_destino_https
    check (app.url_https_valida(destino_aprovado))
);

create index outbound_clicks_org_data_idx on outbound_clicks (org_id, occurred_at desc);
create index outbound_clicks_produto_idx on outbound_clicks (product_id);
