import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import NavMobile from "@/components/layout/NavMobile";
import TopBar from "@/components/layout/TopBar";
import Aviso from "@/components/ui/Aviso";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { obterContexto } from "@/server/dal/session";

export default async function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await obterContexto();

  // Sem sessao E com banco configurado, a area logada nao se abre.
  // Sem banco configurado, a interface segue navegavel para inspecao, com
  // aviso explicito — e melhor do que um laco de redirecionamento para uma
  // tela de login que tambem nao consegue funcionar.
  if (!ctx && supabaseConfigurado) redirect("/entrar");

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={ctx?.email ?? null} />
        <a href="#conteudo" className="pular-link">
          Pular para o conteúdo
        </a>
        <main id="conteudo" className="flex-1 px-4 pb-24 pt-5 lg:px-6 lg:pb-10">
          {!ctx && (
            <Aviso tom="atencao" titulo="Modo de inspeção" className="mb-5">
              Sem conexão com o banco, as telas mostram apenas a estrutura. Os
              dados aparecem depois de configurar o Supabase — nenhum número é
              inventado para preencher a tela.
            </Aviso>
          )}
          {children}
        </main>
      </div>
      <NavMobile />
    </div>
  );
}
