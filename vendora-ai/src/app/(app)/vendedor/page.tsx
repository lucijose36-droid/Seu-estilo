import type { Metadata } from "next";
import Aviso from "@/components/ui/Aviso";
import { supabaseConfigurado } from "@/lib/supabase/config";
import Simulador from "./Simulador";

export const metadata: Metadata = { title: "Vendedor" };

export default function Vendedor() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Aviso tom="info" titulo="Como este atendente funciona">
        Ele não redige informação sobre o produto: escolhe entre afirmações já
        verificadas e mensagens que você configurou. O texto final é montado
        pelo servidor a partir do banco, e um validador confere cada resposta
        antes de ela sair. Inventar preço não é algo que ele evita — é algo que
        o formato não permite expressar.
      </Aviso>

      {!supabaseConfigurado ? (
        <Aviso tom="atencao" titulo="Banco não configurado">
          O simulador precisa dos produtos e afirmações cadastrados para
          funcionar.
        </Aviso>
      ) : (
        <Simulador />
      )}
    </div>
  );
}
