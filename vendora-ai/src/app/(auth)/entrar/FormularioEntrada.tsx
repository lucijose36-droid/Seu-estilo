"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Botao from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import Aviso from "@/components/ui/Aviso";
import { entrar, type EstadoEntrada } from "./actions";

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" largura="cheia" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Botao>
  );
}

export default function FormularioEntrada({ proximo }: { proximo: string }) {
  const [estado, acao] = useActionState<EstadoEntrada, FormData>(entrar, {});

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="proximo" value={proximo} />

      {estado.erro && <Aviso tom="erro">{estado.erro}</Aviso>}

      <CampoTexto
        id="email"
        name="email"
        type="email"
        rotulo="E-mail"
        autoComplete="email"
        required
        obrigatorio
      />
      <CampoTexto
        id="senha"
        name="senha"
        type="password"
        rotulo="Senha"
        autoComplete="current-password"
        required
        obrigatorio
      />

      <BotaoEnviar />
    </form>
  );
}
