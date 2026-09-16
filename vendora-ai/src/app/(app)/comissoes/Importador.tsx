"use client";

import { useState, useTransition } from "react";
import Botao from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import Cartao, { CabecalhoCartao } from "@/components/ui/Cartao";
import Aviso from "@/components/ui/Aviso";
import {
  importarComissoes,
  type ResultadoImportacao,
} from "@/server/actions/comissoes";

export default function Importador() {
  const [r, setR] = useState<ResultadoImportacao | null>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <Cartao>
      <CabecalhoCartao
        titulo="Importar relatório"
        descricao="CSV exportado do painel da plataforma. Reimportar o mesmo arquivo não duplica nada."
      />

      <form
        action={(fd) => iniciar(async () => setR(await importarComissoes(fd)))}
        className="space-y-4"
      >
        <CampoTexto
          id="plataforma"
          name="plataforma"
          rotulo="Plataforma"
          ajuda="De qual painel veio este relatório. Usado para deduplicar por transação."
          required
          obrigatorio
        />

        <div className="space-y-1.5">
          <label htmlFor="arquivo" className="block text-[13px] font-medium text-texto">
            Arquivo CSV <span className="text-vermelho-texto">*</span>
          </label>
          <input
            id="arquivo"
            name="arquivo"
            type="file"
            accept=".csv,text/csv"
            required
            className="block w-full text-[13px] text-texto-suave file:mr-3 file:rounded-lg file:border-0 file:bg-violeta-claro file:px-4 file:py-2 file:text-[13px] file:font-medium file:text-violeta-escuro"
          />
        </div>

        <Botao type="submit" disabled={pendente}>
          {pendente ? "Importando…" : "Importar"}
        </Botao>
      </form>

      {r && (
        <div className="mt-5 space-y-3 border-t border-borda pt-5">
          {r.erro && (
            <Aviso tom={r.jaImportado ? "atencao" : "erro"}>{r.erro}</Aviso>
          )}

          {r.lidas !== undefined && (
            <>
              <dl className="num grid grid-cols-3 gap-3 text-[13px]">
                <div>
                  <dt className="text-[12px] text-texto-suave">Linhas lidas</dt>
                  <dd className="font-medium text-texto">{r.lidas}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-texto-suave">Importadas</dt>
                  <dd className="font-medium text-verde-texto">{r.importadas}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-texto-suave">Já existentes</dt>
                  <dd className="font-medium text-texto">{r.duplicadas}</dd>
                </div>
              </dl>

              {r.precisamRevisao! > 0 && (
                <Aviso tom="atencao" titulo="Precisam de revisão">
                  {r.precisamRevisao} linha(s) com situação que o sistema não
                  soube classificar com segurança entraram como{" "}
                  <strong>situação desconhecida</strong>. Elas não entram em
                  comissão confirmada nem recebida até alguém decidir.
                </Aviso>
              )}

              {r.semIdExterno! > 0 && (
                <Aviso tom="atencao" titulo="Sem identificador de transação">
                  {r.semIdExterno} linha(s) vieram sem código de transação.
                  Entraram, mas não têm chave de deduplicação: se o mesmo dado
                  vier em outro arquivo, será preciso conciliar à mão.
                </Aviso>
              )}

              {r.ignoradas && r.ignoradas.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium text-texto">
                    {r.ignoradas.length} linha(s) ignorada(s)
                  </p>
                  <p className="mb-2 text-[12.5px] text-texto-suave">
                    Nada foi adivinhado: linha que o sistema não entendeu fica
                    de fora e é relatada.
                  </p>
                  <ul className="max-h-40 space-y-0.5 overflow-y-auto text-[12.5px] text-texto-suave">
                    {r.ignoradas.map((i, k) => (
                      <li key={k}>
                        {i.linha > 0 ? `Linha ${i.linha}: ` : ""}
                        {i.motivo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Cartao>
  );
}
