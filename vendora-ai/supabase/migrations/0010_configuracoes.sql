-- ===========================================================================
-- 0010 — Configuracoes da organizacao e do atendente
-- ===========================================================================

create table org_settings (
  org_id                uuid primary key references organizations(id) on delete cascade,

  -- Identidade usada nas mensagens ao visitante.
  empresa_nome          text not null default '',
  atendente_nome        text not null default 'Assistente',

  -- Mensagens. Sao a UNICA origem de texto fixo que o atendente pode emitir.
  msg_boas_vindas       text not null default
    'Olá! Sou um assistente automatizado. Posso tirar dúvidas sobre o material e, se fizer sentido para você, te levar até a página oficial.',
  msg_fora_horario      text not null default
    'No momento estamos fora do horário de atendimento humano, mas posso responder o que já está verificado por aqui.',
  msg_transferir_humano text not null default
    'Essa eu não consigo responder com segurança. Vou encaminhar para uma pessoa da equipe.',
  msg_sem_resposta      text not null default
    'Não tenho essa informação confirmada. Prefiro não chutar: posso encaminhar para uma pessoa da equipe.',

  horario_atendimento   jsonb not null default '{}'::jsonb,

  -- Provedor de IA. Comeca em 'rules' e o teto de gasto comeca em ZERO: nenhum
  -- provedor pago e acionado sem decisao explicita registrada aqui.
  vendedor_provider     text not null default 'rules'
    check (vendedor_provider in ('rules', 'anthropic', 'openai')),
  teto_gasto_ia_centavos integer not null default 0
    check (teto_gasto_ia_centavos >= 0),

  -- Privacidade.
  retencao_conversas_dias integer not null default 180
    check (retencao_conversas_dias between 1 and 3650),

  updated_at            timestamptz not null default now(),

  -- Provedor pago sem teto definido seria gasto sem limite. O banco recusa.
  constraint provedor_pago_exige_teto
    check (vendedor_provider = 'rules' or teto_gasto_ia_centavos > 0)
);

create trigger org_settings_updated_at
  before update on org_settings
  for each row execute function app.tocar_updated_at();

alter table org_settings enable row level security;
grant select, insert, update on org_settings to authenticated;

create policy org_settings_select on org_settings
  for select to authenticated
  using (app.eh_membro(org_id));

create policy org_settings_insert on org_settings
  for insert to authenticated
  with check (app.tem_papel(org_id, 'admin'));

create policy org_settings_update on org_settings
  for update to authenticated
  using (app.tem_papel(org_id, 'admin'))
  with check (app.tem_papel(org_id, 'admin'));

-- Toda organizacao nasce com configuracao padrao, para nao existir estado
-- "organizacao sem settings" que cada tela precise tratar.
create or replace function app.criar_settings_padrao()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.org_settings (org_id) values (new.id)
  on conflict (org_id) do nothing;
  return new;
end;
$$;

create trigger organizations_settings_padrao
  after insert on organizations
  for each row execute function app.criar_settings_padrao();
