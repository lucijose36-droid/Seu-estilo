"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Home, Shirt, User } from "lucide-react";
import clsx from "clsx";

const ITENS = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/looks", label: "Looks", icon: Heart },
  { href: "/descobrir", label: "Descobrir", icon: Compass },
  { href: "/guarda-roupa", label: "Guarda-roupa", icon: Shirt },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[560px] -translate-x-1/2 border-t border-taupe-line bg-paper/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <ul className="flex items-center justify-between">
        {ITENS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-1.5 text-[10.5px] tracking-wide"
              >
                <Icon
                  size={20}
                  strokeWidth={ativo ? 2.3 : 1.6}
                  className={clsx(ativo ? "text-ink" : "text-ink-soft/60")}
                />
                <span className={clsx(ativo ? "text-ink font-medium" : "text-ink-soft/60")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
