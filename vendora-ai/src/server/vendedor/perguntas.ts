/**
 * Perguntas de triagem.
 *
 * Conjunto fixo e revisado. O provedor escolhe qual fazer, nunca redige uma —
 * mesma lógica dos demais blocos: escolher entre opções conhecidas é
 * auditável, redigir livremente não é.
 */
export const PERGUNTAS = [
  {
    id: "objetivo",
    texto: "Para eu te ajudar direito: o que você está querendo resolver hoje?",
  },
  {
    id: "momento",
    texto: "Você já estudou alguma coisa sobre esse assunto ou estaria começando agora?",
  },
  {
    id: "tempo",
    texto: "Quanto tempo por semana você conseguiria dedicar?",
  },
  {
    id: "duvida",
    texto: "Tem alguma dúvida específica sobre o material que eu possa verificar?",
  },
  {
    id: "seguir",
    texto: "Quer que eu te mostre a página oficial para você conferir os detalhes?",
  },
] as const;

export type PerguntaId = (typeof PERGUNTAS)[number]["id"];

export function acharPergunta(id: string) {
  return PERGUNTAS.find((p) => p.id === id);
}
