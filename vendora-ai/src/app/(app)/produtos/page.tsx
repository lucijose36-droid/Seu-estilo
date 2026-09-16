import type { Metadata } from "next";
import { Package } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";

export const metadata: Metadata = { title: "Produtos" };

export default function Pagina() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Cartao preenchimento={false}>
        <EstadoVazio
          icone={<Package size={20} aria-hidden="true" />}
          titulo="Nenhum produto cadastrado"
          descricao="Cadastre o infoproduto do qual você já é afiliado aprovado. A Vendora AI exige status de afiliação e link oficial verificado antes de permitir a divulgação."
        />
      </Cartao>
      <p className="px-1 text-[12.5px] leading-relaxed text-texto-suave">
        Etapa 3 liga esta tela ao banco: cadastro, afirmações verificadas e bloqueio de link não autorizado.
      </p>
    </div>
  );
}
