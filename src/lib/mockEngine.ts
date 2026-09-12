import type {
  Avaliacao,
  Clima,
  EstiloData,
  Formalidade,
  LookPeca,
  LookSuggestion,
  OcasiaoData,
  WardrobeItem,
} from "./types";
import {
  ACESSORIOS_HOMEM,
  ACESSORIOS_MULHER,
  BARBA_HOMEM,
  CABELO_HOMEM,
  CABELO_MULHER,
  MAQUIAGEM_MULHER,
  PALETAS,
  PORQUE_TEMPLATES,
  ROUPA_HOMEM,
  ROUPA_MULHER,
  SAPATO_HOMEM,
  SAPATO_MULHER,
  type Registro,
} from "./data/pools";

// PRNG simples e determinístico (mulberry32) para gerar variação
// reproduzível a partir das escolhas do usuário, sem depender de uma IA real.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

function formalidadeParaRegistro(f: Formalidade): Registro {
  if (f === "Casual" || f === "Casual elegante") return "casual";
  if (f === "Social") return "social";
  return "formal"; // Formal, Muito formal
}

// Cada arquétipo "sobe" ou "desce" um degrau de formalidade em relação ao
// pedido do usuário, para que os 3 looks fiquem visivelmente diferentes
// entre si mesmo partindo da mesma ocasião.
const DEGRAUS: Registro[] = ["casual", "social", "formal"];
function ajustarRegistro(base: Registro, delta: number): Registro {
  const idx = DEGRAUS.indexOf(base);
  const novo = Math.min(Math.max(idx + delta, 0), DEGRAUS.length - 1);
  return DEGRAUS[novo];
}

const ARQUETIPOS = [
  { titulo: "Clássico elegante", paleta: "classico", delta: 0 },
  { titulo: "Moderno sofisticado", paleta: "moderno", delta: 1 },
  { titulo: "Elegante discreto", paleta: "minimalista", delta: -1 },
] as const;

function climaAjustaRoupa(base: string, clima: Clima, genero: "homem" | "mulher"): string {
  if (clima === "Frio") {
    return genero === "homem"
      ? `${base} — acrescente um sobretudo de lã por cima para o frio.`
      : `${base} — finalize com um casaco alongado para se proteger do frio.`;
  }
  if (clima === "Quente") {
    return `${base.replace("de lã", "leve")} Priorize tecidos leves e respiráveis por causa do calor.`;
  }
  if (clima === "Chuvoso") {
    return `${base} Leve um trench coat impermeável e opte por calçado fechado antiderrapante.`;
  }
  return base;
}

function montarPeca(
  rng: () => number,
  genero: "homem" | "mulher",
  registro: Registro,
  ocasiao: OcasiaoData,
  estilo: EstiloData,
  cores: string[],
): LookPeca {
  const roupaBase =
    genero === "homem" ? pick(rng, ROUPA_HOMEM[registro]) : pick(rng, ROUPA_MULHER[registro]);
  const roupa = climaAjustaRoupa(roupaBase, estilo.clima, genero);

  const porqueTemplate = pick(rng, PORQUE_TEMPLATES);
  const porque = porqueTemplate
    .replace("{periodo}", ocasiao.periodo.toLowerCase())
    .replace("{sensacao}", estilo.sensacao.toLowerCase());

  if (genero === "homem") {
    return {
      cabelo: pick(rng, CABELO_HOMEM[registro]),
      barba: pick(rng, BARBA_HOMEM[registro]),
      roupa,
      calcado: pick(rng, SAPATO_HOMEM[registro]),
      acessorios: pick(rng, ACESSORIOS_HOMEM[registro]),
      cores,
      porque,
    };
  }
  return {
    cabelo: pick(rng, CABELO_MULHER[registro]),
    maquiagem: pick(rng, MAQUIAGEM_MULHER[registro]),
    roupa,
    calcado: pick(rng, SAPATO_MULHER[registro]),
    acessorios: pick(rng, ACESSORIOS_MULHER[registro]),
    cores,
    porque,
  };
}

export function generateLooks(
  ocasiao: OcasiaoData,
  estilo: EstiloData,
  nonce = 0,
): LookSuggestion[] {
  const baseRegistro = formalidadeParaRegistro(ocasiao.formalidade);
  const seedBase = hashString(
    JSON.stringify({ ocasiao, estilo, nonce }),
  );

  return ARQUETIPOS.map((arq, i) => {
    const rng = mulberry32(seedBase + i * 97 + nonce * 733);
    const registro = ajustarRegistro(baseRegistro, arq.delta);
    const paleta = PALETAS[arq.paleta];

    const homem = montarPeca(rng, "homem", registro, ocasiao, estilo, paleta);
    const mulher = montarPeca(rng, "mulher", registro, ocasiao, estilo, paleta);

    return {
      id: `${seedBase}-${i}-${nonce}`,
      titulo: arq.titulo,
      resumo: `Interpretação ${arq.titulo.toLowerCase()} para ${ocasiao.tipo.toLowerCase()}, pensada para o período da ${ocasiao.periodo.toLowerCase()}.`,
      paletaCores: paleta,
      homem,
      mulher,
      tags: [ocasiao.formalidade, estilo.sensacao, estilo.clima],
    } satisfies LookSuggestion;
  });
}

// --- Análise visual simulada -------------------------------------------
// Não infere raça, etnia, religião, orientação sexual ou qualquer
// característica sensível: usa apenas atributos de estilo (subtom
// aparente, contraste, formato do rosto, cabelo) para orientar as cores
// e cortes sugeridos.

const SUBTONS = ["quente", "frio", "neutro"];
const CONTRASTES = ["baixo", "médio", "alto"];
const FORMATOS_ROSTO = ["oval", "redondo", "quadrado", "coração", "alongado"];

export interface AnaliseFoto {
  subtom: string;
  contraste: string;
  formatoRosto: string;
  observacao: string;
}

export function analisarFoto(photoDataUrl: string): AnaliseFoto {
  const rng = mulberry32(hashString(photoDataUrl.slice(0, 500)) || 1);
  const subtom = pick(rng, SUBTONS);
  const contraste = pick(rng, CONTRASTES);
  const formatoRosto = pick(rng, FORMATOS_ROSTO);
  const observacao = `Subtom aparente ${subtom}, contraste ${contraste} entre pele e cabelo, e rosto de formato ${formatoRosto} — características usadas para calibrar cores e cortes.`;
  return { subtom, contraste, formatoRosto, observacao };
}

// --- Avaliação de look já vestido ("O que está errado?") ---------------

const PONTOS_FORTES = [
  "A paleta de cores está harmônica e bem equilibrada.",
  "O caimento das peças está adequado ao seu biotipo.",
  "A proporção entre peças de cima e de baixo está bem equilibrada.",
  "Os acessórios reforçam o estilo sem exagerar.",
];

const PONTOS_ATENCAO: { problema: string; sugestao: string }[] = [
  { problema: "O calçado está muito casual para essa ocasião.", sugestao: "Substitua por um derby marrom ou preto." },
  { problema: "O contraste entre as cores está um pouco forte.", sugestao: "Troque um dos itens por um tom neutro para equilibrar." },
  { problema: "A peça de cima está larga demais para a silhueta.", sugestao: "Ajuste com um cinto ou escolha um caimento mais reto." },
  { problema: "Os acessórios estão competindo entre si.", sugestao: "Remova uma peça e deixe apenas o relógio ou o colar." },
  { problema: "O nível de formalidade está abaixo do evento.", sugestao: "Adicione um blazer ou uma camada mais estruturada." },
];

export function avaliarLook(photoDataUrl: string): Avaliacao {
  const rng = mulberry32(hashString(photoDataUrl.slice(0, 500)) + 42);
  const nota = Math.round((6.5 + rng() * 3) * 10) / 10;
  const categorias = ["Cores", "Formalidade", "Harmonia", "Calçado", "Acessórios"].map(
    (nome) => ({ nome, nota: Math.round((6 + rng() * 4) * 10) / 10 }),
  );
  const pontosFortes = [pick(rng, PONTOS_FORTES), pick(rng, PONTOS_FORTES)].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );
  const atencaoEmbaralhado = [...PONTOS_ATENCAO].sort(() => rng() - 0.5);
  return {
    nota,
    categorias,
    pontosFortes,
    pontosAtencao: atencaoEmbaralhado.slice(0, 2),
  };
}

// --- Montar look apenas com o guarda-roupa cadastrado -------------------

export function montarLookComGuardaRoupa(itens: WardrobeItem[]) {
  const porCategoria = (cats: string[]) =>
    itens.filter((i) => cats.includes(i.categoria));

  const cima = porCategoria(["Camisas", "Camisetas", "Blazers", "Ternos", "Vestidos"]);
  const baixo = porCategoria(["Calças", "Saias"]);
  const sapatos = porCategoria(["Sapatos"]);
  const acessorios = porCategoria(["Bolsas", "Acessórios"]);

  const rng = mulberry32(itens.length * 13 + Date.now() % 1000);
  const escolhidos = [
    cima.length ? pick(rng, cima) : null,
    baixo.length ? pick(rng, baixo) : null,
    sapatos.length ? pick(rng, sapatos) : null,
    acessorios.length ? pick(rng, acessorios) : null,
  ].filter(Boolean) as WardrobeItem[];

  const faltando: string[] = [];
  if (!cima.length) faltando.push("uma peça de cima (camisa, blazer ou vestido)");
  if (!baixo.length) faltando.push("uma peça de baixo (calça ou saia)");
  if (!sapatos.length) faltando.push("sapato");

  return { escolhidos, faltando };
}
