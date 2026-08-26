"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { KzButton } from "@/components/kz/primitives";

export interface KzProductLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productSlug?: string;
  tierName?: string;
}

export function KzProductLeadModal({
  isOpen,
  onClose,
  productName = "Product Enquiry",
  tierName,
}: KzProductLeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  /* Resetting on the way OUT rather than on the way in. The reset used to sit
     at the top of the body-scroll effect below, which fired two setState calls
     synchronously from an effect body — a cascading render for a dialog that
     is about to render nothing anyway. Every path that closes this modal runs
     through here: the header button, the backdrop, Escape, and the button on
     the success panel. */
  const close = useCallback(() => {
    setSubmitted(false);
    setBusy(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const buildWhatsAppText = () => {
    const lines = [
      `*New Product Enquiry — Kenzed Tech Labs*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `*Product:* ${productName}${tierName ? ` (${tierName} Edition)` : ""}`,
      `*Name:* ${name || "Not provided"}`,
      `*Email:* ${email || "Not provided"}`,
      `*Phone/WhatsApp:* ${phone || "Not provided"}`,
      `*Organization:* ${org || "Not provided"}`,
    ];
    if (message) {
      lines.push(`*Requirements:* ${message}`);
    }
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Sent from kenzed.in/product-studio`);
    return lines.join("\n");
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const waText = encodeURIComponent(buildWhatsAppText());
    const rawDigits = site.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${rawDigits}?text=${waText}`;

    const newWindow = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = waUrl;
    }

    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 600);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    // Simulate sending lead
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kz-lead-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 32px)",
        background: "rgba(2, 6, 12, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "kzLeadFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <style>{`
        @keyframes kzLeadFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .kz-modal-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--bg);
          color: var(--ink);
          font-family: inherit;
          font-size: 16px !important;
          min-height: 46px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .kz-modal-field:focus {
          outline: none;
          border-color: var(--acc);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 18%, transparent);
        }
      `}</style>

      <div
        ref={dialogRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--card)",
          border: "1px solid var(--line2)",
          borderRadius: 20,
          padding: "clamp(24px, 5vw, 36px)",
          boxShadow: "0 32px 100px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px color-mix(in srgb, var(--acc) 14%, transparent)",
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close enquiry modal"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "var(--bg2)",
            color: "var(--mut)",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          ×
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--acc) 16%, transparent)",
                border: "2px solid var(--acc)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "1.8rem",
                color: "var(--acc)",
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--ink)",
                margin: "0 0 10px",
              }}
            >
              Enquiry Received!
            </h3>
            <p style={{ color: "var(--mut)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "42ch", margin: "0 auto 24px" }}>
              Thank you for enquiring about <strong>{productName}</strong>. Our engineering and delivery team will review your requirements and get back to you within 24 hours.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <KzButton onClick={close} variant="primary">
                Done
              </KzButton>
              <KzButton
                href={`https://wa.me/${site.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi Kenzed team, I just submitted an enquiry for ${productName}.`)}`}
                variant="ghost"
              >
                Chat on WhatsApp →
              </KzButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleWhatsAppSubmit}>
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Product Consultation &amp; Pilot Scope
              </span>
              <h2
                id="kz-lead-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "var(--ink)",
                  margin: "0 0 6px",
                  lineHeight: 1.2,
                }}
              >
                Enquire for {productName}
              </h2>
              {tierName && (
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: "var(--card2)",
                    border: "1px solid var(--line)",
                    color: "var(--acc)",
                    marginBottom: 8,
                  }}
                >
                  Selected Edition: {tierName}
                </span>
              )}
              <p style={{ color: "var(--mut)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                Fill in your details below. We will prepare a scoped architecture brief and connect with you on WhatsApp / Email.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--dim)",
                    marginBottom: 6,
                  }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="kz-modal-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--dim)",
                      marginBottom: 6,
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="kz-modal-field"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--dim)",
                      marginBottom: 6,
                    }}
                  >
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="kz-modal-field"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--dim)",
                    marginBottom: 6,
                  }}
                >
                  Institution / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subhas Bose Institute / Tech Corp"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="kz-modal-field"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--dim)",
                    marginBottom: 6,
                  }}
                >
                  Workload / Project Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your expected users, current software, or key timeline..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="kz-modal-field"
                  style={{ resize: "vertical", minHeight: 74 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
              <button
                type="submit"
                disabled={busy}
                className="kz-btn kz-btn-primary"
                style={{
                  width: "100%",
                  minHeight: 48,
                  justifyContent: "center",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  gap: 8,
                }}
              >
                {busy ? "Opening WhatsApp..." : "Instant WhatsApp Enquiry →"}
              </button>

              <button
                type="button"
                onClick={handleDirectSubmit}
                disabled={busy}
                className="kz-btn kz-btn-ghost"
                style={{
                  width: "100%",
                  minHeight: 44,
                  justifyContent: "center",
                  fontSize: "0.88rem",
                }}
              >
                Submit Form Directly
              </button>
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem",
                color: "var(--dim)",
                textAlign: "center",
              }}
            >
              <span>🔒 100% Private &amp; Confidential</span>
              <span>•</span>
              <span>⚡ Direct Engineer Response</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
