"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Wordmark from "@/components/marca/Wordmark";
import { ITENS_NAV, itemAtivo } from "./navegacao";

/** Navegacao lateral do desktop. Escondida no celular, que usa NavMobile. */
export default function Sidebar() {
  const caminho = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-borda bg-superficie lg:flex lg:flex-col">
      <div className="px-5 py-5">
        <Link href="/painel" className="inline-block rounded-md">
          <Wordmark tamanho="sm" />
        </Link>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {ITENS_NAV.map(({ href, rotulo, icone: Icone }) => {
            const ativo = itemAtivo(href, caminho);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
                    ativo
                      ? "bg-violeta-claro font-medium text-violeta-escuro"
                      : "text-texto-suave hover:bg-fundo hover:text-texto",
                  )}
                >
                  <Icone size={17} strokeWidth={ativo ? 2.2 : 1.8} aria-hidden="true" />
                  {rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="px-5 py-4 text-[11.5px] leading-snug text-texto-suave">
        Vendora AI divulga ofertas de terceiros. O checkout acontece na
        plataforma do produtor.
      </p>
    </aside>
  );
}
