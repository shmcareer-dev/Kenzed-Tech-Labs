import type { Metadata } from "next";
import { Archivo, Archivo_Black, IBM_Plex_Mono } from "next/font/google";

import { KzThemeProvider } from "@/components/kz/KzThemeProvider";
import { KzHeader } from "@/components/kz/KzHeader";
import { KzFooter } from "@/components/kz/KzFooter";
import { Kz3DBackground } from "@/components/kz/Kz3DBackground";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kz3DProvider } from "@/components/kz/Kz3DProvider";
import { site } from "@/content/site";
import { organizationSchema } from "@/lib/seo";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Kenzed Tech Lab | Agentic AI, ML & Custom Software Development",
    template: "%s",
  },
  description:
    "Kenzed Tech Lab builds enterprise-grade agentic AI, machine learning & custom software — AI agents, LLM fine-tuning, voice AI & adaptive web apps. Durgapur & Kolkata, delivered worldwide.",
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>

        <JsonLd data={organizationSchema()} />
        <KzThemeProvider>
          <Kz3DProvider>
            <Kz3DBackground />
            <KzHeader />
            <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
            <KzFooter />
          </Kz3DProvider>
        </KzThemeProvider>
      </body>
    </html>
  );
}
