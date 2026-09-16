import type { Metadata } from "next";
import { Bot } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Vendedor" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<Bot size={20} aria-hidden="true" />}
          titulo="Simulador ainda não configurado"
          descricao="Aqui você conversa com o atendente automatizado e vê, ao lado, quais afirmações verificadas ele consultou e o que o validador aprovou ou reprovou."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Etapa 5 traz o motor por regras, o validador e o encaminhamento para atendimento humano. Sem custo por token nesta fase.
      </p>
    </div>
  );
}
