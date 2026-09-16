-- ===========================================================================
-- 0003 — Catalogo editorial de infoprodutos de afiliado
-- ===========================================================================

create table affiliate_products (
  id                        uuid primary key default gen_random_uuid(),
  org_id                    uuid not null references organizations(id) on delete cascade,
  titulo                    text not null check (length(btrim(titulo)) between 1 and 160),
  slug                      text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  plataforma                text not null check (length(btrim(plataforma)) between 1 and 60),
  produto_external_id       text,
  descricao_verificada      text not null default '',
  publico_alvo              text not null default '',
  preco_referencia_centavos integer check (preco_referencia_centavos >= 0),
  preco_referencia_em       date,
  comissao_estimada_centavos integer check (comissao_estimada_centavos >= 0),
  moeda                     char(3) not null default 'BRL',
  affiliate_url             text not null,
  status_aprovacao          status_aprovacao not null default 'nao_solicitado',
  regras_divulgacao         text not null default '',
  fonte_verificacao         text not null default '',
  verificado_at             timestamptz,
  ativo                     boolean not null default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  unique (org_id, slug),

  -- A URL de afiliado precisa ser https bem formada, sempre.
  constraint produto_url_https
    check (app.url_https_valida(affiliate_url)),

  -- ESTA e a regra central do produto, gravada no banco em vez de ficar so
  -- na tela: nao existe produto ativo sem afiliacao aprovada e verificacao
  -- registrada. Um POST direto na API tambem esbarra aqui.
  constraint produto_ativo_exige_afiliacao_verificada
    check (
      not ativo
      or (status_aprovacao = 'aprovado'
          and verificado_at is not null
          and length(btrim(fonte_verificacao)) > 0)
    ),

  -- Preco de referencia sem data e desinformacao: preco de infoproduto muda,
  -- e citar valor sem dizer de quando nao permite ao visitante julgar.
  constraint preco_referencia_exige_data
    check (preco_referencia_centavos is null or preco_referencia_em is not null)
);

create index affiliate_products_org_idx on affiliate_products (org_id);
create index affiliate_products_ativo_idx on affiliate_products (org_id, ativo);

create trigger affiliate_products_updated_at
  before update on affiliate_products
  for each row execute function app.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Afirmacoes citaveis.
--
-- O atendente automatizado NAO pode dizer nada sobre o produto que nao esteja
-- aqui, com fonte e data de verificacao. E o que impede "garantia de 30 dias"
-- ou "bonus exclusivo" de nascer de um modelo de linguagem.
-- ---------------------------------------------------------------------------
create table product_claims (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  product_id    uuid not null references affiliate_products(id) on delete cascade,
  afirmacao     text not null check (length(btrim(afirmacao)) between 1 and 400),
  tipo          tipo_claim not null default 'conteudo',
  fonte         text not null default '',
  verificado_at timestamptz,
  ativo         boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Mesma logica do produto: so e citavel o que tem procedencia registrada.
  constraint claim_ativo_exige_fonte
    check (
      not ativo
      or (length(btrim(fonte)) > 0 and verificado_at is not null)
    )
);

create index product_claims_produto_idx on product_claims (product_id);
create index product_claims_citavel_idx on product_claims (product_id, ativo);

create trigger product_claims_updated_at
  before update on product_claims
  for each row execute function app.tocar_updated_at();
