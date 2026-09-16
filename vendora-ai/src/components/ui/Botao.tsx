import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "discreto" | "perigo";

export default function Botao({
  variante = "primario",
  children,
  icone,
  largura,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  children: ReactNode;
  icone?: ReactNode;
  largura?: "auto" | "cheia";
}) {
  return (
    <button
      className={clsx(estiloBotao(variante, largura), className)}
      {...props}
    >
      {icone}
      {children}
    </button>
  );
}

/** Extraido para que <Link> possa usar exatamente a mesma aparencia. */
export function estiloBotao(
  variante: Variante = "primario",
  largura: "auto" | "cheia" = "auto",
) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium",
    "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    largura === "cheia" && "w-full",
    variante === "primario" && "bg-violeta text-white hover:bg-violeta-escuro",
    variante === "secundario" &&
      "border border-borda-forte bg-superficie text-texto hover:bg-fundo",
    variante === "discreto" && "text-texto-suave hover:bg-cinza-claro hover:text-texto",
    variante === "perigo" &&
      "border border-vermelho-texto/30 bg-vermelho-claro text-vermelho-texto hover:bg-vermelho-claro/70",
  );
}
