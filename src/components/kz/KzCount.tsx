"use client";

import { useEffect, useRef, useState } from "react";

interface KzCountProps {
  target: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function KzCount({ target, suffix = "", className = "", style = {} }: KzCountProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf: number;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const dur = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const current = Math.floor((1 - Math.pow(1 - p, 3)) * target);
            setValue(current);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setValue(target);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className={className} style={style}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
