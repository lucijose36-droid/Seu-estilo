"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/server/supabase/server";
import { exigirContexto, podeAoMenos } from "@/server/dal/session";
import { ClaimEntrada, ProdutoEntrada, errosPorCampo } from "@/lib/schemas";
import { analisarUrlAfiliado } from "@/lib/afiliado/plataformas";

export interface EstadoFormulario {
  erros?: Record<string, string>;
  mensagem?: string;
}

function lerBooleano(fd: FormData, campo: string) {
  return fd.get(campo) === "on" || fd.get(campo) === "true";
}

/**
 * Cria ou atualiza um produto de afiliado.
 *
 * Server Actions são alcançáveis por POST direto, não apenas pelo formulário.
 * Por isso a autorização é verificada AQUI, e não só no fato de a tela ter
 * sido renderizada para alguém com permissão.
 */
export async function salvarProduto(
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, "admin")) {
    return { mensagem: "Seu papel não permite cadastrar produtos." };
  }

  const analisado = ProdutoEntrada.safeParse({
    titulo: fd.get("titulo") ?? "",
    slug: fd.get("slug") ?? "",
    plataforma: fd.get("plataforma") ?? "",
    produto_external_id: fd.get("produto_external_id") ?? "",
    descricao_verificada: fd.get("descricao_verificada") ?? "",
    publico_alvo: fd.get("publico_alvo") ?? "",
    affiliate_url: fd.get("affiliate_url") ?? "",
    preco_referencia: fd.get("preco_referencia") ?? "",
    preco_referencia_em: fd.get("preco_referencia_em") ?? "",
    comissao_estimada: fd.get("comissao_estimada") ?? "",
    status_aprovacao: fd.get("status_aprovacao") ?? "nao_solicitado",
    regras_divulgacao: fd.get("regras_divulgacao") ?? "",
    fonte_verificacao: fd.get("fonte_verificacao") ?? "",
    ativo: lerBooleano(fd, "ativo"),
  });

  if (!analisado.success) {
    return { erros: errosPorCampo(analisado.error) };
  }
  const d = analisado.data;

  // Grava a URL NORMALIZADA pelo parser, não o texto cru digitado. Assim o
  // que vai para o banco é exatamente o que foi validado.
  const url = analisarUrlAfiliado(d.affiliate_url, d.plataforma);
  if (!url.ok || !url.normalizada) {
    return { erros: { affiliate_url: "Link de afiliado inválido." } };
  }

  const supabase = await criarClienteServidor();
  if (!supabase) return { mensagem: "Banco não configurado neste ambiente." };

  const linha = {
    org_id: ctx.orgId,
    titulo: d.titulo,
    slug: d.slug,
    plataforma: d.plataforma,
    produto_external_id: d.produto_external_id || null,
    descricao_verificada: d.descricao_verificada,
    publico_alvo: d.publico_alvo,
    preco_referencia_centavos: d.preco_referencia,
    preco_referencia_em: d.preco_referencia_em,
    comissao_estimada_centavos: d.comissao_estimada,
    affiliate_url: url.normalizada,
    status_aprovacao: d.status_aprovacao,
    regras_divulgacao: d.regras_divulgacao,
    fonte_verificacao: d.fonte_verificacao,
    verificado_at: d.fonte_verificacao ? new Date().toISOString() : null,
    ativo: d.ativo,
  };

  const id = (fd.get("id") as string | null) || null;

  const { error } = id
    ? await supabase
        .from("affiliate_products")
        .update(linha)
        .eq("id", id)
        .eq("org_id", ctx.orgId)
    : await supabase.from("affiliate_products").insert(linha);

  if (error) {
    // 23505 = violação de unicidade; aqui só pode ser o slug.
    if (error.code === "23505") {
      return { erros: { slug: "Já existe um produto com este endereço." } };
    }
    // 23514 = CHECK. Significa que a interface deixou passar algo que o banco
    // barrou — o banco é a garantia, e a mensagem diz o que aconteceu.
    if (error.code === "23514") {
      return {
        mensagem:
          "O banco recusou: produto só fica ativo com afiliação aprovada, data de verificação e fonte registrada.",
      };
    }
    return { mensagem: error.message };
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function salvarClaim(
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, "admin")) {
    return { mensagem: "Seu papel não permite editar afirmações." };
  }

  const analisado = ClaimEntrada.safeParse({
    product_id: fd.get("product_id") ?? "",
    afirmacao: fd.get("afirmacao") ?? "",
    tipo: fd.get("tipo") ?? "conteudo",
    fonte: fd.get("fonte") ?? "",
    ativo: lerBooleano(fd, "ativo"),
  });

  if (!analisado.success) return { erros: errosPorCampo(analisado.error) };
  const d = analisado.data;

  const supabase = await criarClienteServidor();
  if (!supabase) return { mensagem: "Banco não configurado neste ambiente." };

  const { error } = await supabase.from("product_claims").insert({
    org_id: ctx.orgId,
    product_id: d.product_id,
    afirmacao: d.afirmacao,
    tipo: d.tipo,
    fonte: d.fonte,
    verificado_at: d.fonte ? new Date().toISOString() : null,
    ativo: d.ativo,
  });

  if (error) return { mensagem: error.message };

  revalidatePath(`/produtos/${d.product_id}`);
  return { mensagem: "Afirmação registrada." };
}
