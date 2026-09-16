import clsx from "clsx";
import Cartao from "@/components/ui/Cartao";

/**
 * Cartão de métrica.
 *
 * `procedencia` não é opcional de propósito. Todo número deste painel tem de
 * dizer de onde veio — é a diferença entre um painel honesto e um que sugere
 * dinheiro onde há apenas clique.
 */
export default function Metrica({
  rotulo,
  valor,
  procedencia,
  destaque = "neutro",
}: {
  rotulo: string;
  valor: string;
  procedencia: string;
  destaque?: "neutro" | "confirmado" | "estimado";
}) {
  return (
    <Cartao className="min-w-0">
      <p className="text-[12.5px] leading-snug font-medium text-texto-suave">{rotulo}</p>
      <p
        className={clsx(
          "num mt-1.5 text-[24px] leading-none font-semibold tracking-[-0.02em]",
          destaque === "confirmado" && "text-verde-texto",
          destaque === "estimado" && "text-texto",
          destaque === "neutro" && "text-marinho",
        )}
      >
        {valor}
      </p>
      <p className="mt-2 text-[11.5px] leading-snug text-texto-suave">{procedencia}</p>
    </Cartao>
  );
}
