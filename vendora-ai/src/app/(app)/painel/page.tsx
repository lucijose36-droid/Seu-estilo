import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import Metrica from "@/components/dominio/Metrica";
import Aviso from "@/components/ui/Aviso";
import { estiloBotao } from "@/components/ui/Botao";
import { formatarCentavos } from "@/lib/dinheiro";
import { obterMetricas } from "@/server/dal/painel";
import { listarProdutos } from "@/server/dal/produtos";
import { listarCampanhas } from "@/server/dal/campanhas";
import { supabaseConfigurado } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

const DIAS = 30;

export default async function Painel() {
  if (!supabaseConfigurado) return <ChecklistInicial passos={PASSOS_VAZIOS} />;

  const [m, produtos, campanhas] = await Promise.all([
    obterMetricas(DIAS),
    listarProdutos(),
    listarCampanhas(),
  ]);

  const temProdutoAtivo = produtos.some((p) => p.ativo);
  const passos = [
    { titulo: "Cadastrar produto aprovado", descricao: "Afiliação aprovada e link oficial verificado.", concluido: produtos.length > 0 },
    { titulo: "Publicar a oferta", descricao: "Ativar o produto para a página pública responder.", concluido: temProdutoAtivo },
    { titulo: "Testar o CTA", descricao: "Conferir se o clique de saída é registrado.", concluido: m.cliquesSaida > 0 },
    { titulo: "Registrar campanha", descricao: "UTMs e orçamento autorizado.", concluido: campanhas.length > 0 },
  ];

  if (!m.temAlgumDado) return <ChecklistInicial passos={passos} />;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <p className="text-[13px] text-texto-suave">Últimos {DIAS} dias.</p>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-texto-suave">Alcance</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica rotulo="Visitantes" valor={String(m.visitantes)} procedencia="Sessões anônimas distintas na página pública." />
          <Metrica rotulo="Conversas" valor={String(m.conversas)} procedencia="Atendimentos iniciados com o assistente." />
          <Metrica rotulo="Cliques de saída" valor={String(m.cliquesSaida)} procedencia="Cliques no CTA. Clique não é venda." />
          <Metrica rotulo="Leads" valor={String(m.leads)} procedencia="Contatos registrados no período." />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-texto-suave">Comissões</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica rotulo="Comissões informadas" valor={formatarCentavos(m.comissoesInformadasCentavos)} procedencia="Relatadas, ainda sem comprovação da plataforma." />
          <Metrica rotulo="Comissões confirmadas" valor={formatarCentavos(m.comissoesConfirmadasCentavos)} procedencia="Confirmadas por relatório ou integração oficial." destaque="confirmado" />
          <Metrica rotulo="Comissões recebidas" valor={formatarCentavos(m.comissoesRecebidasCentavos)} procedencia="Valor efetivamente pago pela plataforma." destaque="confirmado" />
          <Metrica rotulo="Comissões revertidas" valor={formatarCentavos(m.comissoesRevertidasCentavos)} procedencia="Reembolso ou cancelamento registrado." />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-texto-suave">Custos e resultado</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica rotulo="Gastos registrados" valor={formatarCentavos(m.gastosRegistradosCentavos)} procedencia="Despesas lançadas por você. Nada é deduzido automaticamente." />
          <Metrica rotulo="Gastos pagos" valor={formatarCentavos(m.gastosPagosCentavos)} procedencia="Despesas marcadas como já pagas." />
          <Metrica rotulo="Resultado líquido estimado" valor={formatarCentavos(m.resultadoEstimadoCentavos)} procedencia="Confirmadas menos gastos registrados. É estimativa, não caixa." destaque="estimado" />
          <Metrica rotulo="Caixa realizado" valor={formatarCentavos(m.caixaRealizadoCentavos)} procedencia="Recebidas menos gastos pagos. Este é dinheiro de verdade." destaque="estimado" />
        </div>
      </section>

      <Aviso tom="info">
        Resultado estimado e caixa realizado são coisas diferentes e estão
        separados de propósito. Uma comissão confirmada pode ser revertida por
        reembolso antes de virar pagamento.
      </Aviso>
    </div>
  );
}

const PASSOS_VAZIOS = [
  { titulo: "Cadastrar produto aprovado", descricao: "Afiliação aprovada e link oficial verificado.", concluido: false },
  { titulo: "Publicar a oferta", descricao: "Ativar o produto para a página pública responder.", concluido: false },
  { titulo: "Testar o CTA", descricao: "Conferir se o clique de saída é registrado.", concluido: false },
  { titulo: "Registrar campanha", descricao: "UTMs e orçamento autorizado.", concluido: false },
];

function ChecklistInicial({
  passos,
}: {
  passos: { titulo: string; descricao: string; concluido: boolean }[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Cartao>
        <CabecalhoCartao
          titulo="Primeiros passos"
          descricao="O painel mostra números quando houver eventos reais registrados. Até lá, nada é preenchido com exemplo."
        />
        <ol className="space-y-3">
          {passos.map((p, i) => (
            <li key={p.titulo} className="flex gap-3">
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                {p.concluido ? (
                  <CheckCircle2 size={18} className="text-verde" />
                ) : (
                  <Circle size={18} className="text-texto-suave" />
                )}
              </span>
              <div>
                <p className="text-[14px] font-medium text-texto">
                  {i + 1}. {p.titulo}
                  {p.concluido && (
                    <span className="ml-2 text-[12px] font-normal text-verde-texto">feito</span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-texto-suave">{p.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex gap-3">
          <Link href="/produtos/novo" className={estiloBotao("primario")}>
            Cadastrar produto
          </Link>
          <Link href="/vendedor" className={estiloBotao("secundario")}>
            Testar o atendente
          </Link>
        </div>
      </Cartao>
    </div>
  );
}
