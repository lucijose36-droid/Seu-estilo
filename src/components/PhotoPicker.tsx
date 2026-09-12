"use client";

import { useRef } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";

export default function PhotoPicker({
  foto,
  onChange,
}: {
  foto: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  if (foto) {
    return (
      <div className="relative mx-auto w-full max-w-[280px]">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl border border-taupe-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="Sua foto" className="h-full w-full object-cover" />
        </div>
        <button
          onClick={() => onChange(null)}
          aria-label="Remover foto"
          className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream shadow-lg active:scale-95"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col gap-3">
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-taupe-line bg-paper/60 text-ink-soft">
        <ImageIcon size={32} strokeWidth={1.3} />
        <span className="text-[13px]">Nenhuma foto selecionada</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-2xl border border-taupe-line bg-transparent py-4 text-ink active:scale-[0.98]"
        >
          <Camera size={20} strokeWidth={1.6} />
          <span className="text-[12.5px] font-medium">Tirar uma foto</span>
        </button>
        <button
          onClick={() => galeriaRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-2xl border border-taupe-line bg-transparent py-4 text-ink active:scale-[0.98]"
        >
          <ImageIcon size={20} strokeWidth={1.6} />
          <span className="text-[12.5px] font-medium">Escolher da galeria</span>
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFile}
      />
      <input ref={galeriaRef} type="file" accept="image/*" onChange={handleFile} />
    </div>
  );
}
