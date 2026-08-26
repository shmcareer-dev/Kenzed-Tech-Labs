"use client";

import Link from "next/link";
import {
  KzPageHeroScene,
  KzSpatialIcon3D,
  kindForLabel,
  type KzSpatialKind,
} from "@/components/kz/KzSpatial3D";

export function KzEyebrow({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="kz-eyebrow" style={{ marginBottom: 18 }}>
      <style>{`.kz-eyebrow::before { animation: kzPulse 3s ease-in-out infinite; }`}</style>
      {index ? `${index} / ${children}` : children}
    </div>
  );
}

export function KzSectionTitle({
  children,
  className = "",
  style = {},
  pin = true,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  pin?: boolean;
}) {
  /* Was a KzTechToken3D, which stamps a monogram of whatever string it is
     given — so "How an engagement runs" rendered as a cube reading HAE, and
     every section heading on the site got a meaningless three-letter tile. The
     same slot now carries the object the heading is actually about, routed
     through the same kindForLabel the rest of the site uses. */
  const pinLabel = typeof children === "string" ? children : "AI";
  return (
    <h2 className={`kz-section-title ${className}`} style={style}>
      {children}
      {pin && (
        <span className="kz3-title-pin" aria-hidden="true">
          <KzSpatialIcon3D kind={kindForLabel(pinLabel)} size="1.15em" float={false} />
        </span>
      )}
    </h2>
  );
}

export function KzPageHero({
  eyebrow,
  title,
  lead,
  visual,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  visual?: KzSpatialKind;
}) {
  const titleText = typeof title === "string" ? title : "";
  const primary = visual ?? kindForLabel(`${eyebrow} ${titleText}`);
  const secondary: KzSpatialKind =
    primary === "neural"
      ? "robot"
      : primary === "code"
        ? "chip"
        : primary === "cloud"
          ? "pipeline"
          : primary === "shield"
            ? "database"
            : "neural";

  return (
    <section className="kz-page-hero">
      <span className="kz-page-hero-grid" aria-hidden="true" />
      <div className="kz-wrap kz-page-hero-layout">
        <div className="kz-page-hero-art">
          <KzPageHeroScene primary={primary} secondary={secondary} />
        </div>
        <div className="kz-page-hero-copy">
          <KzEyebrow>{eyebrow}</KzEyebrow>
          <h1 className="kz-page-title" style={{ maxWidth: "18ch", wordBreak: "break-word" }}>
            {title}
          </h1>
          {lead && <p className="kz-page-lead">{lead}</p>}
        </div>
      </div>
    </section>
  );
}

export function KzButton({
  href,
  onClick,
  variant = "primary",
  children,
  className = "",
  style = {},
}: {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const classNames = `kz-btn ${variant === "primary" ? "kz-btn-primary" : "kz-btn-ghost"} ${className}`;
  const mergedStyle: React.CSSProperties = { ...style };
  if (href) {
    return (
      <Link href={href} className={classNames} style={mergedStyle}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={classNames} style={mergedStyle}>
      {children}
    </button>
  );
}

export function KzPill({ children }: { children: React.ReactNode }) {
  return <span className="kz-pill">{children}</span>;
}
