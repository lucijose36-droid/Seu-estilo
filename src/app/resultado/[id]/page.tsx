"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import clsx from "clsx";
import TopBar from "@/components/TopBar";
import LookVisual from "@/components/LookVisual";
import Button from "@/components/Button";
import { useApp } from "@/lib/store";
import type { LookPeca } from "@/lib/types";

export default function LookDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentLooks, savedLooks, ocasiao, salvarLook, removerLookSalvo, isLookSalvo, hydrated } =
    useApp();
  const [genero, setGenero] = useState<"homem" | "mulher">("homem");

  const look = useMemo(
    () =>
      currentLooks.find((l) => l.id === id) ?? savedLooks.find((l) => l.id === id) ?? null,
    [currentLooks, savedLooks, id],
  );

  if (!hydrated) return null;
  if (!look) {
    return (
      <main className="flex min-h-dvh flex-col">
        <TopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-[14px] text-ink-soft">Esse look não está mais disponível.</p>
          <Button onClick={() => router.push("/home")}>Voltar para o início</Button>
        </div>
      </main>
    );
  }

  const peca: LookPeca = genero === "homem" ? look.homem : look.mulher;
  const salvo = isLookSalvo(look.id);

  return (
    <main className="flex min-h-dvh flex-col pb-36">
      <TopBar titulo={look.titulo} />

      <div className="px-6">
        <LookVisual paleta={look.paletaCores} />

        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] text-ink">{look.titulo}</h1>
            <p className="mt-1 text-[13px] text-ink-soft">{look.resumo}</p>
          </div>
          <button
            onClick={() =>
              salvo ? removerLookSalvo(look.id) : salvarLook(look, ocasiao?.tipo ?? "Look gerado")
            }
            aria-label="Salvar look"
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
              salvo ? "border-clay bg-clay/10 text-clay" : "border-taupe-line text-ink-soft",
            )}
          >
            <Heart size={19} fill={salvo ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          {(["homem", "mulher"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenero(g)}
              className={clsx(
                "rounded-full px-5 py-2 text-[13px] font-medium capitalize transition-colors",
                genero === g ? "bg-ink text-cream" : "bg-cream-soft text-ink-soft",
              )}
            >
              {g === "homem" ? "Para homens" : "Para mulheres"}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Campo label="Cabelo" valor={peca.cabelo} />
          {peca.barba && <Campo label="Barba" valor={peca.barba} />}
          {peca.maquiagem && <Campo label="Maquiagem" valor={peca.maquiagem} />}
          <Campo label="Roupa" valor={peca.roupa} />
          <Campo label="Sapato" valor={peca.calcado} />
          <Campo label="Acessórios" valor={peca.acessorios} />

          <div className="rounded-2xl border border-taupe-line bg-paper px-4 py-4">
            <span className="text-[11.5px] font-medium uppercase tracking-wide text-ink-soft/70">
              Cores recomendadas
            </span>
            <div className="mt-2.5 flex gap-2">
              {peca.cores.map((cor) => (
                <span
                  key={cor}
                  className="h-8 w-8 rounded-full border border-black/5"
                  style={{ background: cor }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-cream-soft px-4 py-4">
            <Sparkles size={17} className="mt-0.5 shrink-0 text-gold" />
            <p className="text-[13px] leading-relaxed text-ink-soft">{peca.porque}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[560px] -translate-x-1/2 space-y-2.5 bg-cream px-6 pb-8 pt-4">
        <Button icon={<Sparkles size={17} />} onClick={() => router.push(`/experimentar/${look.id}`)}>
          Experimentar em mim
        </Button>
      </div>
    </main>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="border-b border-taupe-line pb-4">
      <span className="text-[11.5px] font-medium uppercase tracking-wide text-ink-soft/70">
        {label}
      </span>
      <p className="mt-1 text-[14.5px] leading-relaxed text-ink">{valor}</p>
    </div>
  );
}
