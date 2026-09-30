import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import { Cabecalho } from "@/components/layout/cabecalho";
import { FundoArte } from "@/components/layout/fundo-arte";
import { NavegacaoTopoBase } from "@/components/layout/navegacao-base";
import { NavegacaoTopo } from "@/components/layout/navegacao";
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
      <body className="min-h-full">
        <FundoArte />
        <Cabecalho />
        <SobreProjeto />

        {/* wrapper fixed que envolve a navegação */}
        <div
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            right: "0px",
            zIndex: 9999,
            width: "100%",
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <Suspense fallback={<NavegacaoTopoBase caminho={null} />}>
              <NavegacaoTopo />
            </Suspense>
          </div>
        </div>

        <div className="h-32" />

        <div className="mx-auto w-full max-w-5xl pb-16 sm:pb-0">
          {children}
        </div>

        <Suspense fallback={null}>
          <RodapeComData />
        </Suspense>

        {modal}
      </body>
    </html>
  );
}
