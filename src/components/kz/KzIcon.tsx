"use client";

export type KzIconKey =
  | "agent"
  | "ml"
  | "llm"
  | "voice"
  | "web"
  | "ux"
  | "ent"
  | "util"
  | "bed"
  | "food"
  | "power"
  | "gpu"
  | "hw"
  | "sw"
  | "net"
  | "studio"
  | "sec"
  | "cont"
  | "pin"
  | "bld"
  | "phone";

const ICONS: Record<KzIconKey, string> = {
  agent:
    "M12 2a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3h-1v1a3 3 0 0 1-6 0v-1H8a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3h1V5a3 3 0 0 1 3-3z M12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z",
  ml: "M4 19V5m0 14h16 M8 15l3-4 3 2 4-6 M18 7l.01.01M8 15l.01.01M11 11l.01.01M14 13l.01.01",
  llm: "M3 4h18v14H3z M8 9h8M8 13h5M7 22h10",
  voice:
    "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M6 11a6 6 0 0 0 12 0 M12 17v4",
  web: "M3 4h18v16H3z M3 9h18 M8 4v5",
  ux: "M4 5h16v11H4z M9 20h6M12 16v4M8 9l2 2-2 2M13 9h3",
  ent: "M4 21V8l8-5 8 5v13 M9 21v-6h6v6 M4 12h16",
  util:
    "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.6-.6-2.5 2.5-2.5z",
  bed: "M3 18v-6h18v6 M3 12V8a2 2 0 0 1 2-2h5v6 M21 12v6M3 18v2M21 18v2",
  food:
    "M4 3v7a3 3 0 0 0 6 0V3 M7 3v18 M17 3c-1.5 1-2 3-2 5s.5 4 2 5v8",
  power: "M13 2 4 14h7l-1 8 10-12h-7l1-8z",
  gpu: "M3 6h18v12H3z M7 10v4M11 10v4M15 10v4",
  hw: "M4 4h16v16H4z M9 9h6v6H9z M2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2",
  sw: "M8 3H5a2 2 0 0 0-2 2v3 M16 3h3a2 2 0 0 1 2 2v3 M8 21H5a2 2 0 0 1-2-2v-3 M16 21h3a2 2 0 0 0 2-2v-3 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  net: "M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M12 7v4 M12 11l-7 6 M12 11l7 6",
  studio:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 3v3M12 18v3M3 12h3M18 12h3",
  sec: "M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3z M9 12l2 2 4-4",
  cont: "M21 12a9 9 0 1 1-3-6.7L21 8 M21 4v4h-4",
  pin: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  bld: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z",
};

interface KzIconProps {
  name: KzIconKey;
  size?: number;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function KzIcon({
  name,
  size = 22,
  className = "",
  stroke = "var(--acc)",
  strokeWidth = 1.7,
}: KzIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

export function KzLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="kzg-fa"
          x1="0"
          y1="5"
          x2="0"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" style={{ stopColor: "var(--acc3)" }} />
          <stop offset="1" style={{ stopColor: "var(--acc)" }} />
        </linearGradient>
        <linearGradient
          id="kzg-fb"
          x1="11"
          y1="5"
          x2="29"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" style={{ stopColor: "var(--acc)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--acc2)" }} />
          <stop offset="1" style={{ stopColor: "var(--acc3)" }} />
        </linearGradient>
      </defs>
      <rect x="3" y="5" width="5.5" height="22" rx="1.5" fill="url(#kzg-fa)" />
      <path
        d="M29 5h-7.2L11.5 16l10.3 11H29L18.7 16z"
        fill="url(#kzg-fb)"
      />
    </svg>
  );
}
