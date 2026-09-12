"use client";

import { useState } from "react";
import { Heart, Zap } from "lucide-react";
import clsx from "clsx";
import TopBar from "@/components/TopBar";
import Button from "@/components/Button";
import { Chip } from "@/components/SelectCard";
import PhotoPicker from "@/components/PhotoPicker";
import LookVisual from "@/components/LookVisual";
import { useApp } from "@/lib/store";
import { generateLooks } from "@/lib/mockEngine";
import type { Formalidade, LookSuggestion, Periodo } from "@/lib/types";

const OCASIOES = ["Trabalho", "Encontro", "Jantar", "Festa", "Evento casual"];
const PERIODOS: Periodo[] = ["Dia", "Tarde", "Noite"];
const FORMALIDADES: Formalidade[] = ["Casual elegante", "Social", "Formal"];

export default function EventoAgora() {
  const { fotoUsuario, setFotoUsuario, salvarLook, isLookSalvo } = useApp();
  const [ocasiaoTipo, setOcasiaoTipo] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [formalidade, setFormalidade] = useState<Formalidade | null>(null);
  const [look, setLook] = useState<LookSuggestion | null>(null);

  const podeGerar = fotoUsuario && ocasiaoTipo && periodo && formalidade;

  function gerar() {
    if (!podeGerar) return;
    const [rapido] = generateLooks(
      { tipo: ocasiaoTipo!, quando: "Hoje", periodo: periodo!, formalidade: formalidade! },
      { sensacao: "Elegante e discreto", orcamento: "Quero usar o que já tenho", clima: "Ensolarado" },
      Date.now(),
    );
    setLook(rapido);
  }

  if (look) {
    const salvo = isLookSalvo(look.id);
    return (
      <main className="flex min-h-dvh flex-col pb-10">
        <TopBar titulo="Sugestão rápida" onBack={() => setLook(null)} />
        <div className="px-6 pt-2">
          <LookVisual paleta={look.paletaCores} />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-[22px] text-ink">{look.titulo}</h1>
              <p className="mt-1 text-[13px] text-ink-soft">{look.resumo}</p>
            </div>
            <button
              onClick={() => salvarLook(look, ocasiaoTipo!)}
              className={clsx(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                salvo ? "border-clay bg-clay/10 text-clay" : "border-taupe-line text-ink-soft",
              )}
            >
              <Heart size={18} fill={salvo ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <Campo label="Homem" valor={`${look.homem.roupa} · ${look.homem.calcado}`} />
            <Campo label="Mulher" valor={`${look.mulher.roupa} · ${look.mulher.calcado}`} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar titulo="Evento agora" />
      <div className="flex-1 px-6 pb-32 pt-2">
        <div className="flex items-center gap-2 text-clay">
          <Zap size={16} />
          <span className="text-[12.5px] font-medium">Fluxo rápido — menos de 1 minuto</span>
        </div>
        <h1 className="mt-2 font-display text-[23px] text-ink">Resolva agora o que vestir</h1>

        <div className="mt-6">
          <PhotoPicker foto={fotoUsuario} onChange={setFotoUsuario} />
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {OCASIOES.map((o) => (
            <Chip key={o} selecionado={ocasiaoTipo === o} onClick={() => setOcasiaoTipo(o)}>
              {o}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PERIODOS.map((p) => (
            <Chip key={p} selecionado={periodo === p} onClick={() => setPeriodo(p)}>
              {p}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMALIDADES.map((f) => (
            <Chip key={f} selecionado={formalidade === f} onClick={() => setFormalidade(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[560px] -translate-x-1/2 bg-cream px-6 pb-8 pt-4">
        <Button disabled={!podeGerar} onClick={gerar}>
          Gerar sugestão rápida
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
