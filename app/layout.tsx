import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EnergiaLivre | Marketplace de energia solar compartilhada",
  description:
    "Conectamos quem gera energia solar excedente com quem quer economizar. O marketplace brasileiro de compartilhamento de energia limpa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full scroll-smooth`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
