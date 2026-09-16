#!/usr/bin/env bash
# ===========================================================================
# Teste de isolamento multi-tenant e de papeis, executado contra Postgres real.
#
# Cada caso roda como o papel `authenticated`, com `request.jwt.claim.sub`
# apontando para um usuario — exatamente o que o Supabase faz ao traduzir o
# JWT. Nao ha mock de RLS aqui: o que reprova, reprova no banco.
# ===========================================================================
set -uo pipefail

BANCO="${1:-vendora_teste}"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# O teste recria o banco do zero a cada execucao. Sem isso ele so passaria na
# primeira rodada — e um teste que depende da propria historia nao prova nada.
"$AQUI/aplicar.sh" "$BANCO" >/dev/null

PASSOU=0
FALHOU=0

# Executa SQL como um usuario autenticado especifico.
como() {
  local sub="$1"; shift
  psql -v ON_ERROR_STOP=1 -q -t -A -d "$BANCO" \
    -c "select set_config('request.jwt.claim.sub', '$sub', false); set role authenticated; $*" 2>&1
}

# Executa como visitante anonimo: papel `anon`, sem claim de usuario. E
# exatamente o que o Supabase faz para quem chega com a chave publica.
como_anon() {
  psql -v ON_ERROR_STOP=1 -q -t -A -d "$BANCO" \
    -c "select set_config('request.jwt.claim.sub', '', false); set role anon; $*" 2>&1
}

espera_anon_valor() {
  local desc="$1" esperado="$2"; shift 2
  local saida
  saida=$(como_anon "$@" | tail -1)
  if [[ "$saida" == "$esperado" ]]; then
    ok "$desc"
  else
    falha "$desc" "esperado '$esperado', obtido '$saida'"
  fi
}

espera_anon_erro() {
  local desc="$1"; shift
  local saida
  saida=$(como_anon "$@")
  if [[ $? -ne 0 ]]; then
    ok "$desc"
  else
    falha "$desc" "o comando foi ACEITO, quando deveria ter sido barrado"
  fi
}

# Executa como superusuario (preparacao de cenario, fora do alcance da RLS).
admin_sql() {
  psql -v ON_ERROR_STOP=1 -q -t -A -d "$BANCO" -c "$*" 2>&1
}

ok() { PASSOU=$((PASSOU+1)); printf '  \033[32mPASSA\033[0m  %s\n' "$1"; }
falha() { FALHOU=$((FALHOU+1)); printf '  \033[31mFALHA\033[0m  %s\n     %s\n' "$1" "${2:-}"; }

# Espera que o SQL seja REJEITADO. Usado para provar que uma barreira existe.
espera_erro() {
  local desc="$1" sub="$2"; shift 2
  local saida
  saida=$(como "$sub" "$@")
  if [[ $? -ne 0 ]]; then
    ok "$desc"
  else
    falha "$desc" "o comando foi ACEITO, quando deveria ter sido barrado"
  fi
}

# Espera que o SQL seja aceito.
espera_ok() {
  local desc="$1" sub="$2"; shift 2
  local saida
  saida=$(como "$sub" "$@")
  if [[ $? -eq 0 ]]; then
    ok "$desc"
  else
    falha "$desc" "$saida"
  fi
}

# Espera que a consulta devolva exatamente um valor.
espera_valor() {
  local desc="$1" sub="$2" esperado="$3"; shift 3
  local saida
  saida=$(como "$sub" "$@" | tail -1)
  if [[ "$saida" == "$esperado" ]]; then
    ok "$desc"
  else
    falha "$desc" "esperado '$esperado', obtido '$saida'"
  fi
}

# ------------------------------------------------------------------ cenario
DONO_A="11111111-1111-1111-1111-111111111111"
AGENTE_A="22222222-2222-2222-2222-222222222222"
DONO_B="33333333-3333-3333-3333-333333333333"

admin_sql "insert into auth.users (id, email) values
  ('$DONO_A','dono-a@teste.local'),
  ('$AGENTE_A','agente-a@teste.local'),
  ('$DONO_B','dono-b@teste.local')" >/dev/null

ORG_A=$(como "$DONO_A" "select public.criar_organizacao('Organização A');" | tail -1)
ORG_B=$(como "$DONO_B" "select public.criar_organizacao('Organização B');" | tail -1)

admin_sql "insert into memberships (org_id, user_id, role)
           values ('$ORG_A','$AGENTE_A','agent')" >/dev/null

# Um produto valido em cada organizacao.
for par in "A:$ORG_A:$DONO_A" "B:$ORG_B:$DONO_B"; do
  letra="${par%%:*}"; resto="${par#*:}"; org="${resto%%:*}"; dono="${resto#*:}"
  como "$dono" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url, status_aprovacao,
     fonte_verificacao, verificado_at, ativo)
    values ('$org','Curso $letra','curso-${letra,,}','Plataforma Exemplo',
            'https://exemplo.test/curso-${letra,,}','aprovado',
            'Painel de afiliado, print de 16/09/2026', now(), true);" >/dev/null
done

echo
echo "Isolamento entre organizações"
echo "─────────────────────────────"

espera_valor "dono da A enxerga somente o produto da A" \
  "$DONO_A" "1" "select count(*) from affiliate_products;"

espera_valor "dono da B enxerga somente o produto da B" \
  "$DONO_B" "1" "select count(*) from affiliate_products;"

espera_valor "dono da B não enxerga o produto da A nem pedindo pelo org_id" \
  "$DONO_B" "0" "select count(*) from affiliate_products where org_id = '$ORG_A';"

espera_erro "dono da B não consegue INSERIR na organização A (WITH CHECK)" \
  "$DONO_B" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url)
    values ('$ORG_A','Invasor','invasor','X','https://exemplo.test/x');"

# UPDATE/DELETE barrados por RLS nao levantam erro: a clausula USING
# simplesmente nao casa com nenhuma linha. Por isso medimos linhas afetadas,
# e nao sucesso ou falha do comando.
espera_valor "UPDATE da B não atinge nenhuma linha da A" \
  "$DONO_B" "0" "with atingidas as (
                   update affiliate_products set titulo = 'sequestrado'
                   where org_id = '$ORG_A' returning 1)
                 select count(*) from atingidas;"

espera_valor "DELETE da B não atinge nenhuma linha da A" \
  "$DONO_B" "0" "with atingidas as (
                   delete from affiliate_products
                   where org_id = '$ORG_A' returning 1)
                 select count(*) from atingidas;"

espera_valor "dono da B não enxerga os membros da A" \
  "$DONO_B" "0" "select count(*) from memberships where org_id = '$ORG_A';"

echo
echo "Papel agent: atende, mas não governa"
echo "────────────────────────────────────"

espera_valor "agente enxerga o produto da própria organização" \
  "$AGENTE_A" "1" "select count(*) from affiliate_products;"

espera_erro "agente NÃO cadastra produto (exige admin)" \
  "$AGENTE_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url)
    values ('$ORG_A','Do agente','do-agente','X','https://exemplo.test/y');"

espera_erro "agente NÃO cria campanha (exige admin)" \
  "$AGENTE_A" "insert into campaigns (org_id, nome) values ('$ORG_A','Campanha');"

espera_erro "agente NÃO registra comissão (exige admin)" \
  "$AGENTE_A" "insert into commission_records
    (org_id, plataforma, valor_centavos, source_type, data_evento)
    values ('$ORG_A','Plataforma Exemplo', 5000, 'registro_manual', current_date);"

espera_erro "agente NÃO convida membro (exige owner)" \
  "$AGENTE_A" "insert into memberships (org_id, user_id, role)
               values ('$ORG_A','$DONO_B','admin');"

espera_valor "agente NÃO consegue se promover a owner" \
  "$AGENTE_A" "0" "with atingidas as (
                     update memberships set role = 'owner'
                     where user_id = '$AGENTE_A' returning 1)
                   select count(*) from atingidas;"

espera_ok "agente PODE registrar lead (é o trabalho dele)" \
  "$AGENTE_A" "insert into leads (org_id, origem) values ('$ORG_A','conversa');"

espera_ok "agente PODE abrir conversa" \
  "$AGENTE_A" "insert into conversations (org_id, anonymous_session_id)
               values ('$ORG_A','sessao-de-teste-1');"

espera_valor "agente NÃO lê a auditoria de custo de IA (exige admin)" \
  "$AGENTE_A" "0" "select count(*) from ai_runs;"

echo
echo "Regras de negócio gravadas no banco"
echo "───────────────────────────────────"

espera_erro "produto NÃO fica ativo sem afiliação aprovada" \
  "$DONO_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url, ativo)
    values ('$ORG_A','Sem aprovação','sem-aprovacao','X',
            'https://exemplo.test/z', true);"

espera_erro "produto NÃO fica ativo sem fonte de verificação" \
  "$DONO_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url, status_aprovacao,
     verificado_at, ativo)
    values ('$ORG_A','Sem fonte','sem-fonte','X','https://exemplo.test/z',
            'aprovado', now(), true);"

espera_erro "link de afiliado em http é recusado" \
  "$DONO_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url)
    values ('$ORG_A','Http','http-link','X','http://exemplo.test/inseguro');"

espera_erro "link de afiliado com javascript: é recusado" \
  "$DONO_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url)
    values ('$ORG_A','JS','js-link','X','javascript:alert(1)');"

espera_erro "preço de referência sem data é recusado" \
  "$DONO_A" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url, preco_referencia_centavos)
    values ('$ORG_A','Sem data','sem-data','X','https://exemplo.test/p', 19700);"

espera_erro "afirmação citável sem fonte é recusada" \
  "$DONO_A" "insert into product_claims (org_id, product_id, afirmacao, ativo)
             select '$ORG_A', id, 'Garantia de 30 dias', true
             from affiliate_products where org_id = '$ORG_A' limit 1;"

espera_erro "comissão 'confirmed' sem data de confirmação é recusada" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, valor_centavos, status, source_type, data_evento)
    values ('$ORG_A','Plataforma Exemplo', 9700, 'confirmed',
            'importacao_csv', current_date);"

espera_erro "comissão 'received' sem data de recebimento é recusada" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, valor_centavos, status, source_type, data_evento,
     confirmado_at)
    values ('$ORG_A','Plataforma Exemplo', 9700, 'received',
            'importacao_csv', current_date, now());"

espera_ok "comissão informada entra normalmente" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, external_transaction_id, valor_centavos, source_type,
     data_evento)
    values ('$ORG_A','Plataforma Exemplo','TX-0001', 9700, 'importacao_csv',
            current_date);"

espera_erro "a MESMA transação da plataforma não entra duas vezes" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, external_transaction_id, valor_centavos, source_type,
     data_evento)
    values ('$ORG_A','Plataforma Exemplo','TX-0001', 9700, 'importacao_csv',
            current_date);"

espera_ok "a mesma TX em OUTRA organização é permitida (não é duplicata)" \
  "$DONO_B" "insert into commission_records
    (org_id, plataforma, external_transaction_id, valor_centavos, source_type,
     data_evento)
    values ('$ORG_B','Plataforma Exemplo','TX-0001', 9700, 'importacao_csv',
            current_date);"

espera_erro "o mesmo arquivo de importação não é processado duas vezes" \
  "$DONO_A" "insert into import_batches (org_id, plataforma, arquivo_fingerprint)
             values ('$ORG_A','Plataforma Exemplo','impressao-digital-123');
             insert into import_batches (org_id, plataforma, arquivo_fingerprint)
             values ('$ORG_A','Plataforma Exemplo','impressao-digital-123');"

espera_erro "consentimento marcado sem finalidade e data é recusado" \
  "$DONO_A" "insert into leads (org_id, consentimento_contato)
             values ('$ORG_A', true);"

espera_erro "segunda organização para o mesmo usuário é recusada" \
  "$DONO_A" "select public.criar_organizacao('Outra org');"

echo
echo "Ciclo de vida da comissão"
echo "─────────────────────────"

espera_ok "comissão confirmada entra com a data de confirmação" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, external_transaction_id, valor_centavos, status,
     source_type, data_evento, confirmado_at)
    values ('$ORG_A','Plataforma Exemplo','TX-9001', 15000, 'confirmed',
            'importacao_csv', current_date, now());"

espera_ok "reembolso registra um EVENTO e muda o status" \
  "$DONO_A" "insert into commission_events (org_id, commission_id, tipo, valor_centavos)
             select '$ORG_A', id, 'revertida', valor_centavos
             from commission_records where external_transaction_id = 'TX-9001';
             update commission_records set status = 'reversed'
             where external_transaction_id = 'TX-9001';"

espera_valor "a comissão revertida SAI do total de confirmadas" \
  "$DONO_A" "0" "select coalesce(sum(valor_centavos),0) from commission_records
                 where status = 'confirmed' and external_transaction_id = 'TX-9001';"

espera_valor "mas o histórico do que foi confirmado antes permanece" \
  "$DONO_A" "1" "select count(*) from commission_events e
                 join commission_records c on c.id = e.commission_id
                 where c.external_transaction_id = 'TX-9001'
                   and e.tipo = 'revertida';"

espera_valor "'unknown' não entra em confirmada nem em recebida" \
  "$DONO_A" "0" "select count(*) from commission_records
                 where status in ('confirmed','received')
                   and source_reference = 'linha-desconhecida';"

espera_ok "situação desconhecida é um estado válido e explícito" \
  "$DONO_A" "insert into commission_records
    (org_id, plataforma, valor_centavos, status, source_type, data_evento,
     source_reference)
    values ('$ORG_A','Plataforma Exemplo', 5000, 'unknown', 'importacao_csv',
            current_date, 'linha-desconhecida');"

echo
echo "Visitante anônimo: só alcança a superfície pública"
echo "──────────────────────────────────────────────────"

espera_anon_erro "anônimo NÃO lê a tabela de produtos direto" \
  "select * from affiliate_products;"

espera_anon_erro "anônimo NÃO lê comissões" \
  "select * from commission_records;"

espera_anon_erro "anônimo NÃO lê a lista de membros" \
  "select * from memberships;"

espera_anon_erro "anônimo NÃO cria organização" \
  "select public.criar_organizacao('Invasora');"

espera_anon_valor "anônimo enxerga a oferta ativa pela função pública" "1" \
  "select count(*) from public.obter_oferta_publica('curso-a');"

espera_anon_valor "a função pública NÃO devolve o link de afiliado nem a comissão" "0" \
  "select count(*) from information_schema.columns
   where table_name = 'obter_oferta_publica'
     and column_name in ('affiliate_url','comissao_estimada_centavos',
                         'fonte_verificacao','regras_divulgacao');"

# Produto inativo nao pode aparecer na pagina publica.
admin_sql "insert into affiliate_products
  (org_id, titulo, slug, plataforma, affiliate_url)
  values ('$ORG_A','Rascunho','curso-rascunho','Plataforma Exemplo',
          'https://exemplo.test/rascunho')" >/dev/null

espera_anon_valor "produto inativo NÃO aparece na página pública" "0" \
  "select count(*) from public.obter_oferta_publica('curso-rascunho');"

# Note como o id vem de obter_oferta_publica(), nao de um SELECT na tabela:
# e assim que o visitante real chega ao id, porque a tabela ele nao le.
espera_anon_valor "clique em produto inativo não devolve destino" "" \
  "select coalesce((select destino from public.registrar_clique_saida(
     (select id from public.obter_oferta_publica('curso-rascunho')),
     'sessao-anonima-1','trk-inativo')), '');"

espera_anon_valor "clique em produto ativo devolve o destino GRAVADO" \
  "https://exemplo.test/curso-a" \
  "select destino from public.registrar_clique_saida(
     (select id from public.obter_oferta_publica('curso-a')),
     'sessao-anonima-2','trk-0001');"

# Quem confere o registro e o dono da organizacao, pela RLS normal — o
# visitante anonimo nao tem, e nao deve ter, leitura da tabela de cliques.
espera_valor "o clique do visitante ficou registrado para o dono" \
  "$DONO_A" "1" "select count(*) from outbound_clicks where tracking_id = 'trk-0001';"

espera_anon_valor "repetir o mesmo tracking_id ainda devolve o destino" \
  "https://exemplo.test/curso-a" \
  "select destino from public.registrar_clique_saida(
     (select id from public.obter_oferta_publica('curso-a')),
     'sessao-anonima-2','trk-0001');"

espera_valor "mas NÃO cria um segundo registro de clique" \
  "$DONO_A" "1" "select count(*) from outbound_clicks where tracking_id = 'trk-0001';"

espera_erro "duas organizações NÃO podem usar o mesmo slug público" \
  "$DONO_B" "insert into affiliate_products
    (org_id, titulo, slug, plataforma, affiliate_url)
    values ('$ORG_B','Colisão','curso-a','Plataforma Exemplo',
            'https://exemplo.test/colisao');"

echo
echo "─────────────────────────────────────────"
printf "Resultado: %d passaram, %d falharam\n" "$PASSOU" "$FALHOU"
[[ "$FALHOU" -eq 0 ]]
