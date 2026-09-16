import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Tags de status.
 *
 * O verde e reservado a estados CONFIRMADOS por fonte externa — comissao
 * confirmada ou recebida. Nunca se pinta de verde algo que a Vendora AI
 * apenas supoe, porque a cor e lida antes do texto e passaria a impressao de
 * dinheiro garantido onde ha so intencao.
 */
export type TomTag = "neutro" | "andamento" | "confirmado" | "revertido" | "info";

const TONS: Record<TomTag, string> = {
  neutro: "bg-cinza-claro text-cinza-texto",
  andamento: "bg-ambar-claro text-ambar-texto",
  confirmado: "bg-verde-claro text-verde-texto",
  revertido: "bg-vermelho-claro text-vermelho-texto",
  info: "bg-violeta-claro text-violeta-escuro",
};

export default function Tag({
  tom = "neutro",
  children,
  className,
}: {
  tom?: TomTag;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium whitespace-nowrap",
        TONS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
