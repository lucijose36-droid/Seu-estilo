-- ===========================================================================
-- 0002 — Organizacoes, membros e funcoes de autorizacao
-- ===========================================================================

create table organizations (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null check (length(btrim(nome)) between 1 and 120),
  timezone   text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at
  before update on organizations
  for each row execute function app.tocar_updated_at();

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       papel_membro not null default 'agent',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_user_idx on memberships (user_id);
create index memberships_org_idx on memberships (org_id);

-- ---------------------------------------------------------------------------
-- Funcoes de autorizacao
--
-- SECURITY DEFINER aqui nao e descuido: a policy de `memberships` precisa
-- consultar `memberships`, e sem quebrar esse ciclo o Postgres entra em
-- recursao infinita de RLS. A funcao roda como dona da tabela, que nao esta
-- sujeita a RLS, e assim serve de ponto fixo.
--
-- `set search_path` e obrigatorio em funcao SECURITY DEFINER: sem ele, quem
-- puder criar um schema no caminho de busca sequestra a resolucao de nomes e
-- executa codigo proprio com os privilegios da funcao.
-- ---------------------------------------------------------------------------

create or replace function app.papel_na_org(p_org uuid)
returns papel_membro
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select m.role
  from public.memberships m
  where m.org_id = p_org
    and m.user_id = auth.uid()
  limit 1
$$;

create or replace function app.forca_papel(p papel_membro)
returns integer
language sql
immutable
as $$
  select case p
    when 'owner' then 3
    when 'admin' then 2
    when 'agent' then 1
    else 0
  end
$$;

create or replace function app.eh_membro(p_org uuid)
returns boolean
language sql
stable
as $$
  select app.papel_na_org(p_org) is not null
$$;

-- Porta unica de autorizacao por papel. `app.eh_membro()` sozinho nao basta:
-- com ele, um `agent` teria exatamente os mesmos poderes de escrita que o
-- dono da organizacao.
create or replace function app.tem_papel(p_org uuid, p_min papel_membro)
returns boolean
language sql
stable
as $$
  select coalesce(app.forca_papel(app.papel_na_org(p_org)), 0)
       >= app.forca_papel(p_min)
$$;

revoke all on function app.papel_na_org(uuid) from public;
revoke all on function app.forca_papel(papel_membro) from public;
revoke all on function app.eh_membro(uuid) from public;
revoke all on function app.tem_papel(uuid, papel_membro) from public;

grant execute on function app.papel_na_org(uuid) to authenticated, service_role;
grant execute on function app.forca_papel(papel_membro) to authenticated, service_role;
grant execute on function app.eh_membro(uuid) to authenticated, service_role;
grant execute on function app.tem_papel(uuid, papel_membro) to authenticated, service_role;
