import { NextResponse, type NextRequest } from "next/server";
import { registrarCliqueSaida } from "@/server/dal/publico";
import { analisarUrlAfiliado } from "@/lib/afiliado/plataformas";
import { COOKIE_SESSAO_ANONIMA, lerUtms, novoId } from "@/lib/rastreio";

export const dynamic = "force-dynamic";

/**
 * Redirecionamento de saída para a plataforma do produtor.
 *
 * Esta é a rota mais perigosa da aplicação. Um redirecionador que aceite o
 * destino pela URL vira ferramenta de phishing de terceiros: o atacante manda
 * `/go/x?url=https://banco-falso` e o link, para a vítima, parece ser do
 * nosso domínio.
 *
 * Três regras, nesta ordem:
 *
 *   1. O destino vem SEMPRE do banco, a partir do id do produto. Nenhum
 *      parâmetro da requisição participa da escolha — e os que existirem são
 *      simplesmente ignorados, não "sanitizados".
 *   2. Antes de redirecionar, a URL vinda do banco é revalidada contra a
 *      lista de domínios da plataforma. O CHECK do banco garante https bem
 *      formada, mas não o hostname; sem esta segunda checagem, uma linha
 *      ruim no banco (migração antiga, edição manual, importação futura)
 *      viraria redirecionador aberto.
 *   3. Se qualquer coisa não bater, respondemos com erro. Nunca com um
 *      redirecionamento "de reserva".
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return erro("Link inválido.", 400);
  }

  const utms = lerUtms(request.nextUrl.searchParams);

  // Sessão anônima: reaproveita o cookie se existir, para o mesmo visitante
  // não ser contado como vários.
  const sidExistente = request.cookies.get(COOKIE_SESSAO_ANONIMA)?.value;
  const sid = sidExistente && sidExistente.length >= 8 ? sidExistente : novoId();

  let clique: Awaited<ReturnType<typeof registrarCliqueSaida>>;
  try {
    clique = await registrarCliqueSaida(id, sid, novoId(), utms.utm_campaign);
  } catch {
    return erro("Não foi possível processar este link agora.", 503);
  }

  if (!clique) {
    // Produto inexistente ou inativo. A mesma resposta para os dois casos:
    // distinguir revelaria quais ids existem.
    return erro("Esta oferta não está disponível.", 404);
  }

  // --- regra 2: revalidação antes de redirecionar --------------------------
  // Contra a lista de domínios DA PLATAFORMA DO PRODUTO, não contra
  // "qualquer plataforma conhecida".
  const conferida = analisarUrlAfiliado(clique.destino, clique.plataforma);
  if (!conferida.ok || !conferida.normalizada) {
    console.error(
      "[go] destino gravado reprovado na revalidação; redirecionamento recusado",
      { produto: id, motivo: conferida.motivo },
    );
    return erro("Esta oferta está com o link inválido e foi bloqueada.", 409);
  }

  const resposta = NextResponse.redirect(conferida.normalizada, { status: 302 });

  if (!sidExistente) {
    resposta.cookies.set(COOKIE_SESSAO_ANONIMA, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // Não deixa o destino nem o referer vazarem pelo histórico de cache.
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}

function erro(mensagem: string, status: number) {
  return new NextResponse(mensagem, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
