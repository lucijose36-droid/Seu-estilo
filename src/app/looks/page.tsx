"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LookVisual from "@/components/LookVisual";
import { useApp } from "@/lib/store";

export default function MeusLooks() {
  const { savedLooks, hydrated } = useApp();

  if (!hydrated) return null;

  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="px-6 pb-4 pt-[max(24px,env(safe-area-inset-top))]">
        <h1 className="font-display text-[26px] text-ink">Meus Looks</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {savedLooks.length} {savedLooks.length === 1 ? "look salvo" : "looks salvos"}
        </p>
      </div>

      {savedLooks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-10 text-center">
          <Heart size={28} strokeWidth={1.3} className="text-ink-soft/50" />
          <p className="text-[13.5px] text-ink-soft">
            Toque no coração em qualquer look gerado para guardá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-6">
          {savedLooks.map((look) => (
            <Link key={look.id} href={`/resultado/${look.id}`}>
              <LookVisual paleta={look.paletaCores} />
              <p className="mt-2 font-display text-[15px] text-ink">{look.titulo}</p>
              <p className="text-[11.5px] text-ink-soft">{look.contexto}</p>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
