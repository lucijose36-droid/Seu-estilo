import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/server/supabase/server";

/**
 * Sair via POST, nunca GET: um GET que encerra sessao pode ser disparado por
 * qualquer <img> em outro site e derrubaria o usuario sem que ele pedisse.
 */
export async function POST(request: NextRequest) {
  const supabase = await criarClienteServidor();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/entrar", request.url), { status: 303 });
}
