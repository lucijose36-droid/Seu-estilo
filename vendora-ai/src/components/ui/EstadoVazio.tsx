import type { ReactNode } from "react";

/**
 * Estado vazio util: explica o que falta e oferece o proximo passo.
 * Nunca preenchido com numero de exemplo — tela sem dado mostra tela sem
 * dado, e essa e a regra de honestidade do painel.
 */
export default function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icone && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-violeta-claro text-violeta-escuro">
          {icone}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-texto">{titulo}</h3>
      <p className="mt-1 max-w-[42ch] text-[13.5px] leading-relaxed text-texto-suave">
        {descricao}
      </p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
