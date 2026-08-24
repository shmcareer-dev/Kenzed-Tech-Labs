"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { KzButtonLoading, KzSuccessCheck } from "@/components/kz/motion/KzFeedback";
import { KZ_HOVER_GROUP, KzArrowNudge } from "@/components/kz/motion/KzPointer";
import { site } from "@/content/site";
import { trainingPrograms } from "@/content/training";
import { fieldErrors } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

const programOptions = trainingPrograms.map((program) => program.title);

const statusOptions = ["Student", "Graduate", "Working professional"];

const ERROR_COLOR = "var(--err)";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  program: programOptions[0],
  currentStatus: statusOptions[0],
  organisation: "",
  message: "",
};

const phoneDigits = site.phone.replace(/\D/g, "");

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),

  email: z.email("Enter a valid email address").max(190),

  /* People type country codes, spaces and dashes however they like — the digit
     count is the only part that decides whether we can call them back. */
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/\D/g, "").length >= 10,
      "Enter a phone number with at least 10 digits"
    ),

  program: z
    .string()
    .refine((value) => programOptions.includes(value), "Choose a programme"),

  currentStatus: z
    .string()
    .refine((value) => statusOptions.includes(value), "Choose your current status"),

  organisation: z.string().trim().min(2, "Tell us your college or company").max(160),

  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(4000),
});

export function KzApplyForm() {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = applicationSchema.safeParse(form);
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
      `*Training application from Kenzed Tech Lab website*`,
      ``,
      `*Name:* ${data.name}`,
      `*Email:* ${data.email}`,
      `*Phone:* ${data.phone}`,
      `*Programme:* ${data.program}`,
      `*Current status:* ${data.currentStatus}`,
      `*College / company:* ${data.organisation}`,
      `*About the applicant:*`,
      data.message,
    ];

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phoneDigits}?text=${text}`;

    /* A blocked pop-up returns null rather than throwing, so the catch never
       saw it and the form reported success while the enquiry went nowhere. */
    let handed: Window | null = null;
    try {
      handed = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      handed = null;
    }

    if (!handed) {
      try {
        window.location.href = url;
        setStatus("success");
        setForm(EMPTY_FORM);
        return;
      } catch {
        setStatus("error");
        setServerMessage("Could not open WhatsApp. Please try again or email us directly.");
        return;
      }
    }

    setStatus("success");
    setForm(EMPTY_FORM);
  }

  if (status === "success") {
    return (
      <div
        role="status"
        style={{
          borderRadius: 20,
          border: "1px solid var(--acc)",
          background: "var(--card2)",
          padding: "clamp(24px, 4vw, 32px)",
          textAlign: "center",
        }}
      >
        <KzSuccessCheck size={64} label="Application sent" />
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "8px 0 0", color: "var(--ink)" }}>
          Application on its way.
        </h3>
        <p
          style={{
            margin: "12px auto 0",
            maxWidth: "44ch",
            fontSize: "0.94rem",
            color: "var(--mut)",
          }}
        >
          Send the WhatsApp message we opened for you and our training team will reply within one
          business day with the next cohort date and a short screening call slot.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="kz-btn kz-btn-ghost"
          style={{ marginTop: 24 }}
        >
          Apply for another programme
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
        <Field id="kza-name" label="Full name" error={errors.name}>
          <input
            id="kza-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className="kz-field"
            value={form.name}
            onChange={(e) => update("name")(e.target.value)}
          />
        </Field>
        <Field id="kza-email" label="Email" error={errors.email}>
          <input
            id="kza-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="kz-field"
            value={form.email}
            onChange={(e) => update("email")(e.target.value)}
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "0 16px",
        }}
      >
        <Field id="kza-phone" label="Phone" error={errors.phone}>
          <input
            id="kza-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98000 00000"
            className="kz-field"
            value={form.phone}
            onChange={(e) => update("phone")(e.target.value)}
          />
        </Field>
        <Field id="kza-status" label="Current status" error={errors.currentStatus}>
          <select
            id="kza-status"
            name="currentStatus"
            className="kz-field"
            value={form.currentStatus}
            onChange={(e) => update("currentStatus")(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="kza-program" label="Programme" error={errors.program}>
        <select
          id="kza-program"
          name="program"
          className="kz-field"
          value={form.program}
          onChange={(e) => update("program")(e.target.value)}
        >
          {programOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field id="kza-org" label="College or company" error={errors.organisation}>
        <input
          id="kza-org"
          name="organisation"
          type="text"
          autoComplete="organization"
          placeholder="Where you study or work"
          className="kz-field"
          value={form.organisation}
          onChange={(e) => update("organisation")(e.target.value)}
        />
      </Field>

      <Field id="kza-msg" label="Why this programme" error={errors.message}>
        <textarea
          id="kza-msg"
          name="message"
          placeholder="What you have built so far, and what you want to work on…"
          className="kz-field"
          style={{ minHeight: 110, resize: "vertical" }}
          value={form.message}
          onChange={(e) => update("message")(e.target.value)}
        />
      </Field>

      <KzButtonLoading
        type="submit"
        loading={status === "submitting"}
        loadingLabel="Opening WhatsApp…"
        className={KZ_HOVER_GROUP}
        style={{ width: "100%" }}
      >
        Apply via WhatsApp <KzArrowNudge>→</KzArrowNudge>
      </KzButtonLoading>

      {status === "error" && serverMessage && (
        <p role="alert" style={{ marginTop: 12, fontSize: "0.85rem", color: ERROR_COLOR }}>
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
        Seats are confirmed after a short screening call. Your details are stored securely and never
        shared.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="kz-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" style={{ marginTop: 6, fontSize: "0.8rem", color: ERROR_COLOR }}>
          {error}
        </p>
      )}
    </div>
  );
}
