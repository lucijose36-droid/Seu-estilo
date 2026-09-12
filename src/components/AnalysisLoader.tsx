"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function AnalysisLoader({
  frases,
  onDone,
  duracaoMs = 2600,
}: {
  frases: string[];
  onDone?: () => void;
  duracaoMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndex((i) => (i + 1) % frases.length);
    }, duracaoMs / frases.length);
    const timeout = setTimeout(() => onDone?.(), duracaoMs);
    return () => {
      clearInterval(intervalo);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 py-24 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-paper">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
        <Sparkles size={26} className="text-gold" strokeWidth={1.5} />
      </div>
      <p key={index} className="animate-fade-up font-display text-[19px] italic text-ink">
        {frases[index]}
      </p>
      <div className="w-full max-w-[220px] space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2.5 w-full overflow-hidden rounded-full bg-cream-soft">
            <div
              className="skeleton-shimmer h-full rounded-full"
              style={{ width: `${85 - i * 15}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
