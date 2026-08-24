import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

import { KzThemeProvider } from "@/components/kz/KzThemeProvider";
import { KzHeader } from "@/components/kz/KzHeader";
import { KzFooter } from "@/components/kz/KzFooter";
import { KzChatbot } from "@/components/kz/KzChatbot";
import { Kz3DBackgroundDeferred } from "@/components/kz/Kz3DBackgroundDeferred";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kz3DProvider } from "@/components/kz/Kz3DProvider";
import { KzSmoothScroll } from "@/components/kz/motion/KzSmoothScroll";
import { KzScrollProgress } from "@/components/kz/motion/KzScrollFx";
import { KzCustomCursor } from "@/components/kz/motion/KzPointer";
import { KzCommandPalette, KzPageTransition } from "@/components/kz/motion/KzNav";
import { site } from "@/content/site";
import { organizationSchema } from "@/lib/seo";

import "./globals.css";

/* Display. Space Grotesk replaces Archivo Black, which shipped a single 400
   cut and forced every heading through one very heavy weight. Space Grotesk
   carries real 500/600/700 cuts, so the heading scale can express hierarchy
   through weight instead of size alone. It is also ~21% narrower than Archivo
   Black at the same size (KENZED measures 3.65em against 4.61em), which is why
   the wordmark and the heading tracking are retuned rather than carried over. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>

        <JsonLd data={organizationSchema()} />
        <KzThemeProvider>
          <Kz3DProvider>
            {/* Damped scrolling and the scroll read-out are installed before any
                content mounts, so the first ScrollTrigger refresh measures a
                page that already has its final scroller. Both no-op entirely
                under prefers-reduced-motion. */}
            <KzSmoothScroll />
            <KzScrollProgress />
            <KzCustomCursor />

            <Kz3DBackgroundDeferred />
            <KzHeader />
            {/* Fixed chrome stays OUTSIDE the transition wrapper: the wrapper
                carries a transform mid-route-change, which would otherwise
                become the containing block for everything fixed inside it. */}
            <main style={{ position: "relative", zIndex: 1 }}>
              <KzPageTransition>{children}</KzPageTransition>
            </main>
            <KzFooter />
            <KzChatbot />

            {/* The palette owns Cmd/Ctrl+K, but a keyboard hint is useless on a
                phone — so the built-in trigger is parked opposite the chatbot
                where a thumb can actually reach it. */}
            <div
              style={{
                position: "fixed",
                left: "clamp(14px, 4vw, 26px)",
                bottom: "calc(clamp(14px, 4vw, 26px) + env(safe-area-inset-bottom, 0px))",
                zIndex: 40,
              }}
            >
              <KzCommandPalette triggerLabel="Search" />
            </div>
          </Kz3DProvider>
        </KzThemeProvider>
      </body>
    </html>
  );
}
