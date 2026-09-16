/**
 * Leitura central da configuracao do Supabase.
 *
 * O app precisa continuar buildando e navegavel sem credenciais — durante o
 * desenvolvimento, em preview e enquanto o projeto Supabase nao existe. Por
 * isso nada aqui lanca excecao na importacao: quem precisa de conexao real
 * consulta `supabaseConfigurado` antes e mostra um estado explicito quando
 * falta configuracao, em vez de estourar uma tela branca.
 *
 * Apenas chaves publicas moram aqui. A service role NAO passa por este
 * arquivo — ela vive em src/server/supabase/admin.ts, que e server-only.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigurado =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** Mensagem unica, para nao escrever a mesma explicacao em cinco telas. */
export const MSG_SEM_SUPABASE =
  "Conexao com o banco ainda nao configurada. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.";
