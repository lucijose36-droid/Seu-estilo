import clsx from "clsx";
import Simbolo from "./Simbolo";

/**
 * Wordmark "Vendora AI" — grafia exata, "AI" em caixa alta.
 *
 * Composta com Inter Variable (SIL Open Font License 1.1), auto-hospedada.
 * Nao depende de fonte proprietaria distribuida, como a identidade exige.
 */
export default function Wordmark({
  className,
  tamanho = "md",
  semSimbolo = false,
}: {
  className?: string;
  tamanho?: "sm" | "md" | "lg";
  semSimbolo?: boolean;
}) {
  const escala = {
    sm: { simbolo: 22, texto: "text-[15px]" },
    md: { simbolo: 28, texto: "text-[18px]" },
    lg: { simbolo: 40, texto: "text-[26px]" },
  }[tamanho];

  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      {!semSimbolo && <Simbolo tamanho={escala.simbolo} className="text-marinho" />}
      <span
        className={clsx(
          "font-semibold tracking-[-0.02em] text-marinho",
          escala.texto,
        )}
      >
        Vendora{" "}
        <span className="font-bold text-violeta">AI</span>
      </span>
    </span>
  );
}
