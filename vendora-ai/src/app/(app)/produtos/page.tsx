import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import Cartao from "@/components/ui/Cartao";
import EstadoVazio from "@/components/ui/EstadoVazio";
import Tag from "@/components/ui/Tag";
import { estiloBotao } from "@/components/ui/Botao";
import { formatarCentavos } from "@/lib/dinheiro";
import { listarProdutos } from "@/server/dal/produtos";
import { supabaseConfigurado } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Produtos" };

const ROTULO_APROVACAO = {
  nao_solicitado: { texto: "Afiliação não solicitada", tom: "neutro" },
  pendente: { texto: "Afiliação pendente", tom: "andamento" },
  aprovado: { texto: "Afiliação aprovada", tom: "confirmado" },
  recusado: { texto: "Afiliação recusada", tom: "revertido" },
} as const;

export default async function Produtos() {
  const produtos = supabaseConfigurado ? await listarProdutos() : [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-texto-suave">
          Só entra produto do qual você já é afiliado aprovado.
        </p>
        <Link href="/produtos/novo" className={estiloBotao("primario")}>
          Novo produto
        </Link>
      </div>

      {produtos.length === 0 ? (
        <Cartao preenchimento={false}>
          <EstadoVazio
            icone={<Package size={20} aria-hidden="true" />}
            titulo="Nenhum produto cadastrado"
            descricao="Cadastre o infoproduto do qual você já é afiliado aprovado. O sistema exige link oficial da plataforma e registro de como você verificou a afiliação."
            acao={
              <Link href="/produtos/novo" className={estiloBotao("primario")}>
                Cadastrar produto aprovado
              </Link>
            }
          />
        </Cartao>
      ) : (
        <ul className="space-y-3">
          {produtos.map((p) => {
            const aprov = ROTULO_APROVACAO[p.status_aprovacao];
            return (
              <li key={p.id}>
                <Link
                  href={`/produtos/${p.id}`}
                  className="block rounded-xl border border-borda bg-superficie p-4 transition-colors hover:border-borda-forte"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-texto">{p.titulo}</p>
                      <p className="mt-0.5 text-[12.5px] text-texto-suave">
                        {p.plataforma} · /oferta/{p.slug}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Tag tom={aprov.tom}>{aprov.texto}</Tag>
                      <Tag tom={p.ativo ? "info" : "neutro"}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </Tag>
                    </div>
                  </div>
                  {p.preco_referencia_centavos != null && (
                    <p className="num mt-2 text-[13px] text-texto-suave">
                      Preço de referência {formatarCentavos(p.preco_referencia_centavos)}
                      {p.preco_referencia_em && ` · conferido em ${p.preco_referencia_em}`}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
