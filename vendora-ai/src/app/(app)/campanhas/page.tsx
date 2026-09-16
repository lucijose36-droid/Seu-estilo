import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Campanhas" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<BarChart3 size={20} aria-hidden="true" />}
          titulo="Nenhuma campanha registrada"
          descricao="Campanhas guardam UTMs, orçamento autorizado e as despesas efetivamente lançadas. Gasto é sempre informado por você ou importado — nunca presumido pelo sistema."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Etapa 6 liga esta tela ao banco, junto com o painel de métricas.
      </p>
    </div>
  );
}
