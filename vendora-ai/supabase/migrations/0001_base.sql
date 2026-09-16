-- ===========================================================================
-- 0001 — Extensoes, papeis, esquema auxiliar e enums
-- ===========================================================================
-- Convencoes deste banco:
--   * Todo valor monetario e INTEGER de centavos. Nunca float, nunca numeric
--     convertido em JSON: erro de centavo em relatorio de comissao destroi a
--     confianca no numero inteiro.
--   * Toda tabela de negocio tem org_id e RLS.
--   * Regra que o produto promete e CHECK no banco sempre que possivel. Uma
--     validacao de formulario pode ser contornada por POST direto; um CHECK
--     nao.
-- ===========================================================================

create extension if not exists pgcrypto;

-- Os papeis abaixo ja existem no Supabase. O bloco existe para as migrations
-- rodarem tambem em um Postgres limpo (teste local, CI), sem duplicar nada.
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

-- Esquema para funcoes internas de autorizacao. Separado de `public` para
-- nao ser exposto pela API REST do Supabase.
create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- --------------------------------------------------------------------- enums
create type papel_membro as enum ('owner', 'admin', 'agent');

create type status_aprovacao as enum
  ('nao_solicitado', 'pendente', 'aprovado', 'recusado');

create type tipo_claim as enum
  ('conteudo', 'garantia', 'preco', 'suporte', 'bonus', 'requisito', 'outro');

create type canal_campanha as enum
  ('organico', 'meta_ads', 'google_ads', 'tiktok_ads', 'email', 'outro');

create type status_campanha as enum ('rascunho', 'ativa', 'pausada', 'encerrada');

-- Maquina de estados do lead. "sem_conversao_conhecida" existe de proposito:
-- atribuicao pode ser incerta, e nao saber e um estado legitimo — diferente
-- de afirmar que nao houve conversao.
create type etapa_lead as enum (
  'novo',
  'conversando',
  'interessado',
  'encaminhado_checkout',
  'conversao_verificada',
  'sem_conversao_conhecida'
);

create type status_conversa as enum
  ('ativa', 'aguardando_humano', 'assumida_humano', 'encerrada');

create type autoria_mensagem as enum
  ('visitante', 'assistente', 'humano', 'sistema');

-- Estados da comissao. A distancia entre "reported" e "received" e o coracao
-- da honestidade deste produto: informacao do usuario nao e confirmacao da
-- plataforma, e confirmacao nao e dinheiro na conta.
create type status_comissao as enum
  ('reported', 'confirmed', 'received', 'reversed', 'unknown');

create type origem_comissao as enum
  ('importacao_csv', 'registro_manual', 'integracao_oficial');

create type tipo_evento_comissao as enum
  ('criada', 'confirmada', 'recebida', 'revertida', 'ajustada', 'status_desconhecido');

create type categoria_despesa as enum
  ('anuncios', 'ferramenta', 'api', 'dominio', 'hospedagem', 'outro');

create type status_importacao as enum ('recebido', 'processado', 'falhou');

-- ------------------------------------------------------------- utilitarios
create or replace function app.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- URL de afiliado precisa ser https. http em claro permitiria interceptar e
-- trocar o destino de um clique que representa comissao.
create or replace function app.url_https_valida(p_url text)
returns boolean
language sql
immutable
as $$
  select p_url ~ '^https://[A-Za-z0-9._~%-]+(:[0-9]+)?(/[^[:space:]]*)?$'
$$;
