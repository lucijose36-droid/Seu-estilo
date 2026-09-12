"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cloud, CloudRain, Snowflake, Sun, Thermometer } from "lucide-react";
import TopBar from "@/components/TopBar";
import Button from "@/components/Button";
import { Chip } from "@/components/SelectCard";
import { useApp } from "@/lib/store";
import type { Clima, EstiloDesejado, Orcamento } from "@/lib/types";

const SENSACOES: EstiloDesejado[] = [
  "Elegante e discreto",
  "Moderno",
  "Clássico",
  "Sofisticado",
  "Casual premium",
  "Quero chamar atenção",
  "Romântico",
  "Minimalista",
];

const ORCAMENTOS: Orcamento[] = [
  "Quero usar o que já tenho",
  "Econômico",
  "Médio",
  "Sem limite definido",
];

const CLIMAS: { valor: Clima; icon: typeof Sun }[] = [
  { valor: "Ensolarado", icon: Sun },
  { valor: "Nublado", icon: Cloud },
  { valor: "Chuvoso", icon: CloudRain },
  { valor: "Frio", icon: Snowflake },
  { valor: "Quente", icon: Thermometer },
];

export default function Estilo() {
  const router = useRouter();
  const { estilo, setEstilo, ocasiao } = useApp();

  const [sensacao, setSensacao] = useState<EstiloDesejado | null>(estilo?.sensacao ?? null);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(estilo?.orcamento ?? null);
  const [clima, setClima] = useState<Clima | null>(estilo?.clima ?? null);

  const podeContinuar = !!sensacao && !!orcamento && !!clima;

  function gerar() {
    if (!podeContinuar || !ocasiao) return;
    setEstilo({ sensacao: sensacao!, orcamento: orcamento!, clima: clima! });
    router.push("/resultado?novo=1");
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar passoAtual={3} totalPassos={4} />

      <div className="flex-1 space-y-9 px-6 pb-32 pt-4">
        <section>
          <h1 className="font-display text-[24px] text-ink">Como você quer se sentir?</h1>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {SENSACOES.map((s) => (
              <Chip key={s} selecionado={sensacao === s} onClick={() => setSensacao(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-[20px] text-ink">Quanto pretende gastar?</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {ORCAMENTOS.map((o) => (
              <Chip key={o} selecionado={orcamento === o} onClick={() => setOrcamento(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-[20px] text-ink">Como está o clima?</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Usamos essa informação para ajustar tecidos e camadas do look.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {CLIMAS.map(({ valor, icon: Icon }) => (
              <Chip key={valor} selecionado={clima === valor} onClick={() => setClima(valor)}>
                <span className="flex items-center gap-1.5">
                  <Icon size={14} /> {valor}
                </span>
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[560px] -translate-x-1/2 bg-cream px-6 pb-8 pt-4">
        <Button disabled={!podeContinuar} onClick={gerar}>
          Gerar meus looks
        </Button>
      </div>
    </main>
  );
}
