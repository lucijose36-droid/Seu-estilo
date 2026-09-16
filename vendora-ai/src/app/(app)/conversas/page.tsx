import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Conversas" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<MessagesSquare size={20} aria-hidden="true" />}
          titulo="Nenhuma conversa registrada"
          descricao="O histórico aparece aqui quando alguém falar com o atendente automatizado, com a opção de assumir o atendimento manualmente."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Etapa 5 registra as conversas; a retenção segue a política de privacidade definida em Configurações.
      </p>
    </div>
  );
}
