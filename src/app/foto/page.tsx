"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import Button from "@/components/Button";
import PhotoPicker from "@/components/PhotoPicker";
import { useApp } from "@/lib/store";

export default function MinhaFoto() {
  const router = useRouter();
  const { fotoUsuario, setFotoUsuario } = useApp();

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar passoAtual={1} totalPassos={4} onBack={() => router.push("/")} />

      <div className="flex-1 px-6 pb-8 pt-4">
        <h1 className="font-display text-[26px] text-ink">Vamos conhecer você</h1>
        <p className="mt-2 max-w-[320px] text-[13.5px] leading-relaxed text-ink-soft">
          Sua imagem é utilizada para criar sugestões personalizadas de estilo — subtom,
          contraste e formato do rosto ajudam a calibrar cores e cortes.
        </p>

        <div className="mt-8">
          <PhotoPicker foto={fotoUsuario} onChange={setFotoUsuario} />
        </div>

        <p className="mx-auto mt-6 max-w-[280px] text-center text-[11.5px] text-ink-soft/70">
          Não analisamos raça, etnia, religião, orientação sexual ou qualquer outra
          característica sensível — apenas atributos de estilo.
        </p>
      </div>

      <div className="sticky bottom-0 bg-cream px-6 pb-8 pt-4">
        <Button disabled={!fotoUsuario} onClick={() => router.push("/ocasiao")}>
          Continuar
        </Button>
      </div>
    </main>
  );
}
