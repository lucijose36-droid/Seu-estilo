"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import TopBar from "@/components/TopBar";
import LookVisual from "@/components/LookVisual";
import Button from "@/components/Button";
import { useApp } from "@/lib/store";

export default function Experimentar() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentLooks, savedLooks, fotoUsuario, hydrated } = useApp();
  const [preparando, setPreparando] = useState(true);

  const look = useMemo(
    () => currentLooks.find((l) => l.id === id) ?? savedLooks.find((l) => l.id === id) ?? null,
    [currentLooks, savedLooks, id],
  );

  useEffect(() => {
    const t = setTimeout(() => setPreparando(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!hydrated) return null;
  if (!look) {
    return (
      <main className="flex min-h-dvh flex-col">
        <TopBar />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-[14px] text-ink-soft">
          Não encontramos esse look.
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar titulo="Experimentar em mim" />

      {preparando ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-paper">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
            <Sparkles size={22} className="text-gold" />
          </div>
          <p className="font-display text-[18px] italic text-ink">
            Sua simulação está sendo preparada...
          </p>
        </div>
      ) : (
        <div className="flex-1 px-6 pb-10 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-2xl border border-taupe-line">
              {fotoUsuario ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUsuario} alt="Você" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-cream-soft text-center text-[12px] text-ink-soft">
                  Sem foto
                </div>
              )}
            </div>
            <LookVisual paleta={look.paletaCores} />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-cream-soft px-4 py-2 text-[11.5px] text-ink-soft">
            <Sparkles size={13} className="text-gold" /> Composição estilizada — simulação, não uma
            foto real
          </div>

          <h1 className="mt-6 font-display text-[21px] text-ink">{look.titulo} em você</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            Essa é uma visualização simulada de como as peças e cores do look conversam com a sua
            foto. Em uma próxima versão, essa etapa poderá gerar a composição final por meio de uma
            API de geração de imagens conectada à sua foto real.
          </p>

          <div className="mt-8">
            <Button variant="secondary" onClick={() => router.push(`/resultado/${look.id}`)}>
              Voltar para o look
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
