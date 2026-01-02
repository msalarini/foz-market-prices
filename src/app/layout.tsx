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
  metadataBase: new URL('https://foz-market.vercel.app'), // Replace with actual production URL
  title: {
    default: "Foz Market | Comparador de Preços de Supermercado",
    template: "%s | Foz Market"
  },
  description: "Encontre o menor preço nos supermercados de Foz do Iguaçu. Leitura automática de encartes com IA para ajudar você a economizar.",
  keywords: ["supermercado", "foz do iguaçu", "preços", "ofertas", "economia", "mercado", "compras"],
  authors: [{ name: "Foz Market Team" }],
  openGraph: {
    title: "Foz Market | Economize no Mercado",
    description: "Compare preços de Arroz, Café, Carne e muito mais em Foz. Encontre as melhores ofertas do dia.",
    type: "website",
    locale: "pt_BR",
    siteName: "Foz Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foz Market | Comparador de Preços",
    description: "Descubra onde pagar menos em Foz do Iguaçu.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Foz Market",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
