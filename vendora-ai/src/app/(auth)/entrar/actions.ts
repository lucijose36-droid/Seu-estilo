"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { criarClienteServidor } from "@/server/supabase/server";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { destinoSeguro } from "@/lib/urls";

export interface EstadoEntrada {
  erro?: string;
}

const Entrada = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(8, { error: "A senha precisa ter ao menos 8 caracteres." }),
  proximo: z.string().optional(),
});

/**
 * Server Action de login.
 *
 * Server Actions sao alcancaveis por POST direto, nao so pelo formulario —
 * por isso a validacao acontece aqui no servidor, e nao apenas no campo.
 */
export async function entrar(
  _anterior: EstadoEntrada,
  formData: FormData,
): Promise<EstadoEntrada> {
  if (!supabaseConfigurado) {
    return { erro: "Conexão com o banco ainda não configurada neste ambiente." };
  }

  const analisado = Entrada.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    proximo: formData.get("proximo") ?? undefined,
  });

  if (!analisado.success) {
    return { erro: analisado.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await criarClienteServidor();
  if (!supabase) {
    return { erro: "Conexão com o banco ainda não configurada neste ambiente." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: analisado.data.email,
    password: analisado.data.senha,
  });

  if (error) {
    // Mensagem unica para credencial errada: distinguir "e-mail nao existe" de
    // "senha errada" entrega a terceiros a lista de quem tem conta.
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect(destinoSeguro(analisado.data.proximo));
}
