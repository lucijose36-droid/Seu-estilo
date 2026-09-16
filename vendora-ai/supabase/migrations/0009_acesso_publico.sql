-- ===========================================================================
-- 0009 — Acesso publico: pagina de oferta e clique de saida
-- ===========================================================================
-- O visitante da pagina publica NAO tem sessao nem vinculo com organizacao
-- nenhuma, entao a RLS (corretamente) nao lhe mostra nada e nao lhe deixa
-- gravar nada.
--
-- A alternativa preguicosa seria usar a service role nessas rotas. Seria
-- pessimo: a service role ignora RLS por completo, e um bug em uma rota
-- publica passaria a expor o banco inteiro.
--
-- Em vez disso, expomos tres funcoes SECURITY DEFINER com superficie minima.
-- Cada uma faz UMA coisa, so enxerga produto ativo e nunca devolve campo
-- interno. Mesmo com a chave anon em maos, o que se alcanca por aqui e
-- exatamente o que uma pagina de oferta precisa.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Namespace global de slug.
--
-- `unique (org_id, slug)` basta para o painel, mas a pagina publica vive em
-- /oferta/<slug> num dominio compartilhado: sem unicidade global, duas
-- organizacoes com o mesmo slug tornariam o endereco ambiguo, e a funcao
-- abaixo teria de escolher uma delas — o que e pior do que recusar o cadastro.
--
-- Custo assumido: um slug usado por uma organizacao fica indisponivel para as
-- outras. E o mesmo modelo de qualquer plataforma com pagina publica em
-- dominio unico, e deixa de ser necessario quando houver dominio proprio por
-- organizacao.
-- ---------------------------------------------------------------------------
create unique index affiliate_products_slug_global_idx
  on affiliate_products (slug);

-- ---------------------------------------------------------------------------
create or replace function public.obter_oferta_publica(p_slug text)
returns table (
  id                        uuid,
  titulo                    text,
  slug                      text,
  plataforma                text,
  descricao_verificada      text,
  publico_alvo              text,
  preco_referencia_centavos integer,
  preco_referencia_em       date,
  moeda                     char(3)
)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  -- Note o que NAO esta na lista de colunas: comissao estimada, regras de
  -- divulgacao, fonte de verificacao e a propria affiliate_url. O visitante
  -- recebe o que precisa para decidir, e nada do que e interno.
  select p.id, p.titulo, p.slug, p.plataforma, p.descricao_verificada,
         p.publico_alvo, p.preco_referencia_centavos, p.preco_referencia_em,
         p.moeda
  from public.affiliate_products p
  where p.slug = p_slug
    and p.ativo = true
  limit 1
$$;

create or replace function public.listar_claims_publicas(p_product_id uuid)
returns table (
  id        uuid,
  afirmacao text,
  tipo      tipo_claim
)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  -- Somente afirmacoes ativas, que por CHECK so existem com fonte e data de
  -- verificacao. A fonte em si nao vai para a pagina (e nota interna), mas a
  -- existencia dela e pre-requisito para a afirmacao aparecer.
  select c.id, c.afirmacao, c.tipo
  from public.product_claims c
  join public.affiliate_products p on p.id = c.product_id
  where c.product_id = p_product_id
    and c.ativo = true
    and p.ativo = true
  order by c.created_at
$$;

create or replace function public.registrar_visita(
  p_product_id uuid,
  p_sid        text,
  p_utm_source text default '',
  p_utm_medium text default '',
  p_utm_campaign text default '',
  p_utm_content text default '',
  p_utm_term   text default ''
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_org uuid;
  v_campaign uuid;
begin
  select org_id into v_org
  from public.affiliate_products
  where id = p_product_id and ativo = true;

  if v_org is null then
    return; -- produto inexistente ou inativo: nao registra, nao vaza qual dos dois
  end if;

  -- Amarra a visita a campanha pelo utm_campaign da propria organizacao.
  select id into v_campaign
  from public.campaigns
  where org_id = v_org
    and utm_campaign = p_utm_campaign
    and p_utm_campaign <> ''
  limit 1;

  insert into public.visits
    (org_id, product_id, campaign_id, anonymous_session_id,
     utm_source, utm_medium, utm_campaign, utm_content, utm_term)
  values
    (v_org, p_product_id, v_campaign, p_sid,
     left(p_utm_source, 200), left(p_utm_medium, 200), left(p_utm_campaign, 200),
     left(p_utm_content, 200), left(p_utm_term, 200));
end;
$$;

-- ---------------------------------------------------------------------------
-- Clique de saida.
--
-- Devolve a URL GRAVADA no produto. Nenhum parametro da requisicao participa
-- da escolha do destino: e o que impede /go de virar redirecionador aberto.
-- A aplicacao ainda revalida a URL contra a lista de dominios antes de
-- emitir o redirecionamento, porque o CHECK do banco garante https bem
-- formada mas nao o hostname.
-- ---------------------------------------------------------------------------
create or replace function public.registrar_clique_saida(
  p_product_id  uuid,
  p_sid         text,
  p_tracking_id text,
  p_utm_campaign text default ''
)
returns table (destino text, plataforma text)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_org uuid;
  v_url text;
  v_plataforma text;
  v_campaign uuid;
begin
  select p.org_id, p.affiliate_url, p.plataforma
    into v_org, v_url, v_plataforma
  from public.affiliate_products p
  where p.id = p_product_id and p.ativo = true;

  if v_org is null then
    return; -- nenhuma linha: produto inexistente ou inativo
  end if;

  select c.id into v_campaign
  from public.campaigns c
  where c.org_id = v_org
    and c.utm_campaign = p_utm_campaign
    and p_utm_campaign <> ''
  limit 1;

  insert into public.outbound_clicks
    (org_id, product_id, campaign_id, tracking_id, destino_aprovado,
     anonymous_session_id)
  values
    (v_org, p_product_id, v_campaign, p_tracking_id, v_url, coalesce(p_sid, ''))
  on conflict (org_id, tracking_id) do nothing;

  -- Devolve tambem a plataforma para que a aplicacao revalide a URL contra a
  -- lista de dominios DAQUELA plataforma, e nao contra "qualquer plataforma
  -- conhecida" — que aceitaria um link da Kiwify num produto marcado como
  -- Hotmart.
  destino := v_url;
  plataforma := v_plataforma;
  return next;
end;
$$;

-- Permissoes: anon so alcanca estas quatro funcoes, nada mais.
revoke all on function public.obter_oferta_publica(text) from public;
revoke all on function public.listar_claims_publicas(uuid) from public;
revoke all on function public.registrar_visita(uuid, text, text, text, text, text, text) from public;
revoke all on function public.registrar_clique_saida(uuid, text, text, text) from public;

grant execute on function public.obter_oferta_publica(text) to anon, authenticated;
grant execute on function public.listar_claims_publicas(uuid) to anon, authenticated;
grant execute on function public.registrar_visita(uuid, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.registrar_clique_saida(uuid, text, text, text) to anon, authenticated;
