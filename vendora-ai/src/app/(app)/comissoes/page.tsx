import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Tag, { type TomTag } from "@/components/ui/Tag";
import Aviso from "@/components/ui/Aviso";
import { formatarCentavos } from "@/lib/dinheiro";
import { ROTULO_COMISSAO, type StatusComissao } from "@/lib/tipos";
import { listarComissoes } from "@/server/dal/comissoes";
import { supabaseConfigurado } from "@/lib/supabase/config";
import Importador from "./Importador";

export const metadata: Metadata = { title: "Comissões" };
export const dynamic = "force-dynamic";

const TOM: Record<StatusComissao, TomTag> = {
  reported: "andamento",
  confirmed: "confirmado",
  received: "confirmado",
  reversed: "revertido",
  unknown: "neutro",
};

export default async function Comissoes() {
  if (!supabaseConfigurado) {
    return (
      <div className="mx-auto max-w-5xl">
        <Aviso tom="atencao" titulo="Banco não configurado">
          As comissões aparecem aqui depois de configurar o Supabase.
        </Aviso>
      </div>
    );
  }

  const comissoes = await listarComissoes();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Aviso tom="info">
        Uma informação de venda não é confirmação da plataforma, e confirmação
        não é dinheiro recebido. Os quatro estados ficam separados de propósito.
      </Aviso>

      {comissoes.length === 0 ? (
        <Cartao preenchimento={false}>
          <EstadoVazio
            icone={<Receipt size={20} aria-hidden="true" />}
            titulo="Nenhuma comissão registrada"
            descricao="Importe o relatório da plataforma para conciliar. Nenhum valor é inferido a partir de cliques ou conversas."
          />
        </Cartao>
      ) : (
        <Cartao preenchimento={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Comissões registradas</caption>
              <thead>
                <tr className="border-b border-borda text-[12px] text-texto-suave">
                  <th scope="col" className="px-4 py-2.5 font-medium">Data</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Plataforma</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Transação</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Valor</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Situação</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Origem</th>
                </tr>
              </thead>
              <tbody>
                {comissoes.map((c) => (
                  <tr key={c.id} className="border-b border-borda last:border-0">
                    <td className="num px-4 py-2.5 text-texto-suave">{c.data_evento}</td>
                    <td className="px-4 py-2.5 text-texto">{c.plataforma}</td>
                    <td className="num px-4 py-2.5 text-texto-suave">
                      {c.external_transaction_id ?? "—"}
                    </td>
                    <td className="num px-4 py-2.5 text-right font-medium text-texto">
                      {formatarCentavos(c.valor_centavos, c.moeda)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Tag tom={TOM[c.status]}>{ROTULO_COMISSAO[c.status]}</Tag>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-texto-suave">
                      {c.source_type === "importacao_csv" ? "Importação" : "Manual"}
                      {c.source_reference && ` · ${c.source_reference}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}

      <Importador />
    </div>
  );
}
