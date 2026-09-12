// Conjuntos de recomendações usados pelo motor de mock (src/lib/mockEngine.ts).
// Organizados por gênero e por "registro" de formalidade, para permitir
// combinações variadas conforme ocasião, período, estilo e clima.

export type Registro = "casual" | "social" | "formal";

export const CABELO_HOMEM: Record<Registro, string[]> = {
  casual: [
    "Cabelo natural, textura solta e leve desalinho proposital.",
    "Topo com um pouco de pó texturizador, sem risca definida.",
    "Laterais curtas e topo mais longo, penteado com os dedos.",
  ],
  social: [
    "Laterais alinhadas e topo penteado levemente para trás.",
    "Risca lateral definida com um leve brilho de pomada matte.",
    "Corte médio, franja repartida e volume controlado no topo.",
  ],
  formal: [
    "Corte clássico bem aparado, penteado para trás com pomada de fixação forte.",
    "Undercut alinhado, topo escovado para trás sem brilho excessivo.",
    "Laterais bem baixas e topo curto, acabamento seco e sóbrio.",
  ],
};

export const BARBA_HOMEM: Record<Registro, string[]> = {
  casual: [
    "Barba de alguns dias, aparada apenas nos contornos.",
    "Rosto sem barba, pele hidratada e uniforme.",
    "Barba cheia natural, penteada com óleo para brilho leve.",
  ],
  social: [
    "Barba baixa bem desenhada, contorno nítido no pescoço.",
    "Bigode e barba curta alinhados com navalha.",
    "Rosto feito, apenas costeletas alinhadas.",
  ],
  formal: [
    "Barba baixíssima e milimetricamente alinhada, ou rosto completamente feito.",
    "Barba cheia, porém muito bem aparada e simétrica.",
  ],
};

export const ROUPA_HOMEM: Record<Registro, string[]> = {
  casual: [
    "Camisa de linho aberta sobre camiseta lisa + calça chino.",
    "Moletom premium de malha pesada + calça de sarja.",
    "Camisa manga curta estampada discreta + bermuda alfaiataria.",
  ],
  social: [
    "Blazer azul-marinho + camisa branca + calça social slim.",
    "Camisa social sem gravata, mangas dobradas, com colete de malha fina.",
    "Suéter de tricô sobre camisa social + calça de sarja escura.",
  ],
  formal: [
    "Terno cinza-chumbo de corte slim + camisa branca + gravata em tom bordô.",
    "Smoking preto com lapela de cetim + camisa social plissada.",
    "Terno azul-marinho risca de giz + gravata em seda lisa.",
  ],
};

export const SAPATO_HOMEM: Record<Registro, string[]> = {
  casual: [
    "Sneaker branco minimalista de couro.",
    "Mocassim em camurça marrom, sem meias.",
    "Bota chelsea em couro fosco.",
  ],
  social: [
    "Oxford ou derby marrom, couro com brilho discreto.",
    "Loafer preto de fivela metálica.",
  ],
  formal: [
    "Oxford preto de couro envernizado.",
    "Sapato social preto liso, biqueira reta, com meias sociais finas.",
  ],
};

export const ACESSORIOS_HOMEM: Record<Registro, string[]> = {
  casual: [
    "Relógio de pulseira de silicone e óculos de sol.",
    "Pulseira de couro trançado e cordão discreto.",
  ],
  social: [
    "Relógio discreto com pulseira de couro.",
    "Cinto de couro combinando com o sapato e lenço de bolso simples.",
  ],
  formal: [
    "Abotoaduras discretas e relógio de pulseira de couro fino.",
    "Lenço de bolso em tom harmônico com a gravata.",
  ],
};

export const CABELO_MULHER: Record<Registro, string[]> = {
  casual: [
    "Solto com ondas naturais feitas com um toque de finalizador.",
    "Rabo de cavalo alto e liso.",
    "Coque desalinhado, com fios soltos emoldurando o rosto.",
  ],
  social: [
    "Ondas leves e volumosas, com risca lateral.",
    "Meio preso, meio solto, com trança fina na lateral.",
    "Liso escovado com brilho, pontas levemente viradas para dentro.",
  ],
  formal: [
    "Coque baixo alinhado, com acabamento liso e brilhoso.",
    "Penteado preso com ondas estruturadas e presilha discreta em metal dourado.",
    "Coque alto elegante, deixando o colo à mostra.",
  ],
};

export const MAQUIAGEM_MULHER: Record<Registro, string[]> = {
  casual: [
    "Pele natural com protetor com cor, blush e gloss labial.",
    "Base leve, delineado fino e máscara de cílios.",
  ],
  social: [
    "Base natural, tons terrosos na pálpebra e batom nude.",
    "Esfumado em tons de cobre e boca em vinho acetinado.",
  ],
  formal: [
    "Pele impecável com acabamento aveludado, olho esfumado marcante e batom vermelho clássico.",
    "Contorno definido, cílios postiços discretos e boca em nude rosado de longa duração.",
  ],
};

export const ROUPA_MULHER: Record<Registro, string[]> = {
  casual: [
    "Vestido midi de linho + sandália rasteira.",
    "Conjunto de alfaiataria leve em tom terroso + tênis branco.",
    "Macacão fluido de viscose com cinto fino.",
  ],
  social: [
    "Vestido midi acetinado em tom joia.",
    "Conjunto de blazer estruturado e calça pantalona a jogo.",
    "Saia midi plissada + blusa de manga longa em seda.",
  ],
  formal: [
    "Vestido longo de tecido fluido, decote discreto e fenda sutil.",
    "Conjunto de alfaiataria preta impecável com blusa de seda por baixo.",
    "Vestido tubinho em veludo com sobretudo curto.",
  ],
};

export const SAPATO_MULHER: Record<Registro, string[]> = {
  casual: [
    "Tênis branco de couro.",
    "Sandália rasteira trançada.",
    "Mule baixo em couro liso.",
  ],
  social: [
    "Scarpin nude de salto médio.",
    "Sandália de tiras finas com salto bloco.",
  ],
  formal: [
    "Scarpin preto de salto alto e bico fino.",
    "Sandália de salto agulha com detalhe metalizado.",
  ],
};

export const ACESSORIOS_MULHER: Record<Registro, string[]> = {
  casual: [
    "Brincos pequenos e bolsa transversal compacta.",
    "Colar fino e óculos de sol de armação leve.",
  ],
  social: [
    "Brincos médios dourados e clutch estruturada.",
    "Pulseira fina e bolsa de alça corrente.",
  ],
  formal: [
    "Brincos pequenos dourados e bolsa discreta em tom neutro.",
    "Colar delicado e clutch de cetim combinando com o sapato.",
  ],
};

export const PALETAS: Record<string, string[]> = {
  classico: ["#1c2431", "#d9d2c2", "#f4f1ea", "#8a2f2f"],
  moderno: ["#111111", "#c9b48a", "#e8e2d6", "#5c6b73"],
  sofisticado: ["#2a1e2c", "#b08968", "#f1e6dd", "#6d2e46"],
  romantico: ["#5a3a41", "#e7c6c2", "#f7ece9", "#a97155"],
  minimalista: ["#232323", "#ded9cf", "#ffffff", "#9c9182"],
  chamativo: ["#151515", "#c98a2c", "#e9e2d3", "#8a1f2b"],
};

export const PORQUE_TEMPLATES = [
  "Esse tom cria um contraste equilibrado com sua aparência e funciona muito bem para eventos {periodo}.",
  "A combinação valoriza a proporção do seu rosto e mantém um visual harmônico do início ao fim da noite.",
  "As cores escolhidas conversam bem com o subtom identificado na sua foto, sem competir com o ambiente do evento.",
  "É um look que respeita o nível de formalidade pedido sem parecer exagerado ou sem cuidado.",
  "A silhueta alonga a postura e traz elegância sem perder o conforto para um evento {periodo}.",
  "O contraste entre as peças cria um ponto focal único, ideal para quem quer se sentir {sensacao}.",
];
