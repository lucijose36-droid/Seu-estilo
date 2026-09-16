import clsx from "clsx";
import { AlertTriangle, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export default function Aviso({
  tom = "info",
  titulo,
  children,
  className,
}: {
  tom?: "info" | "atencao" | "erro";
  titulo?: string;
  children: ReactNode;
  className?: string;
}) {
  const Icone = { info: Info, atencao: AlertTriangle, erro: TriangleAlert }[tom];
  return (
    <div
      role={tom === "erro" ? "alert" : undefined}
      className={clsx(
        "flex gap-3 rounded-lg border px-4 py-3 text-[13px] leading-relaxed",
        tom === "info" && "border-violeta/20 bg-violeta-claro text-violeta-escuro",
        tom === "atencao" && "border-ambar-texto/20 bg-ambar-claro text-ambar-texto",
        tom === "erro" && "border-vermelho-texto/20 bg-vermelho-claro text-vermelho-texto",
        className,
      )}
    >
      <Icone size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={titulo ? "mt-0.5" : undefined}>{children}</div>
      </div>
    </div>
  );
}
