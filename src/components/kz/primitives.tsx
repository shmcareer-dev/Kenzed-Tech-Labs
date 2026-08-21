"use client";

import Link from "next/link";

export function KzEyebrow({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="kz-eyebrow" style={{ marginBottom: 18 }}>
      {index ? `${index} / ${children}` : children}
    </div>
  );
}

export function KzSectionTitle({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2 className={`kz-section-title ${className}`} style={style}>
      {children}
    </h2>
  );
}

export function KzPageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <section
      style={{
        padding: "clamp(130px, 18vh, 180px) 0 clamp(40px, 6vw, 70px)",
        position: "relative",
      }}
    >
      <div className="kz-wrap">
        <KzEyebrow>{eyebrow}</KzEyebrow>
        <h1 className="kz-page-title" style={{ maxWidth: "18ch" }}>
          {title}
        </h1>
        {lead && <p className="kz-page-lead">{lead}</p>}
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

export function KzCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`kz-card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function KzPill({ children }: { children: React.ReactNode }) {
  return <span className="kz-pill">{children}</span>;
}

export function KzCube({ size = 54, opacity = 0.7, className = "" }: { size?: number; opacity?: number; className?: string }) {
  const half = size / 2;
  const faces = [
    `translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(270deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  const colors = ["var(--acc)", "var(--acc2)", "var(--acc)", "var(--acc2)", "var(--acc3)", "var(--acc3)"];
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        perspective: size * 7,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "kzCube 15s linear infinite",
        }}
      >
        {faces.map((t, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              border: `1.5px solid ${colors[i]}`,
              transform: t,
              display: "block",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function KzSphere({ size = 60, opacity = 0.55, className = "" }: { size?: number; opacity?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        perspective: size * 6,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "kzSphere 12s linear infinite",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid var(--acc)",
            borderRadius: "50%",
            display: "block",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid var(--acc2)",
            borderRadius: "50%",
            transform: "rotateX(60deg)",
            display: "block",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid var(--acc3)",
            borderRadius: "50%",
            transform: "rotateY(60deg)",
            display: "block",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid var(--acc2)",
            borderRadius: "50%",
            transform: "rotateX(-60deg)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export function KzTorus({ size = 70, opacity = 0.5, className = "" }: { size?: number; opacity?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        perspective: size * 6,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "kzTorus 10s linear infinite",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid var(--acc)",
            borderRadius: "50%",
            transform: "rotateX(70deg)",
            display: "block",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: "14%",
            border: "1.5px solid var(--acc2)",
            borderRadius: "50%",
            transform: "rotateX(70deg)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export function KzOrbitDots({ count = 8, radius = 32, className = "" }: { count?: number; radius?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: radius * 2 + 16,
        height: radius * 2 + 16,
        position: "relative",
        animation: "kzOrbit 8s linear infinite",
        pointerEvents: "none",
        opacity: 0.6,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: radius + x + 8,
              top: radius + y + 8,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: i % 3 === 0 ? "var(--acc)" : i % 3 === 1 ? "var(--acc2)" : "var(--acc3)",
              boxShadow: "0 0 8px currentColor",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}

export function KzMascot({ size = 64 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -64,
        left: "min(56%, 520px)",
        width: size,
        height: (size * 78) / 64,
        display: "block",
        pointerEvents: "none",
        animation: "kzBob 4s ease-in-out infinite alternate",
        zIndex: 2,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          height: 9,
          background: "var(--acc2)",
          display: "block",
          borderRadius: 2,
        }}
      />
      <span
        style={{
          position: "absolute",
          top: -3,
          left: "50%",
          transform: "translateX(-50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--acc3)",
          boxShadow: "0 0 10px var(--acc3)",
          display: "block",
          animation: "kzPulse 2s infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 38,
          height: 28,
          borderRadius: 11,
          background: "var(--gr)",
          boxShadow: "0 10px 20px -8px rgba(28,80,224,.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <span
          style={{
            width: 6,
            height: 9,
            borderRadius: 3,
            background: "#fff",
            display: "block",
            animation: "kzEye 4.6s infinite",
          }}
        />
        <span
          style={{
            width: 6,
            height: 9,
            borderRadius: 3,
            background: "#fff",
            display: "block",
            animation: "kzEye 4.6s infinite",
          }}
        />
      </span>
      <span
        style={{
          position: "absolute",
          top: 42,
          left: "50%",
          transform: "translateX(-50%)",
          width: 30,
          height: 19,
          borderRadius: 8,
          background: "var(--gr)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "rgba(255,255,255,.85)",
            display: "block",
            animation: "kzPulse 2.4s infinite",
          }}
        />
      </span>
      <span
        style={{
          position: "absolute",
          top: 45,
          left: 7,
          width: 7,
          height: 15,
          borderRadius: 4,
          background: "var(--acc2)",
          display: "block",
          transform: "rotate(16deg)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 45,
          right: 7,
          width: 7,
          height: 15,
          borderRadius: 4,
          background: "var(--acc2)",
          display: "block",
          transform: "rotate(-16deg)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 59,
          left: 20,
          width: 7,
          height: 19,
          borderRadius: 4,
          background: "var(--acc2)",
          display: "block",
          transformOrigin: "top center",
          animation: "kzSwing 2.6s ease-in-out infinite alternate",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 59,
          right: 20,
          width: 7,
          height: 19,
          borderRadius: 4,
          background: "var(--acc2)",
          display: "block",
          transformOrigin: "top center",
          animation: "kzSwing 2.9s ease-in-out .7s infinite alternate-reverse",
        }}
      />
    </span>
  );
}
