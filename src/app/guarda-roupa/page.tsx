"use client";

import { useRef, useState } from "react";
import { Plus, Shirt, Sparkles, Trash2, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/Button";
import { Chip } from "@/components/SelectCard";
import { useApp } from "@/lib/store";
import { montarLookComGuardaRoupa } from "@/lib/mockEngine";
import type { WardrobeCategoria } from "@/lib/types";

const CATEGORIAS: WardrobeCategoria[] = [
  "Camisas",
  "Camisetas",
  "Calças",
  "Blazers",
  "Ternos",
  "Vestidos",
  "Saias",
  "Sapatos",
  "Bolsas",
  "Acessórios",
];

export default function GuardaRoupa() {
  const { wardrobeItems, addWardrobeItem, removeWardrobeItem, hydrated } = useApp();
  const [abrindoForm, setAbrindoForm] = useState(false);
  const [categoria, setCategoria] = useState<WardrobeCategoria>("Camisas");
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ReturnType<typeof montarLookComGuardaRoupa> | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function salvarPeca() {
    if (!foto) return;
    addWardrobeItem({
      id: `${Date.now()}`,
      categoria,
      foto,
      nome: nome.trim() || categoria,
      createdAt: Date.now(),
    });
    setAbrindoForm(false);
    setFoto(null);
    setNome("");
  }

  if (!hydrated) return null;

  return (
    <main className="flex min-h-dvh flex-col pb-28">
      <div className="flex items-center justify-between px-6 pb-4 pt-[max(24px,env(safe-area-inset-top))]">
        <div>
          <h1 className="font-display text-[26px] text-ink">Meu Guarda-Roupa</h1>
          <p className="mt-1 text-[13px] text-ink-soft">{wardrobeItems.length} peças cadastradas</p>
        </div>
        <button
          onClick={() => setAbrindoForm(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream active:scale-95"
          aria-label="Adicionar peça"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="px-6">
        <Button
          variant="secondary"
          icon={<Sparkles size={16} />}
          onClick={() => setResultado(montarLookComGuardaRoupa(wardrobeItems))}
        >
          Montar um look apenas com minhas roupas
        </Button>
      </div>

      {resultado && (
        <div className="mx-6 mt-4 rounded-2xl border border-taupe-line bg-paper px-5 py-4">
          {resultado.escolhidos.length === 0 ? (
            <p className="text-[13.5px] text-ink-soft">
              Cadastre algumas peças primeiro para montarmos um look com o seu guarda-roupa.
            </p>
          ) : (
            <>
              <p className="text-[12px] font-medium uppercase tracking-wide text-ink-soft/70">
                Sugestão com suas peças
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {resultado.escolhidos.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-cream-soft px-3 py-1.5 text-[12.5px] text-ink"
                  >
                    {item.nome}
                  </span>
                ))}
              </div>
              {resultado.faltando.length > 0 && (
                <p className="mt-2.5 text-[12.5px] text-clay">
                  Falta apenas {resultado.faltando.join(" e ")}.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-6 px-6">
        {wardrobeItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-taupe-line py-16 text-center text-ink-soft">
            <Shirt size={26} strokeWidth={1.3} />
            <p className="max-w-[220px] text-[13px]">
              Cadastre suas peças tirando fotos para montar looks com o que você já tem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {wardrobeItems.map((item) => (
              <div key={item.id} className="relative">
                <div className="aspect-square overflow-hidden rounded-xl border border-taupe-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.foto} alt={item.nome} className="h-full w-full object-cover" />
                </div>
                <p className="mt-1 truncate text-[11px] text-ink-soft">{item.nome}</p>
                <button
                  onClick={() => removeWardrobeItem(item.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream"
                  aria-label="Remover peça"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {abrindoForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40">
          <div className="w-full max-w-[560px] rounded-t-3xl bg-cream px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[19px] text-ink">Nova peça</h2>
              <button onClick={() => setAbrindoForm(false)} aria-label="Fechar">
                <X size={20} className="text-ink-soft" />
              </button>
            </div>

            <button
              onClick={() => inputRef.current?.click()}
              className="mt-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-taupe-line bg-paper"
            >
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="Prévia" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[13px] text-ink-soft">Tirar ou escolher foto</span>
              )}
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />

            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIAS.map((c) => (
                <Chip key={c} selecionado={categoria === c} onClick={() => setCategoria(c)}>
                  {c}
                </Chip>
              ))}
            </div>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da peça (opcional)"
              className="mt-4 w-full rounded-xl border border-taupe-line bg-paper px-4 py-3 text-[14px] outline-none placeholder:text-ink-soft/50 focus:border-gold"
            />

            <div className="mt-5">
              <Button disabled={!foto} onClick={salvarPeca}>
                Salvar peça
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
