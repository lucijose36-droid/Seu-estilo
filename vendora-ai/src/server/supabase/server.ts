import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseConfigurado,
} from "@/lib/supabase/config";

/**
 * Cliente de servidor ligado aos cookies da requisicao. Continua usando a
 * chave anon de proposito: a RLS permanece valendo, e o servidor nao ganha
 * poderes que o usuario logado nao tenha.
 *
 * Devolve null quando o Supabase nao esta configurado, para a tela poder
 * mostrar o estado "nao configurado" em vez de quebrar.
 */
export async function criarClienteServidor() {
  if (!supabaseConfigurado) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          for (const { name, value, options } of cookiesParaGravar) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components nao podem gravar cookies. Quem renova a sessao
          // e o proxy (src/proxy.ts), entao ignorar aqui e o comportamento
          // correto, nao um erro engolido.
        }
      },
    },
  });
}
