"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export function SelectCard({
  selecionado,
  onClick,
  titulo,
  descricao,
  icon,
}: {
  selecionado: boolean;
  onClick: () => void;
  titulo: string;
  descricao?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.99]",
        selecionado
          ? "border-gold bg-paper shadow-[0_6px_18px_-10px_rgba(169,130,79,0.5)]"
          : "border-taupe-line bg-transparent",
      )}
    >
      {icon && (
        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            selecionado ? "bg-gold/15 text-gold" : "bg-cream-soft text-ink-soft",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1">
        <span className="block text-[15px] font-medium text-ink">{titulo}</span>
        {descricao && <span className="mt-0.5 block text-[12.5px] text-ink-soft">{descricao}</span>}
      </span>
      <span
        className={clsx(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selecionado ? "border-gold bg-gold text-paper" : "border-taupe-line",
        )}
      >
        {selecionado && <Check size={12} strokeWidth={3} />}
      </span>
    </button>
  );
}

export function Chip({
  selecionado,
  onClick,
  children,
}: {
  selecionado: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition-all active:scale-[0.97]",
        selecionado
          ? "border-ink bg-ink text-cream"
          : "border-taupe-line bg-transparent text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}
