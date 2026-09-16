"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Wordmark from "@/components/marca/Wordmark";
import { ITENS_NAV, itemAtivo } from "./navegacao";

/**
 * Topo: no celular carrega a marca e o menu completo (inclusive os itens que
 * nao cabem na barra inferior); no desktop mostra o titulo da pagina e a
 * conta. O menu fecha ao navegar e com Esc.
 */
export default function TopBar({ email }: { email: string | null }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();
  const atual = ITENS_NAV.find((i) => itemAtivo(i.href, caminho));

  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-superficie/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Link href="/painel" className="rounded-md lg:hidden">
          <Wordmark tamanho="sm" />
        </Link>

        <h1 className="hidden text-[15px] font-semibold text-texto lg:block">
          {atual?.rotulo ?? "Vendora AI"}
        </h1>

        <div className="ml-auto flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[22ch] truncate text-[13px] text-texto-suave sm:block">
              {email}
            </span>
          )}
          <form action="/api/sair" method="post" className="hidden lg:block">
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-[13px] text-texto-suave hover:bg-fundo hover:text-texto"
            >
              Sair
            </button>
          </form>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="rounded-lg p-2 text-texto-suave hover:bg-fundo lg:hidden"
          >
            {aberto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {aberto && (
        <div
          id="menu-mobile"
          className="border-t border-borda px-3 py-2 lg:hidden"
          onKeyDown={(e) => {
            if (e.key === "Escape") setAberto(false);
          }}
        >
          <ul className="space-y-0.5">
            {ITENS_NAV.map(({ href, rotulo, icone: Icone }) => {
              const ativo = itemAtivo(href, caminho);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setAberto(false)}
                    aria-current={ativo ? "page" : undefined}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px]",
                      ativo
                        ? "bg-violeta-claro font-medium text-violeta-escuro"
                        : "text-texto-suave",
                    )}
                  >
                    <Icone size={17} aria-hidden="true" />
                    {rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form action="/api/sair" method="post" className="mt-1 border-t border-borda pt-1">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2.5 text-left text-[14px] text-texto-suave"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
