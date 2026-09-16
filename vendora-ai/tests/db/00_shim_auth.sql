-- ===========================================================================
-- Arranjo APENAS para teste local. NAO e migration e nao vai para producao.
-- ===========================================================================
-- O Supabase ja fornece o schema `auth`, a tabela `auth.users` e a funcao
-- `auth.uid()`. Em um Postgres limpo eles nao existem, entao reproduzimos o
-- minimo necessario para as migrations rodarem e para conseguirmos trocar de
-- usuario durante os testes.
--
-- `auth.uid()` real le a claim `sub` do JWT. Aqui lemos um parametro de
-- sessao equivalente, que o teste define com set_config().
-- ===========================================================================

-- O Supabase tambem ja fornece estes papeis. O shim os cria porque ele
-- representa "o que o Supabase oferece antes da primeira migration rodar".
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;
