import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A Vendora AI nunca renderiza imagens de host arbitrario: as pecas do
  // produtor so entram apos confirmacao de licenca, e o dominio permitido
  // e declarado aqui explicitamente quando isso acontecer.
  images: { remotePatterns: [] },

  // A Vendora AI vive numa subpasta de um repositorio que tem outro app com
  // o proprio lockfile. Sem fixar a raiz, o Turbopack sobe um nivel, escolhe
  // o lockfile do Seu Estilo e passa a resolver modulos a partir de la.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
