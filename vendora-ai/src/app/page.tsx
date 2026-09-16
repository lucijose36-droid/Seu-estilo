import { redirect } from "next/navigation";
import { obterContexto } from "@/server/dal/session";

/**
 * Raiz. Ainda nao existe site publico de marketing — quem chega vai para o
 * painel se estiver logado, ou para a tela de entrada.
 */
export default async function Raiz() {
  const ctx = await obterContexto();
  redirect(ctx ? "/painel" : "/entrar");
}
