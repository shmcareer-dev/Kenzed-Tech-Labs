"use client";

import { useEffect, useRef } from "react";

interface KzRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function KzReveal({
  children,
  delay = 0,
  className = "",
  style = {},
}: KzRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          io.unobserve(target);
          setTimeout(() => {
            target.classList.add("is-visible");
          }, Math.min(delay, 6) * 90);
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`kz-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
