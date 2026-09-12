"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  icon?: ReactNode;
  full?: boolean;
}

export default function Button({
  variant = "primary",
  children,
  icon,
  full = true,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
        full && "w-full",
        variant === "primary" &&
          "bg-ink text-cream hover:bg-[#2a241c] shadow-[0_8px_24px_-8px_rgba(23,20,15,0.45)]",
        variant === "secondary" &&
          "bg-transparent text-ink border border-ink/20 hover:border-ink/40",
        variant === "ghost" && "bg-transparent text-ink-soft hover:text-ink",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
