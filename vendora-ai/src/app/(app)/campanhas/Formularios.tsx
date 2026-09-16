"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Botao from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import Aviso from "@/components/ui/Aviso";
import { registrarDespesa, salvarCampanha } from "@/server/actions/campanhas";
import type { EstadoFormulario } from "@/server/actions/produtos";

function Enviar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending}>
      {pending ? "Salvando…" : rotulo}
    </Botao>
  );
}

function Select({
  id,
  name,
  rotulo,
  opcoes,
  padrao,
}: {
  id: string;
  name: string;
  rotulo: string;
  opcoes: [string, string][];
  padrao?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-texto">
        {rotulo}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={padrao}
        className="w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-[14px] text-texto"
      >
        {opcoes.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormularioCampanha() {
  const [estado, acao] = useActionState<EstadoFormulario, FormData>(salvarCampanha, {});
  const erros = estado.erros ?? {};

  return (
    <Cartao>
      <CabecalhoCartao
        titulo="Nova campanha"
        descricao="As UTMs ligam o clique de saída à campanha. Sem elas, não dá para saber de onde veio o visitante."
      />
      <form action={acao} className="space-y-4">
        {estado.mensagem && (
          <Aviso tom={estado.erros ? "erro" : "info"}>{estado.mensagem}</Aviso>
        )}
        <CampoTexto id="nome" name="nome" rotulo="Nome" erro={erros.nome} required obrigatorio />
        <Select
          id="canal"
          name="canal"
          rotulo="Canal"
          padrao="organico"
          opcoes={[
            ["organico", "Orgânico"],
            ["meta_ads", "Meta Ads"],
            ["google_ads", "Google Ads"],
            ["tiktok_ads", "TikTok Ads"],
            ["email", "E-mail"],
            ["outro", "Outro"],
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoTexto id="utm_source" name="utm_source" rotulo="utm_source" erro={erros.utm_source} />
          <CampoTexto id="utm_medium" name="utm_medium" rotulo="utm_medium" erro={erros.utm_medium} />
          <CampoTexto id="utm_campaign" name="utm_campaign" rotulo="utm_campaign" erro={erros.utm_campaign} />
        </div>
        <CampoTexto
          id="orcamento_limite"
          name="orcamento_limite"
          rotulo="Orçamento autorizado"
          ajuda="Teto que você autorizou para esta campanha. O sistema não gasta nada sozinho: o valor serve para comparar com o que for lançado e avisar."
          erro={erros.orcamento_limite}
          inputMode="decimal"
        />
        <Select
          id="status"
          name="status"
          rotulo="Situação"
          padrao="rascunho"
          opcoes={[
            ["rascunho", "Rascunho"],
            ["ativa", "Ativa"],
            ["pausada", "Pausada"],
            ["encerrada", "Encerrada"],
          ]}
        />
        <Enviar rotulo="Registrar campanha" />
      </form>
    </Cartao>
  );
}

export function FormularioDespesa({
  campanhas,
}: {
  campanhas: { id: string; nome: string }[];
}) {
  const [estado, acao] = useActionState<EstadoFormulario, FormData>(registrarDespesa, {});
  const erros = estado.erros ?? {};

  return (
    <Cartao>
      <CabecalhoCartao
        titulo="Registrar despesa"
        descricao="Lançamento manual. Nenhum gasto é lido de painel de anúncio nem deduzido pelo sistema — um número inferido entraria no resultado parecendo verificado."
      />
      <form action={acao} className="space-y-4">
        {estado.mensagem && (
          <Aviso tom={estado.erros ? "erro" : "info"}>{estado.mensagem}</Aviso>
        )}
        <Select
          id="campaign_id"
          name="campaign_id"
          rotulo="Campanha"
          opcoes={[["", "Sem campanha"], ...campanhas.map((c) => [c.id, c.nome] as [string, string])]}
        />
        <Select
          id="categoria"
          name="categoria"
          rotulo="Categoria"
          padrao="anuncios"
          opcoes={[
            ["anuncios", "Anúncios"],
            ["ferramenta", "Ferramenta"],
            ["api", "API"],
            ["dominio", "Domínio"],
            ["hospedagem", "Hospedagem"],
            ["outro", "Outro"],
          ]}
        />
        <CampoTexto id="descricao" name="descricao" rotulo="Descrição" erro={erros.descricao} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto id="valor" name="valor" rotulo="Valor" erro={erros.valor} inputMode="decimal" required obrigatorio />
          <CampoTexto id="ocorrido_em" name="ocorrido_em" type="date" rotulo="Data" erro={erros.ocorrido_em} required obrigatorio />
        </div>
        <Select
          id="pago"
          name="pago"
          rotulo="Situação do pagamento"
          padrao="sim"
          opcoes={[
            ["sim", "Já pago"],
            ["nao", "A pagar"],
          ]}
        />
        <Enviar rotulo="Registrar despesa" />
      </form>
    </Cartao>
  );
}
