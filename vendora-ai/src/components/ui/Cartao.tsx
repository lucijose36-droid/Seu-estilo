import clsx from "clsx";
import type { ReactNode } from "react";

export default function Cartao({
  children,
  className,
  preenchimento = true,
}: {
  children: ReactNode;
  className?: string;
  preenchimento?: boolean;
}) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-borda bg-superficie",
        preenchimento && "p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CabecalhoCartao({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold text-texto">{titulo}</h2>
        {descricao && (
          <p className="mt-0.5 text-[13px] leading-snug text-texto-suave">{descricao}</p>
        )}
      </div>
      {acao}
    </div>
  );
}
