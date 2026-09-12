"use client";

import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/Button";
import LookVisual from "@/components/LookVisual";
import { useApp } from "@/lib/store";

export default function Home() {
  const { perfil, savedLooks, hydrated } = useApp();

  if (!hydrated) return null;

  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="px-6 pb-4 pt-[max(24px,env(safe-area-inset-top))]">
        <p className="text-[13px] text-ink-soft">Olá{perfil.nome ? `, ${perfil.nome}` : ""}</p>
        <h1 className="font-display text-[26px] text-ink">O que vamos preparar hoje?</h1>
      </div>

      <div className="px-6">
        <Link
          href="/foto"
          className="flex items-center justify-between rounded-3xl bg-ink px-6 py-6 text-cream active:scale-[0.99]"
        >
          <div>
            <span className="flex items-center gap-1.5 text-[12px] uppercase tracking-wide text-gold-soft">
              <Sparkles size={13} /> Novo look
            </span>
            <p className="mt-1.5 font-display text-[19px]">Montar um estilo para uma ocasião</p>
          </div>
        </Link>

        <Link
          href="/evento-agora"
          className="mt-3 flex items-center gap-4 rounded-3xl border border-taupe-line bg-paper px-6 py-5 active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay/10 text-clay">
            <Zap size={19} />
          </span>
          <div>
            <p className="font-display text-[16px] text-ink">Tenho um evento agora</p>
            <p className="text-[12.5px] text-ink-soft">Sugestão rápida em menos de 1 minuto</p>
          </div>
        </Link>
      </div>

      <div className="mt-9 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[19px] text-ink">Looks salvos</h2>
          <Link href="/looks" className="text-[12.5px] text-ink-soft">
            Ver todos
          </Link>
        </div>

        {savedLooks.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            Você ainda não salvou nenhum look. Gere sugestões e toque no coração para guardar seus
            favoritos aqui.
          </p>
        ) : (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {savedLooks.slice(0, 6).map((look) => (
              <Link key={look.id} href={`/resultado/${look.id}`} className="w-32 shrink-0">
                <LookVisual paleta={look.paletaCores} compact />
                <p className="mt-1.5 truncate text-[12px] font-medium text-ink">{look.titulo}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-9 px-6">
        <Link href="/avaliar">
          <Button variant="secondary">Avaliar meu look</Button>
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
