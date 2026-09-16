import type { Metadata } from "next";
import FormularioProduto from "../FormularioProduto";

export const metadata: Metadata = { title: "Novo produto" };

export default function NovoProduto() {
  return (
    <div className="mx-auto max-w-3xl">
      <FormularioProduto />
    </div>
  );
}
