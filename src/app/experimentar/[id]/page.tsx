"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import clsx from "clsx";
import TopBar from "@/components/TopBar";
import LookVisual from "@/components/LookVisual";
import Button from "@/components/Button";
import { useApp } from "@/lib/store";

const FRASES_IA = [
  "Enviando sua foto com segurança...",
  "Gerando a peça de referência...",
  "Aplicando o look na sua foto...",
  "Isso pode levar até 30 segundos...",
];

export default function Experimentar() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentLooks, savedLooks, fotoUsuario, hydrated } = useApp();

  const [genero, setGenero] = useState<"homem" | "mulher">("homem");
  const [preparando, setPreparando] = useState(true);
  const [iaDisponivel, setIaDisponivel] = useState(false);
  const [gerandoReal, setGerandoReal] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);
  const [imagemReal, setImagemReal] = useState<string | null>(null);
  const [erroIa, setErroIa] = useState<string | null>(null);

  const look = useMemo(
    () => currentLooks.find((l) => l.id === id) ?? savedLooks.find((l) => l.id === id) ?? null,
    [currentLooks, savedLooks, id],
  );

  useEffect(() => {
    const t = setTimeout(() => setPreparando(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/try-on")
      .then((r) => r.json())
      .then((d) => setIaDisponivel(Boolean(d.available)))
      .catch(() => setIaDisponivel(false));
  }, []);

  useEffect(() => {
    if (!gerandoReal) return;
    const intervalo = setInterval(() => {
      setFraseIndex((i) => (i + 1) % FRASES_IA.length);
    }, 2200);
    return () => clearInterval(intervalo);
  }, [gerandoReal]);

  async function gerarFotoReal() {
    if (!look || !fotoUsuario) return;
    setGerandoReal(true);
    setErroIa(null);
    setFraseIndex(0);
    try {
      const peca = genero === "homem" ? look.homem : look.mulher;
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fotoPessoa: fotoUsuario,
          descricaoRoupa: `${peca.roupa} Sapato: ${peca.calcado}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar a imagem.");
      setImagemReal(data.imageUrl);
    } catch (e) {
      setErroIa(e instanceof Error ? e.message : "Não foi possível gerar a foto agora.");
    } finally {
      setGerandoReal(false);
    }
  }

  if (!hydrated) return null;
  if (!look) {
    return (
      <main className="flex min-h-dvh flex-col">
        <TopBar />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-[14px] text-ink-soft">
          Não encontramos esse look.
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar titulo="Experimentar em mim" />

      {preparando ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-paper">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
            <Sparkles size={22} className="text-gold" />
          </div>
          <p className="font-display text-[18px] italic text-ink">
            Sua simulação está sendo preparada...
          </p>
        </div>
      ) : (
        <div className="flex-1 px-6 pb-10 pt-2">
          <div className="flex gap-2">
            {(["homem", "mulher"] as const).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGenero(g);
                  setImagemReal(null);
                  setErroIa(null);
                }}
                className={clsx(
                  "rounded-full px-5 py-2 text-[13px] font-medium capitalize transition-colors",
                  genero === g ? "bg-ink text-cream" : "bg-cream-soft text-ink-soft",
                )}
              >
                {g === "homem" ? "Para homens" : "Para mulheres"}
              </button>
            ))}
          </div>

          {imagemReal ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-taupe-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagemReal} alt="Você com o look" className="w-full object-cover" />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-2xl border border-taupe-line">
                {fotoUsuario ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUsuario} alt="Você" className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center bg-cream-soft text-center text-[12px] text-ink-soft">
                    Sem foto
                  </div>
                )}
              </div>
              <LookVisual paleta={look.paletaCores} />
            </div>
          )}

          {gerandoReal && (
            <p className="mt-3 text-center text-[12.5px] italic text-ink-soft">
              {FRASES_IA[fraseIndex]}
            </p>
          )}
          {erroIa && (
            <p className="mt-3 rounded-xl bg-clay/10 px-4 py-2.5 text-center text-[12.5px] text-clay">
              {erroIa}
            </p>
          )}

          {!imagemReal && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-cream-soft px-4 py-2 text-[11.5px] text-ink-soft">
              <Sparkles size={13} className="text-gold" />
              {iaDisponivel
                ? "Composição estilizada — gere a foto realista abaixo"
                : "Composição estilizada — simulação, não uma foto real"}
            </div>
          )}

          <h1 className="mt-6 font-display text-[21px] text-ink">{look.titulo} em você</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {imagemReal
              ? "Imagem gerada por inteligência artificial a partir da sua foto — pode conter pequenas imperfeições."
              : iaDisponivel
                ? "Toque no botão abaixo para gerar uma foto real de você usando esse look, feita por IA a partir da sua imagem."
                : "Essa é uma visualização simulada de como as peças e cores do look conversam com a sua foto. A geração de foto realista ainda não está configurada nesta versão."}
          </p>

          <div className="mt-8 space-y-3">
            {iaDisponivel && fotoUsuario && (
              <Button
                icon={<Wand2 size={17} />}
                onClick={gerarFotoReal}
                disabled={gerandoReal}
              >
                {gerandoReal
                  ? "Gerando..."
                  : imagemReal
                    ? "Gerar novamente"
                    : "Gerar minha foto com esse look"}
              </Button>
            )}
            <Button variant="secondary" onClick={() => router.push(`/resultado/${look.id}`)}>
              Voltar para o look
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
