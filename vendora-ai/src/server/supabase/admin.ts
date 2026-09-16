import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Cliente com service role: ignora RLS por completo.
 *
 * O `import "server-only"` no topo faz o build FALHAR se algum Client
 * Component importar este arquivo, direta ou indiretamente. E a diferenca
 * entre uma convencao ("ninguem importa isso no cliente") e uma garantia.
 *
 * A variavel nao tem prefixo NEXT_PUBLIC_, entao tambem nunca e embutida no
 * bundle do navegador.
 *
 * Usar apenas onde nao existe usuario autenticado para a RLS avaliar — hoje,
 * em nenhum lugar. A funcao existe para o dia em que houver webhook oficial
 * de plataforma de afiliados, e esta aqui documentada para que esse dia nao
 * vire uma improvisacao.
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !chave) return null;

  return createClient(SUPABASE_URL, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
