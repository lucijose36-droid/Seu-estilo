import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Comissões" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<Receipt size={20} aria-hidden="true" />}
          titulo="Nenhuma comissão registrada"
          descricao="Importe o relatório da plataforma para conciliar. Uma venda informada não vira comissão confirmada sem comprovação da própria plataforma."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Etapa 7 traz importação de CSV com deduplicação e os estados informada, confirmada, recebida e revertida.
      </p>
    </div>
  );
}
