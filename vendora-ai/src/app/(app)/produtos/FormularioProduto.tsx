"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Botao, { estiloBotao } from "@/components/ui/Botao";
import { CampoArea, CampoTexto } from "@/components/ui/Campo";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import Aviso from "@/components/ui/Aviso";
import { PLATAFORMAS } from "@/lib/afiliado/plataformas";
import { salvarProduto, type EstadoFormulario } from "@/server/actions/produtos";
import type { ProdutoAdmin } from "@/server/dal/produtos";

function Enviar({ novo }: { novo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "Salvando…" : novo ? "Cadastrar produto" : "Salvar alterações"}
    </Botao>
  );
}

export default function FormularioProduto({ produto }: { produto?: ProdutoAdmin }) {
  const [estado, acao] = useActionState<EstadoFormulario, FormData>(salvarProduto, {});
  const [plataforma, setPlataforma] = useState(produto?.plataforma ?? PLATAFORMAS[0]!.id);
  const [aprovacao, setAprovacao] = useState(produto?.status_aprovacao ?? "nao_solicitado");
  const erros = estado.erros ?? {};
  const novo = !produto;

  const dominios = PLATAFORMAS.find((p) => p.id === plataforma)?.dominios ?? [];

  return (
    <form action={acao} className="space-y-5">
      {produto && <input type="hidden" name="id" value={produto.id} />}

      {estado.mensagem && <Aviso tom="erro">{estado.mensagem}</Aviso>}

      <Cartao>
        <CabecalhoCartao
          titulo="Identificação"
          descricao="Como o produto aparece no seu painel e no endereço da página pública."
        />
        <div className="space-y-4">
          <CampoTexto
            id="titulo"
            name="titulo"
            rotulo="Título do produto"
            defaultValue={produto?.titulo}
            erro={erros.titulo}
            required
            obrigatorio
          />
          <CampoTexto
            id="slug"
            name="slug"
            rotulo="Endereço da página"
            ajuda="Vira /oferta/seu-endereco. Apenas minúsculas, números e hífen."
            defaultValue={produto?.slug}
            erro={erros.slug}
            required
            obrigatorio
          />
          <CampoArea
            id="publico_alvo"
            name="publico_alvo"
            rotulo="Para quem é"
            ajuda="Usado pelo atendente na triagem, para não recomendar a quem não serve."
            defaultValue={produto?.publico_alvo}
            erro={erros.publico_alvo}
          />
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo="Afiliação"
          descricao="O produto só pode ser ativado com afiliação aprovada e verificação registrada. Essa regra está no banco, não só nesta tela."
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="plataforma" className="block text-[13px] font-medium text-texto">
              Plataforma <span className="text-vermelho-texto">*</span>
            </label>
            <select
              id="plataforma"
              name="plataforma"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className="w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-[14px] text-texto"
            >
              {PLATAFORMAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <CampoTexto
            id="affiliate_url"
            name="affiliate_url"
            type="url"
            rotulo="Link oficial de afiliado"
            ajuda={`Precisa ser https e de um domínio da plataforma escolhida: ${dominios.join(", ")}. Um link fora dessa lista é recusado.`}
            defaultValue={produto?.affiliate_url}
            erro={erros.affiliate_url}
            required
            obrigatorio
            placeholder="https://"
          />

          <CampoTexto
            id="produto_external_id"
            name="produto_external_id"
            rotulo="Código do produto na plataforma"
            ajuda="Opcional. Ajuda a conciliar as comissões importadas depois."
            defaultValue={produto?.produto_external_id ?? ""}
            erro={erros.produto_external_id}
          />

          <div className="space-y-1.5">
            <label htmlFor="status_aprovacao" className="block text-[13px] font-medium text-texto">
              Status da afiliação <span className="text-vermelho-texto">*</span>
            </label>
            <select
              id="status_aprovacao"
              name="status_aprovacao"
              value={aprovacao}
              onChange={(e) => setAprovacao(e.target.value as typeof aprovacao)}
              className="w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-[14px] text-texto"
            >
              <option value="nao_solicitado">Não solicitada</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovada</option>
              <option value="recusado">Recusada</option>
            </select>
          </div>

          <CampoTexto
            id="fonte_verificacao"
            name="fonte_verificacao"
            rotulo="Onde você conferiu"
            ajuda="Ex.: painel de afiliado da plataforma, conferido em 16/09/2026. Sem isso o produto não pode ser ativado."
            defaultValue={produto?.fonte_verificacao}
            erro={erros.fonte_verificacao}
          />

          <CampoArea
            id="regras_divulgacao"
            name="regras_divulgacao"
            rotulo="Regras de divulgação do produtor"
            ajuda="O que o produtor permite e proíbe (tráfego pago, uso da marca, palavras-chave). Interno: não aparece na página pública."
            defaultValue={produto?.regras_divulgacao}
            erro={erros.regras_divulgacao}
          />
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo="Valores de referência"
          descricao="Servem para você estimar resultado. O preço final e as condições são sempre os do checkout da plataforma."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            id="preco_referencia"
            name="preco_referencia"
            rotulo="Preço de referência"
            ajuda="Opcional. Ex.: 197,00"
            defaultValue={
              produto?.preco_referencia_centavos != null
                ? (produto.preco_referencia_centavos / 100).toFixed(2).replace(".", ",")
                : ""
            }
            erro={erros.preco_referencia}
            inputMode="decimal"
          />
          <CampoTexto
            id="preco_referencia_em"
            name="preco_referencia_em"
            type="date"
            rotulo="Preço conferido em"
            ajuda="Obrigatório se houver preço. Preço sem data é desinformação."
            defaultValue={produto?.preco_referencia_em ?? ""}
            erro={erros.preco_referencia_em}
          />
          <CampoTexto
            id="comissao_estimada"
            name="comissao_estimada"
            rotulo="Comissão estimada por venda"
            ajuda="Opcional e interno. Nunca aparece na página pública nem para o visitante."
            defaultValue={
              produto?.comissao_estimada_centavos != null
                ? (produto.comissao_estimada_centavos / 100).toFixed(2).replace(".", ",")
                : ""
            }
            erro={erros.comissao_estimada}
            inputMode="decimal"
          />
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo="Descrição verificada"
          descricao="Só o que você confirmou na página oficial do produto. Afirmações específicas (garantia, bônus, suporte) vão em Afirmações, cada uma com sua fonte."
        />
        <CampoArea
          id="descricao_verificada"
          name="descricao_verificada"
          rotulo="Descrição"
          defaultValue={produto?.descricao_verificada}
          erro={erros.descricao_verificada}
        />
      </Cartao>

      <Cartao>
        <CabecalhoCartao titulo="Publicação" />
        {aprovacao !== "aprovado" && (
          <Aviso tom="atencao" className="mb-4">
            Enquanto a afiliação não estiver marcada como aprovada, o produto não
            pode ser ativado nem divulgado.
          </Aviso>
        )}
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={produto?.ativo}
            disabled={aprovacao !== "aprovado"}
            className="mt-0.5 h-4 w-4 rounded border-borda-forte accent-[var(--violeta)] disabled:opacity-40"
          />
          <span>
            <span className="block text-[14px] font-medium text-texto">
              Produto ativo
            </span>
            <span className="block text-[12.5px] leading-snug text-texto-suave">
              Ativo significa que a página pública responde e o atendente pode
              recomendá-lo.
            </span>
          </span>
        </label>
        {erros.ativo && (
          <p role="alert" className="mt-2 text-[12.5px] text-vermelho-texto">
            {erros.ativo}
          </p>
        )}
      </Cartao>

      <div className="flex gap-3">
        <Enviar novo={novo} />
        <Link href="/produtos" className={estiloBotao("secundario")}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
