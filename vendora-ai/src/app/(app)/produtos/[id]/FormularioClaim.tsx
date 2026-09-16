"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Botao from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import Aviso from "@/components/ui/Aviso";
import { salvarClaim, type EstadoFormulario } from "@/server/actions/produtos";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "Salvando…" : "Registrar afirmação"}
    </Botao>
  );
}

export default function FormularioClaim({ productId }: { productId: string }) {
  const [estado, acao] = useActionState<EstadoFormulario, FormData>(salvarClaim, {});
  const erros = estado.erros ?? {};

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="product_id" value={productId} />

      {estado.mensagem && (
        <Aviso tom={estado.erros ? "erro" : "info"}>{estado.mensagem}</Aviso>
      )}

      <CampoTexto
        id="afirmacao"
        name="afirmacao"
        rotulo="Afirmação"
        ajuda="Escreva exatamente o que pode ser dito. Ex.: “O curso tem 42 aulas em vídeo.”"
        erro={erros.afirmacao}
        required
        obrigatorio
      />

      <div className="space-y-1.5">
        <label htmlFor="tipo" className="block text-[13px] font-medium text-texto">
          Tipo
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue="conteudo"
          className="w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-[14px] text-texto"
        >
          <option value="conteudo">Conteúdo</option>
          <option value="garantia">Garantia</option>
          <option value="preco">Preço</option>
          <option value="suporte">Suporte</option>
          <option value="bonus">Bônus</option>
          <option value="requisito">Requisito</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <CampoTexto
        id="fonte"
        name="fonte"
        rotulo="Fonte"
        ajuda="Onde você leu isso. Ex.: página oficial de vendas, seção “O que você vai aprender”, conferida em 16/09/2026."
        erro={erros.fonte}
      />

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="ativo"
          className="mt-0.5 h-4 w-4 rounded border-borda-forte accent-[var(--violeta)]"
        />
        <span>
          <span className="block text-[14px] font-medium text-texto">
            Pode ser citada pelo atendente
          </span>
          <span className="block text-[12.5px] leading-snug text-texto-suave">
            Exige fonte preenchida. O banco recusa o contrário.
          </span>
        </span>
      </label>

      <Enviar />
    </form>
  );
}
