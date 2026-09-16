import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseConfigurado,
} from "@/lib/supabase/config";

/**
 * Next 16 renomeou `middleware.ts` para `proxy.ts`. A funcao exportada tem de
 * se chamar `proxy` (ou ser o export default). A documentacao do Supabase
 * ainda mostra `middleware.ts`: copiar aquele exemplo aqui resultaria em um
 * arquivo que o Next simplesmente nao carrega, e a sessao nunca renovaria.
 *
 * Responsabilidade unica: renovar a sessao e fazer uma checagem OTIMISTA de
 * rota. A autorizacao de verdade acontece na DAL, a cada leitura de dado —
 * conforme a propria documentacao do Next recomenda, proxy nao e solucao de
 * autorizacao.
 */
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  if (!supabaseConfigurado) return resposta;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar) {
        for (const { name, value } of cookiesParaGravar) {
          request.cookies.set(name, value);
        }
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of cookiesParaGravar) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalida o token no servidor de auth. getSession() apenas le o
  // cookie, que o cliente controla — nao serve para decidir acesso.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const ehAreaLogada = AREAS_LOGADAS.some(
    (p) => caminho === p || caminho.startsWith(`${p}/`),
  );

  if (!user && ehAreaLogada) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    // Preserva o destino para devolver o usuario ao lugar certo apos entrar.
    destino.searchParams.set("proximo", caminho);
    return NextResponse.redirect(destino);
  }

  if (user && caminho === "/entrar") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/painel";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

const AREAS_LOGADAS = [
  "/painel",
  "/produtos",
  "/campanhas",
  "/vendedor",
  "/conversas",
  "/comissoes",
  "/configuracoes",
];

export const config = {
  matcher: [
    /*
     * Tudo, menos estaticos e imagens. As rotas publicas (/oferta, /go)
     * passam por aqui de proposito: elas nao exigem login, mas precisam da
     * sessao renovada caso quem navegue ja esteja logado.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
