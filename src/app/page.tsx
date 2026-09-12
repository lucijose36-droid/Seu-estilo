"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useApp } from "@/lib/store";

export default function Abertura() {
  const router = useRouter();
  const { hydrated, onboardingConcluido } = useApp();

  useEffect(() => {
    if (hydrated && onboardingConcluido) {
      router.replace("/home");
    }
  }, [hydrated, onboardingConcluido, router]);

  return (
    <main className="flex min-h-dvh flex-col justify-between px-7 pb-10 pt-[max(48px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <span className="hairline flex-1" />
        <span className="font-display text-[13px] tracking-[0.2em] text-ink-soft">SEU ESTILO</span>
        <span className="hairline flex-1" />
      </div>

      <div className="animate-fade-up">
        <svg viewBox="0 0 240 240" className="mx-auto mb-10 h-48 w-48">
          <circle cx="120" cy="120" r="118" fill="var(--paper)" stroke="var(--taupe-line)" />
          <ellipse cx="120" cy="94" rx="34" ry="38" fill="var(--taupe)" opacity="0.9" />
          <path d="M62 232C62 162 86 128 120 124C154 128 178 162 178 232Z" fill="var(--ink)" />
          <path d="M96 150C104 172 136 172 144 150L152 232H88Z" fill="var(--gold)" opacity="0.85" />
          <circle cx="120" cy="60" r="3" fill="var(--gold)" />
          <circle cx="70" cy="90" r="2.5" fill="var(--gold-soft)" />
          <circle cx="170" cy="90" r="2.5" fill="var(--gold-soft)" />
        </svg>

        <h1 className="text-balance text-center font-display text-[34px] leading-[1.15] text-ink">
          Seu estilo,
          <br />
          com mais <span className="italic text-gold">você</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-[280px] text-center text-[14.5px] leading-relaxed text-ink-soft">
          Inteligência artificial a favor da sua melhor versão.
        </p>
      </div>

      <div className="animate-fade-up space-y-4" style={{ animationDelay: "150ms" }}>
        <Link href="/foto">
          <Button>Começar</Button>
        </Link>
        <p className="text-center text-[11.5px] text-ink-soft/70">
          Ao continuar, suas fotos e preferências ficam salvas apenas neste aparelho.
        </p>
      </div>
    </main>
  );
}
