-- ===========================================================================
-- 0006 — Comissoes, eventos, despesas, importacao e auditoria
-- ===========================================================================

-- Lotes de importacao. A impressao digital do arquivo torna a importacao
-- idempotente: reenviar o mesmo relatorio nao duplica comissao.
create table import_batches (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references organizations(id) on delete cascade,
  plataforma          text not null check (length(btrim(plataforma)) between 1 and 60),
  arquivo_nome        text not null default '',
  arquivo_fingerprint text not null check (length(arquivo_fingerprint) between 8 and 128),
  status              status_importacao not null default 'recebido',
  linhas_lidas        integer not null default 0 check (linhas_lidas >= 0),
  linhas_importadas   integer not null default 0 check (linhas_importadas >= 0),
  linhas_ignoradas    integer not null default 0 check (linhas_ignoradas >= 0),
  erro                text,
  importado_at        timestamptz not null default now(),
  criado_por          uuid references auth.users(id) on delete set null,

  unique (org_id, plataforma, arquivo_fingerprint)
);

create index import_batches_org_idx on import_batches (org_id, importado_at desc);

-- ---------------------------------------------------------------------------
-- Comissoes.
--
-- A fronteira de confianca do produto mora nesta tabela. `status` distingue
-- o que foi apenas RELATADO do que a plataforma CONFIRMOU e do que foi de
-- fato RECEBIDO. Nunca inferir comissao a partir de navegacao de retorno ou
-- de mensagem do visitante.
-- ---------------------------------------------------------------------------
create table commission_records (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references organizations(id) on delete cascade,
  product_id              uuid references affiliate_products(id) on delete set null,
  campaign_id             uuid references campaigns(id) on delete set null,
  plataforma              text not null check (length(btrim(plataforma)) between 1 and 60),
  external_transaction_id text,
  valor_centavos          integer not null check (valor_centavos >= 0),
  moeda                   char(3) not null default 'BRL',
  status                  status_comissao not null default 'reported',
  source_type             origem_comissao not null,
  source_reference        text not null default '',
  import_batch_id         uuid references import_batches(id) on delete set null,
  data_evento             date not null,
  confirmado_at           timestamptz,
  recebido_at             timestamptz,
  observacao              text not null default '',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Estado so avanca com a prova correspondente registrada. Sem isto,
  -- "confirmada" viraria um clique de botao sem lastro nenhum.
  constraint confirmada_exige_data_de_confirmacao
    check (status <> 'confirmed' or confirmado_at is not null),
  constraint recebida_exige_ambas_as_datas
    check (status <> 'received' or (confirmado_at is not null and recebido_at is not null))
);

-- Deduplicacao por plataforma + identificador da transacao, quando existe.
-- Relatorio sem identificador entra mesmo assim, mas exige conciliacao
-- manual — por isso o indice e parcial e nao uma constraint cega.
create unique index commission_dedup_idx
  on commission_records (org_id, plataforma, external_transaction_id)
  where external_transaction_id is not null;

create index commission_org_status_idx on commission_records (org_id, status);
create index commission_org_data_idx on commission_records (org_id, data_evento desc);

create trigger commission_records_updated_at
  before update on commission_records
  for each row execute function app.tocar_updated_at();

-- Historico imutavel por comissao. Um reembolso nao apaga a confirmacao
-- anterior: acrescenta um evento. Sem isso nao ha como auditar o que foi
-- dito ao usuario no passado.
create table commission_events (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  commission_id uuid not null references commission_records(id) on delete cascade,
  tipo          tipo_evento_comissao not null,
  valor_centavos integer check (valor_centavos >= 0),
  referencia    text not null default '',
  criado_por    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index commission_events_comissao_idx on commission_events (commission_id, created_at);

create table expense_records (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  campaign_id   uuid references campaigns(id) on delete set null,
  categoria     categoria_despesa not null default 'anuncios',
  descricao     text not null default '',
  valor_centavos integer not null check (valor_centavos >= 0),
  moeda         char(3) not null default 'BRL',
  ocorrido_em   date not null,
  pago          boolean not null default true,
  comprovante_ref text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index expense_org_data_idx on expense_records (org_id, ocorrido_em desc);
create index expense_campanha_idx on expense_records (campaign_id);

create trigger expense_records_updated_at
  before update on expense_records
  for each row execute function app.tocar_updated_at();

-- Auditoria do atendente. Registra custo e validacao, nunca segredo:
-- nenhuma chave de API, nenhum token, nenhum dado pessoal do visitante.
create table ai_runs (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  conversation_id       uuid references conversations(id) on delete set null,
  provider              text not null default 'rules',
  model                 text,
  tokens_entrada        integer not null default 0 check (tokens_entrada >= 0),
  tokens_saida          integer not null default 0 check (tokens_saida >= 0),
  custo_estimado_centavos integer not null default 0 check (custo_estimado_centavos >= 0),
  latencia_ms           integer not null default 0 check (latencia_ms >= 0),
  ferramentas           jsonb not null default '[]'::jsonb,
  validacao_ok          boolean not null default true,
  validacao_motivo      text not null default '',
  created_at            timestamptz not null default now()
);

create index ai_runs_org_data_idx on ai_runs (org_id, created_at desc);
