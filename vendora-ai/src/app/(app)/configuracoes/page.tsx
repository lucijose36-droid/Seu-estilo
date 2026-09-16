import type { Metadata } from "next";
import { Settings } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Configurações" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<Settings size={20} aria-hidden="true" />}
          titulo="Configurações ainda não disponíveis"
          descricao="Empresa, marca, mensagens do atendente, limites de custo, privacidade e provedores de IA ficam nesta tela."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Depende do banco (Etapa 2). O limite de gasto com IA nasce em zero: nenhum provedor pago é acionado sem você autorizar.
      </p>
    </div>
  );
}
