import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import { Cabecalho } from "@/components/layout/cabecalho";
import { FundoArte } from "@/components/layout/fundo-arte";
import {
  BarraInferiorBase,
  NavegacaoTopoBase,
} from "@/components/layout/navegacao-base";
import { BarraInferior, NavegacaoTopo } from "@/components/layout/navegacao";
import { Rodape } from "@/components/layout/rodape";
import { SobreProjeto } from "@/components/layout/sobre-projeto";
import { dataUltimaAtualizacao } from "@/lib/dados/servicos";
import "./globals.css";

const corpo = Inter({
  variable: "--fonte-corpo",
  subsets: ["latin"],
  display: "swap",
});

const titulo = Bricolage_Grotesque({
  variable: "--fonte-titulo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teiasp.com.br"),
  title: {
    default: "Teia SP — guia colaborativo de dispositivos de São Paulo",
    template: "%s · Teia SP",
  },
  description:
    "Guia colaborativo de dispositivos de saúde, assistência social e serviços públicos de São Paulo. Encontre CAPS, CRAS, CREAS, UBS e outros serviços.",
  keywords: [
    "Teia SP",
    "dispositivos saúde São Paulo",
    "CAPS",
    "CRAS",
    "CREAS",
    "UBS",
    "assistência social SP",
    "saúde mental SP",
    "serviços públicos São Paulo",
  ],
  authors: [{ name: "Teia SP" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Teia SP",
    title: "Teia SP — guia colaborativo de dispositivos de São Paulo",
    description:
      "Encontre dispositivos, equipamentos e iniciativas de saúde, assistência social e serviços públicos em São Paulo.",
    images: [{ url: "/img/logo-teiasp.png", width: 594, height: 385, alt: "Teia SP" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#534AB7",
  viewportFit: "cover",
};

/** O rodapé lê a data do conteúdo; enquanto isso o resto da página já aparece. */
async function RodapeComData() {
  return <Rodape atualizadoEm={await dataUltimaAtualizacao()} />;
}

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      translate="no"
      className={`${corpo.variable} ${titulo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <FundoArte />
        <Cabecalho />
        <SobreProjeto />

        {/* o fallback é a própria navegação sem destaque: nada pisca, só o
            item ativo acende quando o cliente assume */}
        <Suspense fallback={<NavegacaoTopoBase caminho={null} />}>
          <NavegacaoTopo />
        </Suspense>

        {/* faixa central clara sobre a aquarela, como no site atual: a arte
            emoldura, o conteúdo fica legível */}
        <div className="mx-auto w-full max-w-5xl flex-1 bg-sur/92 pb-16 shadow-[0_0_60px_rgba(60,52,137,0.10)] backdrop-blur-[2px] sm:pb-0">
          {children}
        </div>

        <Suspense fallback={null}>
          <RodapeComData />
        </Suspense>

        <Suspense fallback={<BarraInferiorBase caminho={null} />}>
          <BarraInferior />
        </Suspense>
        {modal}
      </body>
    </html>
  );
}
