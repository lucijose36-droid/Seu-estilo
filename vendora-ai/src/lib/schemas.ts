import { z } from "zod";
import { paraCentavos } from "./dinheiro";
import { analisarUrlAfiliado, EXPLICACAO_RECUSA } from "./afiliado/plataformas";

/** Campo de dinheiro vindo de formulário: texto em pt-BR, guardado em centavos. */
const centavosOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || paraCentavos(v) !== null, {
    error: "Valor inválido. Use o formato 1.234,56.",
  })
  .transform((v) => (v === null ? null : paraCentavos(v)));

export const SLUG = z
  .string()
  .trim()
  .min(1, { error: "Informe o endereço da página." })
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    error: "Use apenas letras minúsculas, números e hífen.",
  });

export const ProdutoEntrada = z
  .object({
    titulo: z.string().trim().min(1, { error: "Informe o título." }).max(160),
    slug: SLUG,
    plataforma: z.string().trim().min(1, { error: "Escolha a plataforma." }),
    produto_external_id: z.string().trim().max(120).default(""),
    descricao_verificada: z.string().trim().max(4000).default(""),
    publico_alvo: z.string().trim().max(400).default(""),
    affiliate_url: z.string().trim().min(1, { error: "Informe o link de afiliado." }),
    preco_referencia: centavosOpcional,
    preco_referencia_em: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v)),
    comissao_estimada: centavosOpcional,
    status_aprovacao: z.enum(["nao_solicitado", "pendente", "aprovado", "recusado"]),
    regras_divulgacao: z.string().trim().max(4000).default(""),
    fonte_verificacao: z.string().trim().max(400).default(""),
    ativo: z.boolean().default(false),
  })
  // A URL é validada contra a plataforma escolhida, então precisa dos dois
  // campos ao mesmo tempo — por isso vive aqui e não no campo isolado.
  .superRefine((dados, ctx) => {
    const r = analisarUrlAfiliado(dados.affiliate_url, dados.plataforma);
    if (!r.ok) {
      ctx.addIssue({
        code: "custom",
        path: ["affiliate_url"],
        message: EXPLICACAO_RECUSA[r.motivo ?? "malformada"],
      });
    }

    if (dados.preco_referencia !== null && !dados.preco_referencia_em) {
      ctx.addIssue({
        code: "custom",
        path: ["preco_referencia_em"],
        message:
          "Informe a data em que esse preço foi conferido. Preço sem data não permite ao visitante julgar se ainda vale.",
      });
    }

    // Espelha o CHECK do banco. A validação aqui existe para dar uma mensagem
    // legível; a garantia continua sendo a constraint.
    if (dados.ativo) {
      if (dados.status_aprovacao !== "aprovado") {
        ctx.addIssue({
          code: "custom",
          path: ["ativo"],
          message: "Só é possível ativar um produto com afiliação aprovada.",
        });
      }
      if (dados.fonte_verificacao.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["fonte_verificacao"],
          message:
            "Para ativar, registre onde você conferiu a afiliação (ex.: print do painel, data).",
        });
      }
    }
  });

export type ProdutoEntradaSaida = z.output<typeof ProdutoEntrada>;

export const ClaimEntrada = z
  .object({
    product_id: z.uuid(),
    afirmacao: z
      .string()
      .trim()
      .min(1, { error: "Escreva a afirmação." })
      .max(400),
    tipo: z.enum([
      "conteudo",
      "garantia",
      "preco",
      "suporte",
      "bonus",
      "requisito",
      "outro",
    ]),
    fonte: z.string().trim().max(400).default(""),
    ativo: z.boolean().default(false),
  })
  .superRefine((dados, ctx) => {
    if (dados.ativo && dados.fonte.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["fonte"],
        message:
          "Uma afirmação só fica citável com a fonte registrada. É o que impede o atendente de inventar garantia ou bônus.",
      });
    }
  });

/** Primeira mensagem de erro por campo, no formato que os formulários usam. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = issue.path.join(".") || "_";
    if (!(campo in saida)) saida[campo] = issue.message;
  }
  return saida;
}
