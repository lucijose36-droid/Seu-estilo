import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import { estiloBotao } from "@/components/ui/Botao";

export const metadata: Metadata = { title: "Painel" };

/**
 * Painel. Enquanto as etapas seguintes nao ligam as fontes de dados, esta
 * tela mostra o checklist de configuracao — nunca metrica de exemplo.
 * "Metricas reais ou estado vazio" e regra da identidade do produto.
 */
export default function Painel() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao>
        <CabecalhoCartao
          titulo="Primeiros passos"
          descricao="O painel começa a mostrar números quando houver eventos reais registrados."
        />
        <ol className="space-y-3">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-texto-suave" aria-hidden="true">
                {passo.concluido ? (
                  <CheckCircle2 size={18} className="text-verde" />
                ) : (
                  <Circle size={18} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-texto">
                  {i + 1}. {passo.titulo}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-texto-suave">
                  {passo.descricao}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <Link href="/produtos" className={estiloBotao("primario")}>
            Cadastrar produto aprovado
          </Link>
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo="O que este painel vai medir"
          descricao="Cada número tem origem declarada. Clique não é venda, e venda informada não é comissão recebida."
        />
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {METRICAS.map((m) => (
            <div key={m.rotulo} className="border-t border-borda pt-3">
              <dt className="text-[13.5px] font-medium text-texto">{m.rotulo}</dt>
              <dd className="mt-0.5 text-[12.5px] leading-snug text-texto-suave">
                {m.origem}
              </dd>
            </div>
          ))}
        </dl>
      </Cartao>
    </div>
  );
}

const PASSOS = [
  {
    titulo: "Cadastrar produto aprovado",
    descricao: "Só entra produto com afiliação confirmada e link oficial verificado.",
    concluido: false,
  },
  {
    titulo: "Publicar a oferta",
    descricao: "Página pública com aviso de afiliação e apenas afirmações verificadas.",
    concluido: false,
  },
  {
    titulo: "Testar o CTA",
    descricao: "Conferir se o clique de saída é registrado e leva ao link oficial correto.",
    concluido: false,
  },
  {
    titulo: "Registrar campanha",
    descricao: "UTMs e orçamento autorizado, com as despesas lançadas conforme ocorrerem.",
    concluido: false,
  },
];

const METRICAS = [
  { rotulo: "Visitantes", origem: "Sessões anônimas registradas na página pública." },
  { rotulo: "Conversas", origem: "Atendimentos iniciados com o vendedor automatizado." },
  { rotulo: "Cliques de saída", origem: "Cliques no CTA que levam à plataforma do produtor." },
  { rotulo: "Comissões informadas", origem: "Transações relatadas, ainda sem comprovação da plataforma." },
  { rotulo: "Comissões confirmadas", origem: "Confirmadas por relatório ou integração oficial." },
  { rotulo: "Comissões recebidas", origem: "Valor efetivamente pago pela plataforma." },
  { rotulo: "Gastos registrados", origem: "Despesas lançadas manualmente ou importadas." },
  { rotulo: "Resultado líquido estimado", origem: "Comissões confirmadas menos despesas registradas." },
];
