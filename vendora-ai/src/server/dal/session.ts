import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/server/supabase/server";

export type Papel = "owner" | "admin" | "agent";

export interface Contexto {
  userId: string;
  email: string | null;
  orgId: string;
  orgNome: string;
  timezone: string;
  papel: Papel;
}

/**
 * Resolve usuario, organizacao e papel A PARTIR DA SESSAO.
 *
 * Um `org_id` que chega do navegador e um pedido, nao um fato: aceita-lo e o
 * vazamento classico de multi-tenant. Nenhuma funcao da DAL recebe org_id por
 * parametro — todas chamam esta funcao.
 *
 * `cache()` do React memoiza por requisicao, entao varios componentes podem
 * pedir o contexto sem multiplicar consultas.
 */
export const obterContexto = cache(async (): Promise<Contexto | null> => {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;

  // getUser() valida o token no servidor de auth. getSession() le o cookie,
  // que o cliente controla — nunca serve para decidir acesso.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("memberships")
    .select("org_id, role, organizations(nome, timezone)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const org = data.organizations as unknown as
    | { nome: string; timezone: string }
    | null;

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: data.org_id as string,
    orgNome: org?.nome ?? "Minha organização",
    timezone: org?.timezone ?? "America/Sao_Paulo",
    papel: data.role as Papel,
  };
});

/** Para paginas que exigem login. Redireciona quando nao ha sessao valida. */
export async function exigirContexto(): Promise<Contexto> {
  const ctx = await obterContexto();
  if (!ctx) redirect("/entrar");
  return ctx;
}

/**
 * Hierarquia de papeis. `agent` atende e le o necessario; `admin` gerencia
 * produtos e campanhas; `owner` gerencia equipe e credenciais.
 *
 * A checagem existe em DUAS camadas de proposito: aqui, para a interface nao
 * oferecer o que a pessoa nao pode fazer, e na RLS do banco, que e quem de
 * fato impede. Interface escondida nao e controle de acesso.
 */
const FORCA: Record<Papel, number> = { agent: 1, admin: 2, owner: 3 };

export function podeAoMenos(papel: Papel, minimo: Papel): boolean {
  return FORCA[papel] >= FORCA[minimo];
}

export async function exigirPapel(minimo: Papel): Promise<Contexto> {
  const ctx = await exigirContexto();
  if (!podeAoMenos(ctx.papel, minimo)) redirect("/painel?erro=sem-permissao");
  return ctx;
}
