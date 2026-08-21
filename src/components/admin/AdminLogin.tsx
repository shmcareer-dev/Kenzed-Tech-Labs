"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** Password gate shown when /admin/leads is opened without a valid session. */
export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setBusy(false);

    if (response.ok) {
      router.refresh();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[380px]">
      <label htmlFor="password" className="mb-1.5 block text-[0.85rem] font-medium text-muted">
        Admin password
      </label>
      <input
        id="password"
        type="password"
        className="field-input"
        value={password}
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
      />
      {error && <p className="mt-2 text-[0.82rem] text-[#ff8f8f]">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full justify-center">
        {busy ? "Checking…" : "Sign in"}
      </button>
      <p className="mt-3 text-[0.8rem] text-dim">
        Set in <code>ADMIN_TOKEN</code> in your <code>.env</code>.
      </p>
    </form>
  );
}
