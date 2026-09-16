"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ITENS_NAV, itemAtivo } from "./navegacao";

/**
 * Barra inferior do celular com os itens primarios. Os demais (Campanhas,
 * Configuracoes) ficam no menu do topo — nao somem, so nao disputam espaco
 * com o polegar.
 */
export default function NavMobile() {
  const caminho = usePathname();
  const itens = ITENS_NAV.filter((i) => i.primarioMobile);

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie/95 backdrop-blur lg:hidden"
    >
      <ul className="flex pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
        {itens.map(({ href, rotulo, icone: Icone }) => {
          const ativo = itemAtivo(href, caminho);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className="flex flex-col items-center gap-1 px-1 py-1"
              >
                <Icone
                  size={20}
                  strokeWidth={ativo ? 2.3 : 1.7}
                  className={ativo ? "text-violeta" : "text-texto-suave"}
                  aria-hidden="true"
                />
                <span
                  className={clsx(
                    "text-[10.5px] leading-none",
                    ativo ? "font-medium text-violeta-escuro" : "text-texto-suave",
                  )}
                >
                  {rotulo}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
