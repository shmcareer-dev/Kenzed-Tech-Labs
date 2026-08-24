"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { site } from "@/content/site";
import { KzIcon } from "./KzIcon";

/** Set once the launcher has been opened, so repeat visitors stop seeing the pulse. */
const STORAGE_KEY = "kz-chat-seen";

const phoneDigits = site.phone.replace(/\D/g, "");

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Intent = { label: string; prompt: string };

const INTENTS: Intent[] = [
  { label: "Pricing", prompt: "Could you share indicative pricing and engagement models?" },
  { label: "Book a demo", prompt: "I would like to book a demo of your agentic AI work." },
  {
    label: "Training & live projects",
    prompt: "Please send details of your training programme and live project work.",
  },
  {
    label: "Custom requirement",
    prompt: "I have a custom requirement I would like to scope with your team.",
  },
  {
    label: "Talk to an engineer",
    prompt: "I have a technical question and would like to speak to an engineer.",
  },
];

export function KzChatbot() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const startPulse = () => {
      let seen = false;
      try {
        seen = window.localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        // Storage blocked — treat the visit as a first visit.
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPulse(!seen && !reduced);
    };
    startPulse();
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    setPulse(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const stops = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) closePanel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, closePanel]);

  const handoff = useCallback(
    (topic: string, fallback: string) => {
      const lines = [
        `*Enquiry from the ${site.name} website*`,
        ``,
        `*Topic:* ${topic}`,
        `*Message:*`,
        query.trim() || fallback,
      ];
      const text = encodeURIComponent(lines.join("\n"));
      const url = `https://wa.me/${phoneDigits}?text=${text}`;

      let handle: Window | null = null;
      try {
        handle = window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        handle = null;
      }
      if (!handle) {
        setError("Could not open WhatsApp. Allow pop-ups for this site, or call us instead.");
        return;
      }
      setError("");
      setQuery("");
      closePanel();
    },
    [query, closePanel]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    handoff("General enquiry", "");
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        right: "clamp(14px, 4vw, 26px)",
        bottom: "clamp(14px, 4vw, 26px)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 14,
      }}
    >
      {open && (
        <div
          ref={panelRef}
          id="kz-chatbot-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kz-chatbot-title"
          tabIndex={-1}
          style={{
            width: "min(360px, calc(100vw - 28px))",
            maxHeight: "min(70vh, 560px)",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg2)",
            border: "1px solid var(--line)",
            borderRadius: 18,
            boxShadow: "var(--shadow)",
            outline: "none",
            overflow: "hidden",
            animation: "kzExp .28s cubic-bezier(.2,.7,.2,1) both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 10px 14px 18px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "var(--card2)",
                border: "1px solid var(--line)",
                display: "grid",
                placeItems: "center",
                flex: "none",
              }}
            >
              <KzIcon name="agent" size={19} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, flex: 1 }}>
              <span
                id="kz-chatbot-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}
              >
                Ask our team
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--mut)",
                }}
              >
                Real humans · WhatsApp
              </span>
            </span>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close the assistant"
              style={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                border: 0,
                borderRadius: 11,
                color: "var(--mut)",
                cursor: "pointer",
                flex: "none",
              }}
            >
              <KzCloseGlyph />
            </button>
          </div>

          <div style={{ padding: "16px 18px 18px", overflowY: "auto" }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--mut)",
                textAlign: "justify",
              }}
            >
              Ask our team — we reply within one business day. Pick a topic or type your question,
              and we&apos;ll open WhatsApp with your message ready to send.
            </p>

            <p className="kz-label" style={{ margin: "18px 0 9px" }}>
              Quick topics
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {INTENTS.map((intent) => (
                <button
                  key={intent.label}
                  type="button"
                  className="kz-pill"
                  onClick={() => handoff(intent.label, intent.prompt)}
                  style={{
                    minHeight: 44,
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {intent.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
              <label className="kz-label" htmlFor="kz-chatbot-input">
                Or type your question
              </label>
              <input
                id="kz-chatbot-input"
                name="question"
                type="text"
                className="kz-field"
                placeholder="What do you need built?"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="kz-btn kz-btn-primary"
                style={{ width: "100%", marginTop: 12 }}
              >
                Send on WhatsApp →
              </button>
            </form>

            {error && (
              <p role="alert" style={{ margin: "12px 0 0", fontSize: "0.82rem", color: "var(--err)" }}>
                {error}
              </p>
            )}

            <a
              href={`tel:+${phoneDigits}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                minHeight: 44,
                marginTop: 6,
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.1em",
                color: "var(--mut)",
              }}
            >
              <KzIcon name="phone" size={15} stroke="currentColor" />
              {site.phone}
            </a>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={open ? closePanel : openPanel}
        aria-label={open ? "Close the assistant" : "Ask the Kenzed team a question"}
        aria-expanded={open}
        aria-controls="kz-chatbot-panel"
        style={{
          position: "relative",
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: 0,
          background: "var(--ink)",
          color: "var(--bg)",
          boxShadow: "var(--shadow)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flex: "none",
        }}
      >
        {pulse && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "1.5px solid var(--acc)",
              animation: "kzPulse 2.2s infinite",
              pointerEvents: "none",
            }}
          />
        )}
        {open ? <KzCloseGlyph size={22} /> : <KzIcon name="agent" size={24} stroke="var(--bg)" />}
      </button>
    </div>
  );
}

function KzCloseGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
