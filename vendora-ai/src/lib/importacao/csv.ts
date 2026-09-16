/**
 * Leitor de CSV.
 *
 * Escrito à mão, e não com split(","), porque relatório de plataforma traz
 * campo com vírgula dentro de aspas ("Curso de Excel, módulo 2") e quebra de
 * linha dentro de célula. Um split ingênuo desloca todas as colunas seguintes
 * e importa valor errado em silêncio — o pior modo de falhar quando o assunto
 * é dinheiro.
 */

export type LinhaCsv = Record<string, string>;

export function lerCsv(texto: string): { cabecalho: string[]; linhas: LinhaCsv[] } {
  const semBom = texto.replace(/^﻿/, "");
  const separador = detectarSeparador(semBom);
  const celulas = tokenizar(semBom, separador);

  if (celulas.length === 0) return { cabecalho: [], linhas: [] };

  const cabecalho = (celulas[0] ?? []).map((c) => c.trim().toLowerCase());
  const linhas: LinhaCsv[] = [];

  for (const linha of celulas.slice(1)) {
    if (linha.length === 1 && linha[0]!.trim() === "") continue; // linha vazia
    const registro: LinhaCsv = {};
    cabecalho.forEach((coluna, i) => {
      registro[coluna] = (linha[i] ?? "").trim();
    });
    linhas.push(registro);
  }

  return { cabecalho, linhas };
}

/**
 * Plataformas brasileiras exportam com ponto e vírgula tão frequentemente
 * quanto com vírgula (é o padrão do Excel em pt-BR). Detectar evita que o
 * arquivo inteiro vire uma coluna só.
 */
function detectarSeparador(texto: string): string {
  const primeiraLinha = texto.slice(0, texto.indexOf("\n") + 1 || undefined);
  const virgulas = (primeiraLinha.match(/,/g) ?? []).length;
  const pontoEVirgulas = (primeiraLinha.match(/;/g) ?? []).length;
  const tabs = (primeiraLinha.match(/\t/g) ?? []).length;
  if (tabs > virgulas && tabs > pontoEVirgulas) return "\t";
  return pontoEVirgulas > virgulas ? ";" : ",";
}

function tokenizar(texto: string, separador: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let celula = "";
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!;

    if (dentroDeAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          celula += '"'; // aspas escapadas
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        celula += c;
      }
      continue;
    }

    if (c === '"') {
      dentroDeAspas = true;
    } else if (c === separador) {
      linha.push(celula);
      celula = "";
    } else if (c === "\n") {
      linha.push(celula);
      linhas.push(linha);
      linha = [];
      celula = "";
    } else if (c !== "\r") {
      celula += c;
    }
  }

  if (celula !== "" || linha.length > 0) {
    linha.push(celula);
    linhas.push(linha);
  }

  return linhas;
}
