# Banco da Vendora AI

## Estado atual

As migrations deste diretório **não foram aplicadas em nenhum projeto
Supabase** — não existe projeto configurado nesta sessão. O que existe é
prova de que elas funcionam: são aplicadas do zero em um PostgreSQL 16 real a
cada execução do teste, e o isolamento entre organizações é verificado contra
esse banco.

```bash
npm run test:db     # recria o banco, aplica tudo, roda 30 verificações
```

## Ordem das migrations

| Arquivo | Conteúdo |
|---|---|
| `0001_base.sql` | extensões, papéis, schema `app`, enums, utilitários |
| `0002_organizacoes.sql` | `organizations`, `memberships`, funções de autorização |
| `0003_catalogo.sql` | `affiliate_products`, `product_claims` |
| `0004_campanhas_visitas.sql` | `campaigns`, `visits`, `leads` |
| `0005_conversas_cliques.sql` | `conversations`, `messages`, `outbound_clicks` |
| `0006_comissoes_despesas.sql` | comissões, eventos, despesas, importações, `ai_runs` |
| `0007_rls.sql` | RLS de todas as tabelas, por papel |
| `0008_criar_organizacao.sql` | criação atômica de organização + vínculo de dono |

## Aplicar em um projeto Supabase

Com a CLI oficial:

```bash
supabase link --project-ref <ref-do-projeto>
supabase db push
```

Ou, sem CLI, colando cada arquivo **na ordem** no SQL Editor do painel.

O schema `auth` (com `auth.users` e `auth.uid()`) já existe no Supabase. O
arquivo `tests/db/00_shim_auth.sql` reproduz o mínimo dele para o teste local
e **não deve ser aplicado em produção** — por isso mora em `tests/`, fora de
`migrations/`.

## Decisões que valem revisar antes de aplicar

- **Nenhuma tabela usa `force row level security`.** O dono da tabela precisa
  continuar isento para que `app.papel_na_org()` (SECURITY DEFINER) consulte
  `memberships` sem reentrar na própria policy. Ligar `force` reintroduz a
  recursão.
- **Escrita é sempre por papel**, nunca por simples pertencimento. A tabela de
  papéis mínimos está no topo do bloco gerador em `0007_rls.sql`.
- **"Agent não exporta a lista inteira de clientes" não está na RLS.** Não é
  expressável sem impedir o atendimento, que depende de ler o lead. A
  restrição vive na camada de aplicação, na ação de exportação.
- **Deduplicação de comissão é índice único parcial**, só quando há
  `external_transaction_id`. Relatório sem identificador entra e exige
  conciliação manual — de propósito.
