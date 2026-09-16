import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Tag from "@/components/ui/Tag";
import Aviso from "@/components/ui/Aviso";
import { formatarCentavos } from "@/lib/dinheiro";
import { listarCampanhas } from "@/server/dal/campanhas";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { FormularioCampanha, FormularioDespesa } from "./Formularios";

export const metadata: Metadata = { title: "Campanhas" };
export const dynamic = "force-dynamic";

export default async function Campanhas() {
  if (!supabaseConfigurado) {
    return (
      <div className="mx-auto max-w-5xl">
        <Aviso tom="atencao" titulo="Banco não configurado">
          As campanhas aparecem aqui depois de configurar o Supabase.
        </Aviso>
      </div>
    );
  }

  const campanhas = await listarCampanhas();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {campanhas.length === 0 ? (
        <Cartao preenchimento={false}>
          <EstadoVazio
            icone={<BarChart3 size={20} aria-hidden="true" />}
            titulo="Nenhuma campanha registrada"
            descricao="Campanhas guardam UTMs, o orçamento que você autorizou e as despesas efetivamente lançadas."
          />
        </Cartao>
      ) : (
        <ul className="space-y-3">
          {campanhas.map((c) => {
            const estourou =
              c.orcamento_limite_centavos > 0 &&
              c.gastoRegistradoCentavos > c.orcamento_limite_centavos;
            return (
              <li key={c.id} className="rounded-xl border border-borda bg-superficie p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-texto">{c.nome}</p>
                    <p className="mt-0.5 text-[12.5px] text-texto-suave">
                      {c.canal}
                      {c.utm_campaign && ` · utm_campaign=${c.utm_campaign}`}
                    </p>
                  </div>
                  <Tag tom={c.status === "ativa" ? "info" : "neutro"}>{c.status}</Tag>
                </div>
                <dl className="num mt-3 grid grid-cols-3 gap-3 border-t border-borda pt-3 text-[13px]">
                  <div>
                    <dt className="text-[12px] text-texto-suave">Cliques de saída</dt>
                    <dd className="font-medium text-texto">{c.cliques}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-texto-suave">Gasto registrado</dt>
                    <dd className={estourou ? "font-medium text-vermelho-texto" : "font-medium text-texto"}>
                      {formatarCentavos(c.gastoRegistradoCentavos)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-texto-suave">Orçamento autorizado</dt>
                    <dd className="font-medium text-texto">
                      {formatarCentavos(c.orcamento_limite_centavos)}
                    </dd>
                  </div>
                </dl>
                {estourou && (
                  <p className="mt-2 text-[12.5px] text-vermelho-texto">
                    O gasto lançado passou do orçamento autorizado.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <FormularioCampanha />
        <FormularioDespesa campanhas={campanhas.map((c) => ({ id: c.id, nome: c.nome }))} />
      </div>
    </div>
  );
}
