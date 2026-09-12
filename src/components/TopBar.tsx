"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TopBar({
  titulo,
  passoAtual,
  totalPassos,
  onBack,
}: {
  titulo?: string;
  passoAtual?: number;
  totalPassos?: number;
  onBack?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 bg-cream/90 px-5 pb-3 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur">
      <button
        onClick={() => (onBack ? onBack() : router.back())}
        aria-label="Voltar"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-taupe-line text-ink-soft active:scale-95"
      >
        <ArrowLeft size={17} />
      </button>
      {titulo && <span className="text-[13px] font-medium text-ink-soft">{titulo}</span>}
      {passoAtual && totalPassos && (
        <div className="ml-auto flex gap-1.5">
          {Array.from({ length: totalPassos }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-6 rounded-full"
              style={{
                background: i < passoAtual ? "var(--gold)" : "var(--taupe-line)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
