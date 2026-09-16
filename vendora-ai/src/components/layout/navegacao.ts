import {
  BarChart3,
  Bot,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Receipt,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ItemNav {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Aparece na barra inferior do celular. */
  primarioMobile: boolean;
}

export const ITENS_NAV: ItemNav[] = [
  { href: "/painel", rotulo: "Painel", icone: LayoutDashboard, primarioMobile: true },
  { href: "/produtos", rotulo: "Produtos", icone: Package, primarioMobile: true },
  { href: "/campanhas", rotulo: "Campanhas", icone: BarChart3, primarioMobile: false },
  { href: "/vendedor", rotulo: "Vendedor", icone: Bot, primarioMobile: true },
  { href: "/conversas", rotulo: "Conversas", icone: MessagesSquare, primarioMobile: true },
  { href: "/comissoes", rotulo: "Comissões", icone: Receipt, primarioMobile: true },
  { href: "/configuracoes", rotulo: "Configurações", icone: Settings, primarioMobile: false },
];

/** Marca o item ativo tratando subrotas (/produtos/novo ativa /produtos). */
export function itemAtivo(href: string, caminho: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}
