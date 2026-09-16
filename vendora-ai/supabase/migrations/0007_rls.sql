-- ===========================================================================
-- 0007 — Row Level Security
-- ===========================================================================
-- Duas regras valem em toda policy de escrita:
--
--   1. USING e WITH CHECK juntos. USING filtra o que a pessoa enxerga;
--      WITH CHECK valida a linha resultante. Com apenas USING, um membro
--      consegue INSERIR linha com org_id de outra organizacao — o dado sai
--      do alcance dele e passa a poluir a organizacao alheia.
--
--   2. Papel, nao so pertencimento. `app.eh_membro()` responde "faz parte";
--      `app.tem_papel()` responde "pode fazer isto". Escrita usa sempre a
--      segunda.
--
-- Nota sobre FORCE: nenhuma tabela usa `force row level security`. O dono da
-- tabela precisa continuar isento para que `app.papel_na_org()` (SECURITY
-- DEFINER) possa consultar `memberships` sem reentrar na propria policy.
-- ===========================================================================

grant usage on schema public to anon, authenticated, service_role;

-- --------------------------------------------------------------- organizations
alter table organizations enable row level security;

grant select, update on organizations to authenticated;

create policy organizations_select on organizations
  for select to authenticated
  using (app.eh_membro(id));

-- Renomear a organizacao ou trocar o fuso e decisao de dono.
create policy organizations_update on organizations
  for update to authenticated
  using (app.tem_papel(id, 'owner'))
  with check (app.tem_papel(id, 'owner'));

-- ----------------------------------------------------------------- memberships
alter table memberships enable row level security;

grant select, insert, update, delete on memberships to authenticated;

create policy memberships_select on memberships
  for select to authenticated
  using (app.eh_membro(org_id));

-- Gerenciar equipe e papeis e exclusivo do dono. Sem esta separacao, um
-- `agent` se promoveria a `owner` com um UPDATE e todo o resto cairia junto.
create policy memberships_insert on memberships
  for insert to authenticated
  with check (app.tem_papel(org_id, 'owner'));

create policy memberships_update on memberships
  for update to authenticated
  using (app.tem_papel(org_id, 'owner'))
  with check (app.tem_papel(org_id, 'owner'));

create policy memberships_delete on memberships
  for delete to authenticated
  using (app.tem_papel(org_id, 'owner'));

-- ---------------------------------------------------------------------------
-- Gerador de policies por papel, para as tabelas de negocio.
--
-- Escrever 13 blocos identicos a mao convida a erro de copia — e um WITH
-- CHECK esquecido em uma tabela e um vazamento entre organizacoes. O DO
-- abaixo aplica exatamente o mesmo padrao a cada tabela, com o papel minimo
-- declarado numa linha.
-- ---------------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select *
    from (values
      -- tabela,              ler,       escrever,  apagar
      ('affiliate_products',  'agent',   'admin',   'admin'),
      ('product_claims',      'agent',   'admin',   'admin'),
      ('campaigns',           'agent',   'admin',   'admin'),
      ('visits',              'agent',   'admin',   'owner'),
      ('leads',               'agent',   'agent',   'admin'),
      ('conversations',       'agent',   'agent',   'admin'),
      ('messages',            'agent',   'agent',   'owner'),
      ('outbound_clicks',     'agent',   'admin',   'owner'),
      ('commission_records',  'agent',   'admin',   'admin'),
      ('commission_events',   'agent',   'admin',   'owner'),
      ('expense_records',     'agent',   'admin',   'admin'),
      ('import_batches',      'agent',   'admin',   'admin'),
      ('ai_runs',             'admin',   'agent',   'owner')
    ) as v(tabela, ler, escrever, apagar)
  loop
    execute format('alter table public.%I enable row level security', t.tabela);
    execute format(
      'grant select, insert, update, delete on public.%I to authenticated',
      t.tabela);

    execute format($f$
      create policy %1$I on public.%2$I
        for select to authenticated
        using (app.tem_papel(org_id, %3$L))
    $f$, t.tabela || '_select', t.tabela, t.ler);

    execute format($f$
      create policy %1$I on public.%2$I
        for insert to authenticated
        with check (app.tem_papel(org_id, %3$L))
    $f$, t.tabela || '_insert', t.tabela, t.escrever);

    execute format($f$
      create policy %1$I on public.%2$I
        for update to authenticated
        using (app.tem_papel(org_id, %3$L))
        with check (app.tem_papel(org_id, %3$L))
    $f$, t.tabela || '_update', t.tabela, t.escrever);

    execute format($f$
      create policy %1$I on public.%2$I
        for delete to authenticated
        using (app.tem_papel(org_id, %3$L))
    $f$, t.tabela || '_delete', t.tabela, t.apagar);
  end loop;
end
$$;

-- O gerador acima nomeia a policy de SELECT usando o proprio nome da tabela
-- na posicao 1 e 2; conferimos abaixo que nenhuma tabela de negocio ficou
-- sem as quatro policies, para o caso de alguem editar a lista no futuro.
do $$
declare
  faltando text;
begin
  select string_agg(format('%s (%s policies)', tabela, total), ', ')
    into faltando
  from (
    select c.relname as tabela, count(p.polname) as total
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_policy p on p.polrelid = c.oid
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname not in ('organizations', 'memberships')
    group by c.relname
    having count(p.polname) <> 4
  ) as incompletas;

  if faltando is not null then
    raise exception 'Tabelas sem as 4 policies esperadas: %', faltando;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Limite que NAO esta nesta camada, para ficar registrado:
--
-- "agent nao exporta a lista inteira de clientes" nao e expressavel em RLS
-- sem tambem impedir o atendimento, que depende de ler o lead. A restricao
-- vive na DAL, na acao de exportacao, que exige papel admin. Fica dito aqui
-- para ninguem ler estas policies e concluir que o banco garante isso.
-- ---------------------------------------------------------------------------
