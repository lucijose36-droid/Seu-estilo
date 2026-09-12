# Seu Estilo — MVP funcional

Consultor de imagem pessoal com IA (protótipo). Next.js 16 + TypeScript + Tailwind CSS v4.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 no navegador (ou acesse pelo celular na mesma rede
usando o IP da máquina, para testar como app mobile).

Para simular o build de produção:

```bash
npm run build
npm run start
```

## Fluxo principal implementado

Abertura → Minha Foto → Ocasião → Estilo desejado → Resultado (3 looks
gerados) → Detalhe do look (abas Homem/Mulher) → Experimentar em mim →
Salvar → Meus Looks.

Menu inferior: Início · Looks · Descobrir · Guarda-roupa · Perfil.
Extras: "Tenho um evento agora" (fluxo rápido) e "Avaliar meu look"
("O que está errado?").

## O que é MOCK nesta versão

- **Análise da foto** (subtom, contraste, formato do rosto): gerada por um
  algoritmo determinístico local (`src/lib/mockEngine.ts`, função
  `analisarFoto`), não por visão computacional real. Não infere raça,
  etnia, religião, orientação sexual ou outras características sensíveis.
- **Geração dos 3 looks**: motor de recomendação com pools de conteúdo
  reais por gênero/formalidade/clima (`src/lib/data/pools.ts`) combinados
  com uma seed determinística (`generateLooks` em `mockEngine.ts`), para
  gerar variação sem repetir sempre o mesmo look.
- **"Experimentar em mim"**: composição visual estilizada (SVG) ao lado da
  foto do usuário — não é geração de imagem realista.
- **"Avaliar meu look"**: nota e pontos de atenção simulados a partir da
  foto enviada (`avaliarLook`).
- **"Montar look com meu guarda-roupa"**: lógica local de sorteio entre as
  peças cadastradas (`montarLookComGuardaRoupa`).
- Todo o armazenamento (foto, looks salvos, guarda-roupa, perfil) é local
  (localStorage do navegador) — não há backend nesta primeira versão.

## O que falta para IA real

1. ~~**Análise visual real**~~
2. ~~**Geração de looks por IA generativa**~~
3. **"Vista em mim" realista — já com o código pronto, falta só a chave.**
   A rota `src/app/api/try-on/route.ts` já integra com a [fal.ai](https://fal.ai)
   (gera uma imagem de referência da peça a partir da descrição do look e
   depois aplica sobre a foto da pessoa). Para ativar:
   1. Crie uma conta em fal.ai e gere uma chave em **Dashboard → Keys**
   2. No Vercel: **Project Settings → Environment Variables** → adicione
      `FAL_KEY` com o valor da chave → **Save**
   3. Faça um novo deploy (Vercel → Deployments → ⋯ → Redeploy)
   4. Pronto: a tela "Experimentar em mim" passa a mostrar o botão
      "Gerar minha foto com esse look" automaticamente. Sem a chave
      configurada, o app continua funcionando normalmente com a
      simulação estilizada (fallback automático, sem quebrar nada).
   Custo aproximado: alguns centavos de dólar por foto gerada (a fal.ai
   cobra por uso, sem mensalidade). Para trocar de provedor, basta editar
   as duas chamadas dentro dessa mesma rota.
4. **Análise visual real** (subtom, contraste, formato do rosto): pode
   usar o mesmo padrão de rota de servidor acima, plugando um modelo de
   visão computacional no lugar de `analisarFoto()`.
5. **Avaliação de look por visão computacional real** no lugar de
   `avaliarLook()` — mesmo padrão.
6. **Backend/Supabase**: as tabelas sugeridas (`profiles`, `looks`,
   `saved_looks`, `wardrobe_items`, `style_preferences`) ainda não foram
   criadas — hoje tudo vive no localStorage. Migrar é trocar o
   `src/lib/store.tsx` (que centraliza todo o estado) por chamadas ao
   Supabase, mantendo a mesma interface (`useApp()`) usada pelas telas.
7. **Previsão do tempo automática por localização**: hoje o clima é
   escolhido manualmente pelo usuário na tela de Estilo.
8. **PWA**: o projeto está em Next.js/App Router, pronto para receber
   manifest + service worker quando for a hora de publicar.
