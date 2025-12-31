import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foz Market | Comparador de Preços de Supermercado",
  description: "Encontre o menor preço nos supermercados de Foz do Iguaçu. Leitura automática de encartes com IA.",
  openGraph: {
    title: "Foz Market | Economize no Mercado",
    description: "Compare preços de Arroz, Café, Carne e muito mais em Foz.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
