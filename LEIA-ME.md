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

1. **Análise visual real**: conectar um modelo de visão computacional
   (ex.: API de análise de imagem) no lugar de `analisarFoto()`.
2. **Geração de looks por IA generativa**: substituir/complementar
   `generateLooks()` por chamadas a um modelo de linguagem com prompt
   estruturado, mantendo o mesmo formato de retorno (`LookSuggestion`).
3. **"Vista em mim" realista**: integrar uma API de geração/edição de
   imagem (ex.: modelos de try-on virtual) — o componente
   `src/app/experimentar/[id]/page.tsx` já está isolado e pronto para
   receber essa chamada no lugar da simulação.
4. **Avaliação de look por visão computacional real** no lugar de
   `avaliarLook()`.
5. **Backend/Supabase**: as tabelas sugeridas (`profiles`, `looks`,
   `saved_looks`, `wardrobe_items`, `style_preferences`) ainda não foram
   criadas — hoje tudo vive no localStorage. Migrar é trocar o
   `src/lib/store.tsx` (que centraliza todo o estado) por chamadas ao
   Supabase, mantendo a mesma interface (`useApp()`) usada pelas telas.
6. **Previsão do tempo automática por localização**: hoje o clima é
   escolhido manualmente pelo usuário na tela de Estilo.
7. **PWA**: o projeto está em Next.js/App Router, pronto para receber
   manifest + service worker quando for a hora de publicar.
