/**
 * Helpers de URL que precisam ser importados tanto por Server Actions quanto
 * por paginas. Ficam FORA do arquivo "use server" porque um modulo com essa
 * diretiva so pode exportar funcoes assincronas — toda exportacao dele vira
 * um endpoint POST.
 */

/**
 * So aceita caminho interno. Sem isso, `?proximo=https://site-falso` faria a
 * propria tela de login virar trampolim para phishing.
 *
 * `//host` e rejeitado porque o navegador o trata como URL absoluta com o
 * mesmo protocolo — e um redirecionamento externo disfarcado de caminho.
 */
export function destinoSeguro(proximo: string | undefined | null): string {
  if (!proximo) return "/painel";
  if (!proximo.startsWith("/")) return "/painel";
  if (proximo.startsWith("//")) return "/painel";
  if (proximo.includes("\\")) return "/painel";
  return proximo;
}
