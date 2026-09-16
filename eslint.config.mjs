import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendora AI e uma aplicacao autonoma com o proprio ESLint e o proprio
    // build. Sem esta linha o lint do Seu Estilo tentaria analisar codigo de
    // outro app, com outras dependencias.
    "vendora-ai/**",
  ]),
]);

export default eslintConfig;
