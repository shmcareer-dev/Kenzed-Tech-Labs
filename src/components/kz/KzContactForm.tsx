"use client";

import { useState, type FormEvent } from "react";

import { serviceOptions } from "@/content/services";
import { site } from "@/content/site";
import { fieldErrors, leadSchema } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  service: serviceOptions[0],
  budget: "",
  message: "",
  website: "",
};

const phoneDigits = site.phone.replace(/\D/g, "");

const budgetOptions = [
  "Prefer not to say",
  "Under ₹2 L",
  "₹2–10 L",
  "₹10–50 L",
  "₹50 L+",
];

export function KzContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const update = (field: keyof typeof EMPTY_FORM) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    setErrors({});
    setServerMessage("");

    const data = parsed.data;
    const lines = [
      `*New enquiry from Kenzed Tech Lab website*`,
      ``,
      `*Name:* ${data.name}`,
      `*Email:* ${data.email}`,
      data.company ? `*Company:* ${data.company}` : "",
      `*Service:* ${data.service}`,
      data.budget ? `*Budget:* ${data.budget}` : "",
      `*Message:*`,
      data.message,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phoneDigits}?text=${text}`;

    try {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setServerMessage("Could not open WhatsApp. Please try again or email us directly.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        style={{
          borderRadius: 20,
          border: "1px solid var(--line2)",
          background: "linear-gradient(135deg, rgba(57,224,208,.12), rgba(77,163,255,.1))",
          padding: 32,
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>
          Thanks — we&apos;ve got your enquiry.
        </h3>
        <p style={{ margin: "12px auto 0", maxWidth: "42ch", fontSize: "0.95rem", color: "var(--mut)" }}>
          Our team will get back to you within one business day. If it&apos;s urgent, call us
          directly and we&apos;ll pick it up straight away.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="kz-btn kz-btn-ghost"
          style={{ marginTop: 24 }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "0 16px",
        }}
      >
        <Field label="Name" error={errors.name}>
          <input
            id="kzf-name"
            name="name"
            type="text"
            placeholder="Your name"
            className="kz-field"
            value={form.name}
            onChange={(e) => update("name")(e.target.value)}
          />
        </Field>
        <Field label="Work email" error={errors.email}>
          <input
            id="kzf-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            className="kz-field"
            value={form.email}
            onChange={(e) => update("email")(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Company" error={errors.company}>
        <input
          id="kzf-company"
          name="company"
          type="text"
          placeholder="Company name"
          className="kz-field"
          value={form.company}
          onChange={(e) => update("company")(e.target.value)}
        />
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "0 16px",
        }}
      >
        <Field label="Service of interest" error={errors.service}>
          <select
            id="kzf-service"
            name="service"
            className="kz-field"
            value={form.service}
            onChange={(e) => update("service")(e.target.value)}
          >
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget (optional)" error={errors.budget}>
          <select
            id="kzf-budget"
            name="budget"
            className="kz-field"
            value={form.budget}
            onChange={(e) => update("budget")(e.target.value)}
          >
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message" error={errors.message}>
        <textarea
          id="kzf-msg"
          name="message"
          placeholder="Tell us about your project…"
          className="kz-field"
          style={{ minHeight: 110, resize: "vertical" }}
          value={form.message}
          onChange={(e) => update("message")(e.target.value)}
        />
      </Field>

      <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 0, height: 0, overflow: "hidden" }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update("website")(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="kz-btn kz-btn-primary"
        style={{ width: "100%" }}
      >
        {status === "submitting" ? "Sending…" : "Send via WhatsApp →"}
      </button>

      {status === "error" && serverMessage && (
        <p role="alert" style={{ marginTop: 12, fontSize: "0.85rem", color: "#ff6b6b" }}>
          {serverMessage}
        </p>
      )}

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem",
          color: "var(--dim)",
          margin: "12px 0 0",
          lineHeight: 1.6,
        }}
      >
        We reply within one business day. Your details are stored securely and never shared.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="kz-label">{label}</label>
      {children}
      {error && (
        <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#ff6b6b" }}>{error}</p>
      )}
    </div>
  );
}
