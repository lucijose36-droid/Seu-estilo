import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import Tag from "@/components/ui/Tag";
import Aviso from "@/components/ui/Aviso";
import { listarClaims, obterProduto } from "@/server/dal/produtos";
import { supabaseConfigurado } from "@/lib/supabase/config";
import FormularioProduto from "../FormularioProduto";
import FormularioClaim from "./FormularioClaim";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!supabaseConfigurado) {
    return (
      <div className="mx-auto max-w-3xl">
        <Aviso tom="atencao" titulo="Banco não configurado">
          Não é possível carregar o produto neste ambiente.
        </Aviso>
      </div>
    );
  }

  const produto = await obterProduto(id);
  if (!produto) notFound();

  const claims = await listarClaims(id);
  const citaveis = claims.filter((c) => c.ativo).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <FormularioProduto produto={produto} />

      <Cartao>
        <CabecalhoCartao
          titulo="Afirmações verificadas"
          descricao="O atendente automatizado só pode dizer o que estiver aqui, ativo e com fonte. É o que impede garantia ou bônus de nascer do nada."
        />

        {claims.length === 0 ? (
          <p className="text-[13px] text-texto-suave">
            Nenhuma afirmação registrada. Sem elas, o atendente responde apenas com
            a descrição verificada e encaminha o resto para atendimento humano.
          </p>
        ) : (
          <ul className="space-y-2">
            {claims.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-borda px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13.5px] leading-snug text-texto">{c.afirmacao}</p>
                  <Tag tom={c.ativo ? "confirmado" : "neutro"}>
                    {c.ativo ? "Citável" : "Não citável"}
                  </Tag>
                </div>
                <p className="mt-1 text-[12px] text-texto-suave">
                  {c.tipo}
                  {c.fonte ? ` · fonte: ${c.fonte}` : " · sem fonte registrada"}
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[12.5px] text-texto-suave">
          {citaveis} de {claims.length} podem ser citadas pelo atendente.
        </p>

        <div className="mt-5 border-t border-borda pt-5">
          <FormularioClaim productId={id} />
        </div>
      </Cartao>
    </div>
  );
}
