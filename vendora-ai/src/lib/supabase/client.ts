"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from "./config";

/**
 * Cliente do navegador. Usa a chave anon, entao tudo o que ele enxerga passa
 * obrigatoriamente pela RLS. Nenhuma consulta feita por aqui pode ser tratada
 * como autorizada por si so.
 */
export function criarClienteNavegador() {
  if (!supabaseConfigurado) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
