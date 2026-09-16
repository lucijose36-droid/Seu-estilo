-- ===========================================================================
-- 0008 — Criacao de organizacao no primeiro acesso
-- ===========================================================================

-- Cria organizacao e vinculo de dono na MESMA transacao.
--
-- Se fossem dois INSERTs separados vindos do app, uma falha entre eles
-- deixaria um usuario autenticado sem organizacao nenhuma — estado do qual a
-- interface nao sabe sair, porque toda a DAL resolve a org pela associacao.
--
-- SECURITY DEFINER porque a policy de `memberships` exige papel 'owner' para
-- inserir, e no instante da criacao o usuario ainda nao e dono de coisa
-- alguma. A funcao so escreve para `auth.uid()`, nunca para um id recebido
-- por parametro: nao ha como usa-la para se enfiar na organizacao de outro.
create or replace function public.criar_organizacao(p_nome text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_org  uuid;
begin
  if v_user is null then
    raise exception 'Sem usuario autenticado' using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_nome, ''))) = 0 then
    raise exception 'Nome da organizacao e obrigatorio' using errcode = '22023';
  end if;

  if exists (select 1 from public.memberships m where m.user_id = v_user) then
    raise exception 'Usuario ja pertence a uma organizacao'
      using errcode = '23505';
  end if;

  insert into public.organizations (nome)
  values (btrim(p_nome))
  returning id into v_org;

  insert into public.memberships (org_id, user_id, role)
  values (v_org, v_user, 'owner');

  return v_org;
end;
$$;

revoke all on function public.criar_organizacao(text) from public;
grant execute on function public.criar_organizacao(text) to authenticated;
