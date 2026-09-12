"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Chip } from "@/components/SelectCard";
import { useApp } from "@/lib/store";
import type { EstiloDesejado } from "@/lib/types";

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

export default function Perfil() {
  const {
    perfil,
    atualizarPerfil,
    fotoUsuario,
    excluirFoto,
    savedLooks,
    wardrobeItems,
    hydrated,
  } = useApp();

  if (!hydrated) return null;

  function togglePreferencia(s: EstiloDesejado) {
    const atual = perfil.preferenciasEstilo;
    const novo = atual.includes(s) ? atual.filter((v) => v !== s) : [...atual, s];
    atualizarPerfil({ preferenciasEstilo: novo });
  }

  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="px-6 pb-2 pt-[max(24px,env(safe-area-inset-top))]">
        <h1 className="font-display text-[26px] text-ink">Perfil</h1>
      </div>

      <div className="mt-4 flex items-center gap-4 px-6">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-taupe-line bg-paper">
          {fotoUsuario && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUsuario} alt="Você" className="h-full w-full object-cover" />
          )}
        </div>
        <input
          value={perfil.nome}
          onChange={(e) => atualizarPerfil({ nome: e.target.value })}
          placeholder="Seu nome"
          className="flex-1 rounded-xl border border-taupe-line bg-paper px-4 py-3 text-[14.5px] outline-none placeholder:text-ink-soft/50 focus:border-gold"
        />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 px-6">
        <Link href="/looks" className="rounded-2xl border border-taupe-line bg-paper px-5 py-4">
          <p className="font-display text-[22px] text-ink">{savedLooks.length}</p>
          <p className="text-[12.5px] text-ink-soft">Looks salvos</p>
        </Link>
        <Link
          href="/guarda-roupa"
          className="rounded-2xl border border-taupe-line bg-paper px-5 py-4"
        >
          <p className="font-display text-[22px] text-ink">{wardrobeItems.length}</p>
          <p className="text-[12.5px] text-ink-soft">Peças no guarda-roupa</p>
        </Link>
      </div>

      <div className="mt-8 px-6">
        <h2 className="font-display text-[18px] text-ink">Preferências de estilo</h2>
        <p className="mt-1 text-[12.5px] text-ink-soft">
          Usadas para dar destaque a esses estilos nas próximas sugestões.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SENSACOES.map((s) => (
            <Chip
              key={s}
              selecionado={perfil.preferenciasEstilo.includes(s)}
              onClick={() => togglePreferencia(s)}
            >
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-9 px-6">
        <h2 className="font-display text-[18px] text-ink">Privacidade</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
          Suas fotos pertencem a você e ficam salvas apenas neste aparelho, não em um servidor.
        </p>
        <button
          onClick={excluirFoto}
          disabled={!fotoUsuario}
          className="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-clay disabled:opacity-40"
        >
          <Trash2 size={15} /> Excluir minha foto
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
