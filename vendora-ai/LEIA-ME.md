# Vendora AI

Plataforma de captação, atendimento e análise para vendas de afiliados.

> **Estado:** aplicação construída e verificada localmente. **Nenhum projeto
> Supabase foi configurado ou provisionado nesta sessão**, nenhum deploy foi
> feito e nenhum anúncio foi publicado. O que existe é código, migrations e
> testes que rodam de verdade — não um sistema em operação.

Aplicação **autônoma**, em subpasta do repositório `Seu-estilo` por decisão de
organização. Não compartilha `package.json`, `node_modules`, build, deploy nem
uma única linha de código com o app Seu Estilo.

## Rodar

```bash
cd vendora-ai
npm install
cp .env.example .env.local   # preencher com o projeto Supabase
npm run dev
```

Sem credenciais do Supabase, a aplicação **continua navegável** em modo de
inspeção, com aviso explícito em cada tela. Nenhum dado de exemplo é exibido
como se fosse real.

## Verificação

```bash
npm run build      # compila + TypeScript (o portão de verdade)
npm run lint
npm test           # 53 testes de unidade
npm run test:db    # 49 verificações contra PostgreSQL real
```

`npm run test:db` recria o banco, aplica todas as migrations do zero e verifica
isolamento entre organizações, limites de papel, superfície pública e as regras
de negócio gravadas como CHECK. Exige um PostgreSQL local acessível.

## O que este produto faz e o que não faz

**Faz:** divulga ofertas de afiliado com afirmações verificadas, atende
dúvidas com um assistente automatizado que só cita fonte registrada, encaminha
ao link oficial registrando o clique, e concilia comissões importadas do
relatório da plataforma.

**Não faz:** checkout, cobrança, entrega, confirmação própria de pagamento,
gestão automática de verba de anúncio, disparo em massa, nem qualquer promessa
de faturamento. A venda acontece inteiramente na plataforma do produtor.

## Deploy isolado

Na Vercel, este app é um **projeto separado** do Seu Estilo:

| Configuração | Valor |
|---|---|
| Root Directory | `vendora-ai` |
| Framework | Next.js (detectado) |
| Build Command | `npm run build` (padrão) |

Variáveis de ambiente: ver `.env.example`. A `SUPABASE_SERVICE_ROLE_KEY` vai
**somente** no painel da Vercel, nunca em arquivo versionado — e hoje nenhum
código a utiliza.

Os dois projetos apontam para o mesmo repositório com Root Directory
diferente. Um push que só toca `vendora-ai/` não redeploya o Seu Estilo se o
*Ignored Build Step* estiver configurado; sem isso, o Seu Estilo apenas
rebuilda igual, sem regressão.

## Decisões que valem conhecer antes de mexer

- **`src/proxy.ts`, não `middleware.ts`.** Esta versão do Next renomeou o
  arquivo. A documentação do Supabase ainda mostra `middleware.ts`: copiá-la
  produz um arquivo que o framework não carrega, e a sessão nunca renova.
- **Dinheiro é inteiro de centavos**, ponta a ponta. `formatarCentavos()`
  produz texto para humano, com espaço não-quebrável; exportação e comparação
  usam os centavos.
- **O atendente não redige informação sobre o produto.** Ele referencia
  afirmações verificadas; o servidor monta o texto. Ver
  `src/server/vendedor/tipos.ts`.
- **`/go/[id]` nunca aceita destino pela URL** e revalida a URL do banco antes
  de redirecionar. Mexer nessa rota sem ler os comentários é como remover um
  fusível por estar atrapalhando.
- **Regras de negócio são CHECK no banco**, não só validação de formulário.
  Produto sem afiliação aprovada não fica ativo nem por POST direto.

## Pendências que dependem de você

1. Projeto Supabase criado e migrations aplicadas (`supabase/README.md`).
2. Produto de afiliado com aprovação confirmada no painel da plataforma.
3. Verificação de marca, domínio e perfis "Vendora AI" antes de divulgar.
4. Regras de divulgação do produtor conferidas antes de qualquer anúncio.
5. Decisão sobre provedor de IA — hoje `rules`, sem custo por conversa, com
   teto de gasto em zero.
