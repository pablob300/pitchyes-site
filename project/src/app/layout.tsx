import type { Metadata } from "next";
import { brandFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "PitchYes",
  description: "IA para ligações de vendas e atendimento.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={brandFont.variable}>
      <body>{children}</body>
    </html>
  );
}
