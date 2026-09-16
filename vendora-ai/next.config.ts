import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A Vendora AI nunca renderiza imagens de host arbitrario: as pecas do
  // produtor so entram apos confirmacao de licenca, e o dominio permitido
  // e declarado aqui explicitamente quando isso acontecer.
  images: { remotePatterns: [] },

  // Fixa a raiz do Turbopack neste diretorio.
  //
  // Sem isso, o Turbopack sobe niveis procurando lockfile e pode eleger raiz
  // errada quando o projeto esta dentro de outra arvore (foi o caso enquanto
  // a Vendora AI vivia numa subpasta do repositorio do Seu Estilo). Manter
  // explicito e barato e elimina a classe de bug inteira.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
