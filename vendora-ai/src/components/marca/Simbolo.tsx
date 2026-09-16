/**
 * Simbolo da Vendora AI: balao de conversa com uma seta de fluxo saindo dele
 * — o atendimento que conduz alguem ate a plataforma do produtor.
 *
 * Desenho original em vetor, sem dependencia de fonte e sem elemento de
 * qualquer marca de terceiro.
 */
export default function Simbolo({
  tamanho = 28,
  className,
}: {
  tamanho?: number;
  className?: string;
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* balao */}
      <path
        d="M7 4h18a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H13.8l-5.9 4.7A1 1 0 0 1 6.3 27v-4.2A5 5 0 0 1 2 18V9a5 5 0 0 1 5-5Z"
        fill="currentColor"
      />
      {/* seta de fluxo */}
      <path
        d="M9.5 15.5h9.5M15.5 11.5l4.2 4-4.2 4"
        stroke="var(--color-violeta)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
