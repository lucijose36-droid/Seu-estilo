-- ===========================================================================
-- 0004 — Campanhas, visitas e leads
-- ===========================================================================

create table campaigns (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid not null references organizations(id) on delete cascade,
  nome                     text not null check (length(btrim(nome)) between 1 and 120),
  canal                    canal_campanha not null default 'organico',
  utm_source               text not null default '',
  utm_medium               text not null default '',
  utm_campaign             text not null default '',
  utm_content              text not null default '',
  utm_term                 text not null default '',
  -- Teto autorizado. O sistema NAO gasta nada sozinho: o valor existe para
  -- comparar com o que foi lancado e avisar, nunca para liberar verba.
  orcamento_limite_centavos integer not null default 0
    check (orcamento_limite_centavos >= 0),
  status                   status_campanha not null default 'rascunho',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index campaigns_org_idx on campaigns (org_id);

create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function app.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Visitas.
--
-- Guardamos um identificador de sessao anonimo, nao a pessoa. Sem IP, sem
-- user agent bruto, sem fingerprint: a metrica que o produto precisa e
-- "quantos visitantes", e coletar mais do que isso seria dado pessoal sem
-- finalidade.
-- ---------------------------------------------------------------------------
create table visits (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references organizations(id) on delete cascade,
  product_id           uuid references affiliate_products(id) on delete set null,
  campaign_id          uuid references campaigns(id) on delete set null,
  anonymous_session_id text not null check (length(anonymous_session_id) between 8 and 64),
  utm_source           text not null default '',
  utm_medium           text not null default '',
  utm_campaign         text not null default '',
  utm_content          text not null default '',
  utm_term             text not null default '',
  occurred_at          timestamptz not null default now()
);

create index visits_org_data_idx on visits (org_id, occurred_at desc);
create index visits_campanha_idx on visits (campaign_id);

create table leads (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  nome                  text,
  contato               text,
  origem                text not null default '',
  campaign_id           uuid references campaigns(id) on delete set null,
  etapa                 etapa_lead not null default 'novo',
  -- Consentimento e finalidade caminham juntos: guardar "aceitou" sem dizer
  -- para que nao cumpre a LGPD nem permite honrar a promessa depois.
  consentimento_contato boolean not null default false,
  consentimento_finalidade text not null default '',
  consentimento_at      timestamptz,
  ultima_interacao_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Visitante anonimo e um lead legitimo: nao se exige contato para existir.
  -- Mas marcar consentimento sem registrar finalidade e data, nao.
  constraint consentimento_exige_finalidade_e_data
    check (
      not consentimento_contato
      or (length(btrim(consentimento_finalidade)) > 0 and consentimento_at is not null)
    )
);

create index leads_org_etapa_idx on leads (org_id, etapa);
create index leads_org_criado_idx on leads (org_id, created_at desc);

create trigger leads_updated_at
  before update on leads
  for each row execute function app.tocar_updated_at();
