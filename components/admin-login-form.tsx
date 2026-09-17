"use client";

import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("team@weblaunch.co.nz");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin`;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="admin-auth-card admin-auth-card--success">
        <Mail size={42} />
        <p className="eyebrow">Secure link sent</p>
        <h1>Check your inbox.</h1>
        <p>Use the one-time link sent to <strong>{email}</strong>. Only addresses on the database admin allowlist can open the stock dashboard.</p>
        <button className="text-button" type="button" onClick={() => setSent(false)}>Use another email</button>
      </div>
    );
  }

  return (
    <form className="admin-auth-card" onSubmit={submit}>
      <div className="admin-auth-icon"><KeyRound /></div>
      <p className="eyebrow">Restricted access</p>
      <h1>Admin stock control.</h1>
      <p>Sign in with a one-time email link. Supabase Auth verifies the identity; database row-level security verifies the admin role.</p>
      <label>Email address
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button--pink" type="submit" disabled={loading}>
        {loading ? "Sending secure link…" : "Send secure link"} <ArrowRight size={18} />
      </button>
      <div className="admin-auth-note"><ShieldCheck size={18} /> No password is stored by this site.</div>
    </form>
  );
}

