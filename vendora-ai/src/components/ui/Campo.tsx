import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

function Envolucro({
  id,
  rotulo,
  ajuda,
  erro,
  obrigatorio,
  children,
}: {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  obrigatorio?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-texto">
        {rotulo}
        {obrigatorio && (
          <span className="ml-1 text-vermelho-texto" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {ajuda && (
        <p id={`${id}-ajuda`} className="text-[12.5px] leading-snug text-texto-suave">
          {ajuda}
        </p>
      )}
      {children}
      {erro && (
        <p id={`${id}-erro`} role="alert" className="text-[12.5px] text-vermelho-texto">
          {erro}
        </p>
      )}
    </div>
  );
}

const baseCampo =
  "w-full rounded-lg border bg-superficie px-3 py-2.5 text-[14px] text-texto placeholder:text-texto-suave/60 transition-colors";

export function CampoTexto({
  id,
  rotulo,
  ajuda,
  erro,
  obrigatorio,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  obrigatorio?: boolean;
}) {
  return (
    <Envolucro id={id} rotulo={rotulo} ajuda={ajuda} erro={erro} obrigatorio={obrigatorio}>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={
          [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ") ||
          undefined
        }
        className={clsx(
          baseCampo,
          erro ? "border-vermelho-texto" : "border-borda-forte",
          className,
        )}
        {...props}
      />
    </Envolucro>
  );
}

export function CampoArea({
  id,
  rotulo,
  ajuda,
  erro,
  obrigatorio,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  obrigatorio?: boolean;
}) {
  return (
    <Envolucro id={id} rotulo={rotulo} ajuda={ajuda} erro={erro} obrigatorio={obrigatorio}>
      <textarea
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={
          [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ") ||
          undefined
        }
        className={clsx(
          baseCampo,
          "min-h-[96px] resize-y",
          erro ? "border-vermelho-texto" : "border-borda-forte",
          className,
        )}
        {...props}
      />
    </Envolucro>
  );
}
