"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import TopBar from "@/components/TopBar";
import LookVisual from "@/components/LookVisual";
import AnalysisLoader from "@/components/AnalysisLoader";
import { useApp } from "@/lib/store";

const FRASES = [
  "Analisando seu estilo...",
  "Encontrando combinações...",
  "Preparando seus melhores looks...",
];

export default function Resultado() {
  return (
    <Suspense fallback={null}>
      <ResultadoInner />
    </Suspense>
  );
}

function ResultadoInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { ocasiao, estilo, currentLooks, gerarLooks, hydrated, marcarOnboardingConcluido } =
    useApp();
  const [carregando, setCarregando] = useState(params.get("novo") === "1");
  const nonce = useRef(0);

  useEffect(() => {
    if (!hydrated) return;
    if (!ocasiao || !estilo) {
      router.replace("/ocasiao");
      return;
    }
    if (params.get("novo") === "1" || currentLooks.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza o loader com a navegação/param "novo"
      setCarregando(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, ocasiao, estilo]);

  function finalizarAnalise() {
    gerarLooks(nonce.current);
    marcarOnboardingConcluido();
    setCarregando(false);
  }

  function gerarOutros() {
    nonce.current += 1;
    setCarregando(true);
  }

  if (!hydrated || !ocasiao || !estilo) return null;

  if (carregando) {
    return (
      <main className="flex min-h-dvh flex-col">
        <TopBar titulo="Analisando" />
        <AnalysisLoader frases={FRASES} onDone={finalizarAnalise} />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col pb-14">
      <TopBar titulo="Seus looks" />

      <div className="px-6 pt-2">
        <h1 className="font-display text-[25px] text-ink">Preparamos 3 looks para você</h1>
        <p className="mt-1.5 text-[13px] text-ink-soft">
          {ocasiao.tipo} · {ocasiao.periodo} · {ocasiao.formalidade}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {currentLooks.map((look, i) => (
            <button
              key={look.id}
              onClick={() => router.push(`/resultado/${look.id}`)}
              className="animate-fade-up text-left"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <LookVisual paleta={look.paletaCores} />
              <p className="mt-2.5 font-display text-[15px] text-ink">{look.titulo}</p>
              <p className="text-[11.5px] leading-snug text-ink-soft">{look.resumo.slice(0, 46)}…</p>
            </button>
          ))}
        </div>

        <button
          onClick={gerarOutros}
          className="mx-auto mt-8 flex items-center gap-2 text-[13px] font-medium text-ink-soft active:opacity-60"
        >
          <RefreshCw size={14} /> Gerar outras opções
        </button>
      </div>
    </main>
  );
}
