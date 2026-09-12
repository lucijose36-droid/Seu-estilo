"use client";

import Link from "next/link";
import { ClipboardCheck, Zap } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const DICAS = [
  {
    titulo: "A regra dos três tons",
    texto:
      "Looks equilibrados costumam usar no máximo três cores principais: uma de base, uma de apoio e uma de destaque. Isso evita poluição visual sem deixar o conjunto monótono.",
  },
  {
    titulo: "Contraste combina com formalidade",
    texto:
      "Quanto mais formal o evento, maior pode ser o contraste entre as peças — como um terno escuro com camisa branca. Em looks casuais, tons próximos criam uma sensação mais relaxada.",
  },
  {
    titulo: "O sapato define o nível do look",
    texto:
      "Trocar apenas o calçado pode elevar ou descontrair qualquer produção. Um tênis deixa um terno mais moderno; um social deixa uma calça jeans mais elegante.",
  },
  {
    titulo: "Acessórios: menos é mais",
    texto:
      "Escolha um ponto focal — relógio, colar ou brinco — e mantenha os demais acessórios discretos. Isso evita que as peças compitam entre si.",
  },
  {
    titulo: "Vista-se para o clima, não contra ele",
    texto:
      "Camadas leves em dias quentes e tecidos mais encorpados no frio não são só conforto — também mudam a silhueta e a forma como o look se movimenta.",
  },
];

export default function Descobrir() {
  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="px-6 pb-4 pt-[max(24px,env(safe-area-inset-top))]">
        <h1 className="font-display text-[26px] text-ink">Descobrir</h1>
        <p className="mt-1 text-[13px] text-ink-soft">Ideias rápidas para refinar seu olhar de estilo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6">
        <Link
          href="/evento-agora"
          className="flex flex-col gap-2 rounded-2xl bg-ink px-4 py-5 text-cream active:scale-[0.98]"
        >
          <Zap size={18} className="text-gold-soft" />
          <span className="font-display text-[15px] leading-snug">Tenho um evento agora</span>
        </Link>
        <Link
          href="/avaliar"
          className="flex flex-col gap-2 rounded-2xl border border-taupe-line px-4 py-5 active:scale-[0.98]"
        >
          <ClipboardCheck size={18} className="text-clay" />
          <span className="font-display text-[15px] leading-snug text-ink">Avaliar meu look</span>
        </Link>
      </div>

      <div className="mt-7 space-y-3 px-6">
        {DICAS.map((d) => (
          <div key={d.titulo} className="rounded-2xl border border-taupe-line bg-paper px-5 py-4">
            <h2 className="font-display text-[16px] text-ink">{d.titulo}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{d.texto}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
