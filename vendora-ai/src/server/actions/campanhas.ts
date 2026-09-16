"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { criarClienteServidor } from "@/server/supabase/server";
import { exigirContexto, podeAoMenos } from "@/server/dal/session";
import { errosPorCampo } from "@/lib/schemas";
import { paraCentavos } from "@/lib/dinheiro";
import type { EstadoFormulario } from "./produtos";

const dinheiro = z
  .string()
  .trim()
  .transform((v) => (v === "" ? "0" : v))
  .refine((v) => paraCentavos(v) !== null, { error: "Valor inválido. Use 1.234,56." })
  .transform((v) => paraCentavos(v)!)
  .refine((v) => v >= 0, { error: "O valor não pode ser negativo." });

const CampanhaEntrada = z.object({
  nome: z.string().trim().min(1, { error: "Informe o nome." }).max(120),
  canal: z.enum(["organico", "meta_ads", "google_ads", "tiktok_ads", "email", "outro"]),
  utm_source: z.string().trim().max(200).default(""),
  utm_medium: z.string().trim().max(200).default(""),
  utm_campaign: z.string().trim().max(200).default(""),
  orcamento_limite: dinheiro,
  status: z.enum(["rascunho", "ativa", "pausada", "encerrada"]),
});

export async function salvarCampanha(
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, "admin")) {
    return { mensagem: "Seu papel não permite gerenciar campanhas." };
  }

  const analisado = CampanhaEntrada.safeParse({
    nome: fd.get("nome") ?? "",
    canal: fd.get("canal") ?? "organico",
    utm_source: fd.get("utm_source") ?? "",
    utm_medium: fd.get("utm_medium") ?? "",
    utm_campaign: fd.get("utm_campaign") ?? "",
    orcamento_limite: fd.get("orcamento_limite") ?? "",
    status: fd.get("status") ?? "rascunho",
  });
  if (!analisado.success) return { erros: errosPorCampo(analisado.error) };
  const d = analisado.data;

  const supabase = await criarClienteServidor();
  if (!supabase) return { mensagem: "Banco não configurado neste ambiente." };

  const { error } = await supabase.from("campaigns").insert({
    org_id: ctx.orgId,
    nome: d.nome,
    canal: d.canal,
    utm_source: d.utm_source,
    utm_medium: d.utm_medium,
    utm_campaign: d.utm_campaign,
    orcamento_limite_centavos: d.orcamento_limite,
    status: d.status,
  });
  if (error) return { mensagem: error.message };

  revalidatePath("/campanhas");
  return { mensagem: "Campanha registrada." };
}

const DespesaEntrada = z.object({
  campaign_id: z.string().trim(),
  categoria: z.enum(["anuncios", "ferramenta", "api", "dominio", "hospedagem", "outro"]),
  descricao: z.string().trim().max(400).default(""),
  valor: dinheiro.refine((v) => v > 0, { error: "Informe um valor maior que zero." }),
  ocorrido_em: z.string().trim().min(1, { error: "Informe a data." }),
  pago: z.boolean().default(true),
});

/**
 * Registro de despesa.
 *
 * O sistema nunca deduz gasto sozinho, nem lê painel de anúncio: o que entra
 * aqui é o que você lançou. Um número de gasto inferido seria pior do que
 * nenhum, porque entraria no resultado líquido parecendo verificado.
 */
export async function registrarDespesa(
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, "admin")) {
    return { mensagem: "Seu papel não permite registrar despesas." };
  }

  const analisado = DespesaEntrada.safeParse({
    campaign_id: fd.get("campaign_id") ?? "",
    categoria: fd.get("categoria") ?? "anuncios",
    descricao: fd.get("descricao") ?? "",
    valor: fd.get("valor") ?? "",
    ocorrido_em: fd.get("ocorrido_em") ?? "",
    pago: fd.get("pago") !== "nao",
  });
  if (!analisado.success) return { erros: errosPorCampo(analisado.error) };
  const d = analisado.data;

  const supabase = await criarClienteServidor();
  if (!supabase) return { mensagem: "Banco não configurado neste ambiente." };

  const { error } = await supabase.from("expense_records").insert({
    org_id: ctx.orgId,
    campaign_id: d.campaign_id || null,
    categoria: d.categoria,
    descricao: d.descricao,
    valor_centavos: d.valor,
    ocorrido_em: d.ocorrido_em,
    pago: d.pago,
  });
  if (error) return { mensagem: error.message };

  revalidatePath("/campanhas");
  revalidatePath("/painel");
  return { mensagem: "Despesa registrada." };
}
