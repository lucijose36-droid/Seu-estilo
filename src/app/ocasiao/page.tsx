"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import Button from "@/components/Button";
import { Chip } from "@/components/SelectCard";
import { useApp } from "@/lib/store";
import type { Formalidade, Periodo } from "@/lib/types";

const OCASIOES = [
  "Buffet / Festa formal",
  "Casamento",
  "Formatura",
  "Jantar",
  "Trabalho",
  "Encontro",
  "Aniversário",
  "Evento casual",
];

const PERIODOS: Periodo[] = ["Dia", "Tarde", "Noite"];
const FORMALIDADES: Formalidade[] = [
  "Casual",
  "Casual elegante",
  "Social",
  "Formal",
  "Muito formal",
];

export default function Ocasiao() {
  const router = useRouter();
  const { ocasiao, setOcasiao } = useApp();

  const [tipo, setTipo] = useState(ocasiao?.tipo ?? "");
  const [outro, setOutro] = useState(
    ocasiao && !OCASIOES.includes(ocasiao.tipo) ? ocasiao.tipo : "",
  );
  const [usandoOutro, setUsandoOutro] = useState(
    !!ocasiao && !OCASIOES.includes(ocasiao.tipo),
  );
  const [quando, setQuando] = useState<string>(ocasiao?.quando ?? "Hoje");
  const [dataEscolhida, setDataEscolhida] = useState("");
  const [periodo, setPeriodo] = useState<Periodo | null>(ocasiao?.periodo ?? null);
  const [formalidade, setFormalidade] = useState<Formalidade | null>(
    ocasiao?.formalidade ?? null,
  );

  const tipoFinal = usandoOutro ? outro.trim() : tipo;
  const podeContinuar = !!tipoFinal && !!periodo && !!formalidade;

  function continuar() {
    if (!podeContinuar) return;
    setOcasiao({
      tipo: tipoFinal,
      quando: quando === "Escolher data" ? dataEscolhida || "Data a definir" : quando,
      periodo: periodo!,
      formalidade: formalidade!,
    });
    router.push("/estilo");
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar passoAtual={2} totalPassos={4} />

      <div className="flex-1 space-y-9 px-6 pb-32 pt-4">
        <section>
          <h1 className="font-display text-[24px] text-ink">Para onde você vai?</h1>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {OCASIOES.map((o) => (
              <Chip
                key={o}
                selecionado={!usandoOutro && tipo === o}
                onClick={() => {
                  setTipo(o);
                  setUsandoOutro(false);
                }}
              >
                {o}
              </Chip>
            ))}
            <Chip selecionado={usandoOutro} onClick={() => setUsandoOutro(true)}>
              Outro
            </Chip>
          </div>
          {usandoOutro && (
            <input
              value={outro}
              onChange={(e) => setOutro(e.target.value)}
              placeholder="Descreva a ocasião"
              className="mt-3 w-full rounded-xl border border-taupe-line bg-paper px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-gold"
            />
          )}
        </section>

        <section>
          <h2 className="font-display text-[20px] text-ink">Quando será?</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {["Hoje", "Amanhã", "Escolher data"].map((q) => (
              <Chip key={q} selecionado={quando === q} onClick={() => setQuando(q)}>
                {q}
              </Chip>
            ))}
          </div>
          {quando === "Escolher data" && (
            <input
              type="date"
              value={dataEscolhida}
              onChange={(e) => setDataEscolhida(e.target.value)}
              className="mt-3 w-full rounded-xl border border-taupe-line bg-paper px-4 py-3 text-[14px] text-ink outline-none focus:border-gold"
            />
          )}
        </section>

        <section>
          <h2 className="font-display text-[20px] text-ink">Horário</h2>
          <div className="mt-3 flex gap-2.5">
            {PERIODOS.map((p) => (
              <Chip key={p} selecionado={periodo === p} onClick={() => setPeriodo(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-[20px] text-ink">Formalidade</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {FORMALIDADES.map((f) => (
              <Chip key={f} selecionado={formalidade === f} onClick={() => setFormalidade(f)}>
                {f}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[560px] -translate-x-1/2 bg-cream px-6 pb-8 pt-4">
        <Button disabled={!podeContinuar} onClick={continuar}>
          Continuar
        </Button>
      </div>
    </main>
  );
}
