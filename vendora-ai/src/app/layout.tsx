import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vendora AI",
    template: "%s · Vendora AI",
  },
  description:
    "Plataforma de captação, atendimento e análise para vendas de afiliados, com automação responsável.",
  applicationName: "Vendora AI",
};

export const viewport: Viewport = {
  themeColor: "#101B35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
