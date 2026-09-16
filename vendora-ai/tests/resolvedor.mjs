/**
 * Resolvedor de módulos para os testes.
 *
 * O código-fonte usa as convenções do Next: imports sem extensão e o alias
 * "@/" para src/. O Node puro não conhece nenhuma das duas. Em vez de sujar
 * o código com ".ts" só para agradar ao runner — o que destoaria de todo o
 * resto do projeto e confundiria quem viesse depois — o hook abaixo ensina
 * as duas regras ao Node.
 */
import { existsSync } from "node:fs";
import { dirname, resolve as resolverCaminho } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolverCaminho(dirname(fileURLToPath(import.meta.url)), "..");
const EXTENSOES = [".ts", ".tsx", ".mts", ".js", ".mjs"];

function primeiraQueExiste(base) {
  if (existsSync(base) && !existsSync(`${base}/`)) return base;
  for (const ext of EXTENSOES) {
    if (existsSync(base + ext)) return base + ext;
  }
  for (const ext of EXTENSOES) {
    const indice = `${base}/index${ext}`;
    if (existsSync(indice)) return indice;
  }
  return null;
}

export async function resolve(especificador, contexto, proximo) {
  if (especificador.startsWith("@/")) {
    const caminho = primeiraQueExiste(
      resolverCaminho(RAIZ, "src", especificador.slice(2)),
    );
    if (caminho) return { url: pathToFileURL(caminho).href, shortCircuit: true };
  }

  if (especificador.startsWith(".") && contexto.parentURL) {
    const base = resolverCaminho(
      dirname(fileURLToPath(contexto.parentURL)),
      especificador,
    );
    const caminho = primeiraQueExiste(base);
    if (caminho) return { url: pathToFileURL(caminho).href, shortCircuit: true };
  }

  // "server-only" existe para quebrar o build se um Client Component importar
  // código de servidor. Nos testes não há bundler, então vira um módulo vazio.
  if (especificador === "server-only") {
    return { url: pathToFileURL(resolverCaminho(RAIZ, "tests/vazio.mjs")).href, shortCircuit: true };
  }

  return proximo(especificador, contexto);
}
