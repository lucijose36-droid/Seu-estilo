import type { Metadata } from "next";
import Wordmark from "@/components/marca/Wordmark";
import Aviso from "@/components/ui/Aviso";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { destinoSeguro } from "@/lib/urls";
import FormularioEntrada from "./FormularioEntrada";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <Wordmark tamanho="lg" />
          <p className="mt-3 text-[14px] leading-relaxed text-texto-suave">
            Seu vendedor digital, do interesse à comissão.
          </p>
        </div>

        <div className="rounded-xl border border-borda bg-superficie p-6">
          {!supabaseConfigurado ? (
            <Aviso tom="atencao" titulo="Ambiente sem banco configurado">
              Defina <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para
              habilitar a autenticação. O restante da aplicação continua
              navegável para inspeção da interface.
            </Aviso>
          ) : (
            <FormularioEntrada proximo={destinoSeguro(proximo)} />
          )}
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-texto-suave">
          A Vendora AI divulga ofertas de terceiros e pode receber comissão de
          afiliado. O checkout e a entrega são responsabilidade da plataforma do
          produtor.
        </p>
      </div>
    </main>
  );
}
