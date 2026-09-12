"use client";

import { useRef, useState } from "react";
import { Camera, CheckCircle2, Image as ImageIcon, TriangleAlert } from "lucide-react";
import TopBar from "@/components/TopBar";
import ScoreRing from "@/components/ScoreRing";
import AnalysisLoader from "@/components/AnalysisLoader";
import { avaliarLook } from "@/lib/mockEngine";
import type { Avaliacao } from "@/lib/types";

export default function Avaliar() {
  const [foto, setFoto] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFoto(reader.result as string);
      setAnalisando(true);
    };
    reader.readAsDataURL(file);
  }

  if (analisando) {
    return (
      <main className="flex min-h-dvh flex-col">
        <TopBar titulo="Avaliando" />
        <AnalysisLoader
          frases={["Observando seu conjunto...", "Comparando cores e formalidade...", "Montando sua avaliação..."]}
          duracaoMs={2400}
          onDone={() => {
            setAvaliacao(avaliarLook(foto!));
            setAnalisando(false);
          }}
        />
      </main>
    );
  }

  if (avaliacao && foto) {
    return (
      <main className="flex min-h-dvh flex-col pb-10">
        <TopBar
          titulo="Avaliação"
          onBack={() => {
            setAvaliacao(null);
            setFoto(null);
          }}
        />
        <div className="px-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-taupe-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="Seu look" className="h-full w-full object-cover" />
            </div>
            <ScoreRing nota={avaliacao.nota} />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3">
            {avaliacao.categorias.map((c) => (
              <div key={c.nome}>
                <div className="flex justify-between text-[12.5px] text-ink-soft">
                  <span>{c.nome}</span>
                  <span>{c.nota.toFixed(1)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-soft">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${c.nota * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-2.5">
            {avaliacao.pontosFortes.map((p) => (
              <div key={p} className="flex gap-2.5 rounded-xl bg-cream-soft px-4 py-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ink" />
                <p className="text-[13px] leading-relaxed text-ink">{p}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {avaliacao.pontosAtencao.map((p) => (
              <div key={p.problema} className="rounded-xl border border-clay/30 bg-clay/5 px-4 py-3">
                <div className="flex gap-2.5">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-clay" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">{p.problema}</p>
                    <p className="mt-1 text-[12.5px] text-ink-soft">Sugestão: {p.sugestao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar titulo="Avaliar meu look" />
      <div className="flex-1 px-6 pb-10 pt-2">
        <h1 className="font-display text-[23px] text-ink">O que está errado?</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Envie uma foto sua já vestida para o evento e receba uma avaliação com nota, pontos
          fortes e ajustes recomendados.
        </p>

        <button
          onClick={() => inputRef.current?.click()}
          className="mx-auto mt-8 flex aspect-[3/4] w-full max-w-[260px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-taupe-line bg-paper/60 text-ink-soft"
        >
          <ImageIcon size={30} strokeWidth={1.3} />
          <span className="text-[13px]">Enviar foto do look</span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />

        <div className="mx-auto mt-4 flex max-w-[260px] items-center justify-center gap-2 text-[12px] text-ink-soft">
          <Camera size={13} /> Também funciona com foto tirada na hora
        </div>
      </div>
    </main>
  );
}
