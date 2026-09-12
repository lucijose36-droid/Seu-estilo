export type Formalidade =
  | "Casual"
  | "Casual elegante"
  | "Social"
  | "Formal"
  | "Muito formal";

export type Periodo = "Dia" | "Tarde" | "Noite";

export type Clima = "Ensolarado" | "Nublado" | "Chuvoso" | "Frio" | "Quente";

export type EstiloDesejado =
  | "Elegante e discreto"
  | "Moderno"
  | "Clássico"
  | "Sofisticado"
  | "Casual premium"
  | "Quero chamar atenção"
  | "Romântico"
  | "Minimalista";

export type Orcamento =
  | "Quero usar o que já tenho"
  | "Econômico"
  | "Médio"
  | "Sem limite definido";

export interface OcasiaoData {
  tipo: string; // e.g. "Buffet / Festa formal" or custom text
  quando: "Hoje" | "Amanhã" | string; // date string when "Escolher data"
  periodo: Periodo;
  formalidade: Formalidade;
}

export interface EstiloData {
  sensacao: EstiloDesejado;
  orcamento: Orcamento;
  clima: Clima;
}

export interface LookPeca {
  cabelo: string;
  barba?: string;
  maquiagem?: string;
  roupa: string;
  calcado: string;
  acessorios: string;
  cores: string[];
  porque: string;
}

export interface LookSuggestion {
  id: string;
  titulo: string; // "Clássico elegante"
  resumo: string;
  paletaCores: string[]; // hex-ish tokens for the mock "photo"
  homem: LookPeca;
  mulher: LookPeca;
  tags: string[];
}

export interface SavedLook extends LookSuggestion {
  savedAt: number;
  contexto: string; // occasion label at time of save
}

export type WardrobeCategoria =
  | "Camisas"
  | "Camisetas"
  | "Calças"
  | "Blazers"
  | "Ternos"
  | "Vestidos"
  | "Saias"
  | "Sapatos"
  | "Bolsas"
  | "Acessórios";

export interface WardrobeItem {
  id: string;
  categoria: WardrobeCategoria;
  foto: string; // data URL
  nome: string;
  createdAt: number;
}

export interface Avaliacao {
  nota: number; // 0-10
  categorias: { nome: string; nota: number }[];
  pontosFortes: string[];
  pontosAtencao: { problema: string; sugestao: string }[];
}

export interface PerfilUsuario {
  nome: string;
  preferenciasEstilo: EstiloDesejado[];
}
