"use client";

export default function ScoreRing({ nota, tamanho = 120 }: { nota: number; tamanho?: number }) {
  const raio = (tamanho - 12) / 2;
  const circ = 2 * Math.PI * raio;
  const pct = Math.min(nota / 10, 1);

  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="var(--cream-soft)"
          strokeWidth={8}
          fill="none"
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="var(--gold)"
          strokeWidth={8}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[26px] leading-none text-ink">{nota.toFixed(1)}</span>
        <span className="text-[11px] text-ink-soft">/ 10</span>
      </div>
    </div>
  );
}
