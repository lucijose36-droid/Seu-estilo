import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import Wordmark from "@/components/marca/Wordmark";
import { estiloBotao } from "@/components/ui/Botao";
import { formatarCentavos } from "@/lib/dinheiro";
import { lerUtms } from "@/lib/rastreio";
import { listarClaimsPublicas, obterOfertaPublica } from "@/server/dal/publico";
import { supabaseConfigurado } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!supabaseConfigurado) return { title: "Oferta" };
  const oferta = await obterOfertaPublica(slug);
  return {
    title: oferta?.titulo ?? "Oferta",
    // Página de divulgação de afiliado não deve disputar busca com a página
    // oficial do produtor, e várias plataformas proíbem isso nas regras de
    // divulgação. Sair do índice é a escolha segura por padrão.
    robots: { index: false, follow: false },
  };
}

export default async function PaginaOferta({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  if (!supabaseConfigurado) notFound();

  const oferta = await obterOfertaPublica(slug);
  if (!oferta) notFound();

  const claims = await listarClaimsPublicas(oferta.id);
  const utms = lerUtms(sp);
  const consulta = new URLSearchParams(
    Object.entries(utms).filter(([, v]) => v !== ""),
  ).toString();
  const destino = `/go/${oferta.id}${consulta ? `?${consulta}` : ""}`;

  return (
    <main className="mx-auto max-w-[680px] px-5 py-10">
      <Wordmark tamanho="sm" />

      {/* Aviso de afiliação ANTES do conteúdo, não em rodapé cinza. Quem lê a
          página precisa saber de quem é a recomendação antes de ser
          convencido por ela. */}
      <p className="mt-6 rounded-lg border border-borda bg-superficie px-4 py-3 text-[12.5px] leading-relaxed text-texto-suave">
        Esta é uma página de divulgação. Somos afiliados e podemos receber
        comissão se você comprar pelo link abaixo, sem custo adicional para
        você. A venda, o pagamento e a entrega são feitos pela{" "}
        {oferta.plataforma}, não por nós.
      </p>

      <h1 className="mt-8 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-marinho">
        {oferta.titulo}
      </h1>

      {oferta.publico_alvo && (
        <p className="mt-3 text-[15px] leading-relaxed text-texto-suave">
          {oferta.publico_alvo}
        </p>
      )}

      {oferta.descricao_verificada && (
        <div className="mt-6 text-[15px] leading-relaxed whitespace-pre-line text-texto">
          {oferta.descricao_verificada}
        </div>
      )}

      {claims.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold text-texto">
            O que está confirmado sobre este produto
          </h2>
          <ul className="mt-3 space-y-2">
            {claims.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-borda bg-superficie px-4 py-3 text-[14px] leading-relaxed text-texto"
              >
                {c.afirmacao}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-texto-suave">
            Cada afirmação acima foi conferida na página oficial do produto.
            Nada além disso é afirmado aqui.
          </p>
        </section>
      )}

      {oferta.preco_referencia_centavos != null && (
        <p className="num mt-8 text-[14px] text-texto-suave">
          Preço de referência:{" "}
          <span className="font-medium text-texto">
            {formatarCentavos(oferta.preco_referencia_centavos, oferta.moeda)}
          </span>
          {oferta.preco_referencia_em && ` (conferido em ${oferta.preco_referencia_em})`}
          . O valor e as condições finais são os que aparecerem no checkout da{" "}
          {oferta.plataforma}.
        </p>
      )}

      <div className="mt-8">
        <a
          href={destino}
          rel="nofollow sponsored noopener"
          className={estiloBotao("primario")}
        >
          Conhecer a oferta na plataforma
          <ExternalLink size={16} aria-hidden="true" />
        </a>
        <p className="mt-2 text-[12px] text-texto-suave">
          Você será levado para a {oferta.plataforma}. O encaminhamento pode
          gerar comissão de afiliado.
        </p>
      </div>
    </main>
  );
}
