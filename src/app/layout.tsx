import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { KzHeader } from "@/components/kz/KzHeader";
import { KzFooter } from "@/components/kz/KzFooter";
import { KzChatbot } from "@/components/kz/KzChatbot";
import { KzBackTop } from "@/components/kz/KzBackTop";
import { JsonLd } from "@/components/ui/JsonLd";
import { KzSmoothScroll } from "@/components/kz/motion/KzSmoothScroll";
import { KzScrollProgress } from "@/components/kz/motion/KzScrollFx";
import { KzCustomCursor } from "@/components/kz/motion/KzPointer";
import { KzCommandPalette, KzPageTransition } from "@/components/kz/motion/KzNav";
import { asset, site } from "@/content/site";
import { primaryNav } from "@/content/nav";
import { OG_IMAGE, organizationSchema, siteNavigationSchema, webSiteSchema } from "@/lib/seo";

import "./globals.css";

export const viewport: Viewport = {
  /* One value, not a light/dark pair: the site is dark whatever the OS
     prefers, and advertising a light theme-color painted the browser chrome
     pale above a dark page. */
  themeColor: "#05080d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

/* One family for display AND body: Geist is a variable font, so requesting no
   explicit weights ships the whole 100-900 axis in a single file and the CSS
   can dial in the design's off-grid weights (520, 550, 560) directly. Display
   and body roles are separated by weight and tracking, not by family — which is
   why --font-display and --font-sans both resolve to this one variable in
   globals.css. */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
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
  icons: {
    icon: [
      { url: asset("/favicon.ico"), sizes: "48x48" },
      { url: asset("/icon.svg"), type: "image/svg+xml" },
    ],
    apple: asset("/icon.svg"),
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>

        <JsonLd data={organizationSchema()} />
        {/* The site as an entity, and its navigation as a graph. The second is
            the input Google reads when deciding which pages deserve to appear
            as sitelinks under the main result — a header rendered by client
            JavaScript is not that input. Both are emitted once, here, rather
            than repeated per page. */}
        <JsonLd data={webSiteSchema()} />
        <JsonLd data={siteNavigationSchema(primaryNav)} />
        {/* Damped scrolling and the scroll read-out are installed before any
            content mounts, so the first ScrollTrigger refresh measures a
            page that already has its final scroller. Both no-op entirely
            under prefers-reduced-motion. */}
        <KzSmoothScroll />
        <KzScrollProgress />
        <KzCustomCursor />

        <KzHeader />
        {/* Fixed chrome stays OUTSIDE the transition wrapper: the wrapper
            carries a transform mid-route-change, which would otherwise
            become the containing block for everything fixed inside it. */}
        <main style={{ position: "relative", zIndex: 1 }}>
          <KzPageTransition>{children}</KzPageTransition>
        </main>
        <KzFooter />
        <KzChatbot />
        <KzBackTop />

        {/* The palette owns Cmd/Ctrl+K. Its visible trigger is parked
            opposite the chatbot where a thumb can reach it — but only on
            viewports where the header pill's own trigger is collapsed;
            above 920px the pill carries the visible trigger and this dock
            hides (display:none keeps the component mounted, so the hotkey
            binding survives). */}
        <div
          className="kz-palette-dock"
          style={{
            position: "fixed",
            left: "clamp(14px, 4vw, 26px)",
            bottom: "calc(clamp(14px, 4vw, 26px) + env(safe-area-inset-bottom, 0px))",
            zIndex: 40,
          }}
        >
          <KzCommandPalette triggerLabel="Search" />
        </div>
      </body>
    </html>
  );
}
