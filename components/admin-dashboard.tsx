"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type AdminItem = {
  sku: string;
  service_slug: string;
  name: string;
  detail: string | null;
  price_cents: number;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  active: boolean;
};

type AdminIdentity = {
  display_name: string | null;
  email: string | null;
};

type ViewState = "checking" | "signed-out" | "loading" | "ready" | "denied";

const serviceNames: Record<string, string> = {
  skip: "Skip 2 U",
  h2o: "H2O 2 U",
};

async function readJson(response: Response) {
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    throw Object.assign(
      new Error(typeof body.error === "string" ? body.error : "The request could not be completed."),
      { status: response.status },
    );
  }

  return body;
}

export default function AdminDashboard() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [view, setView] = useState<ViewState>("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [savingSku, setSavingSku] = useState("");

  const loadInventory = useCallback(
    async (activeSession: Session) => {
      setView("loading");
      setMessage("");

      try {
        const response = await fetch("/api/admin/inventory", {
          headers: { Authorization: `Bearer ${activeSession.access_token}` },
          cache: "no-store",
        });
        const body = await readJson(response);
        const nextItems = (body.items ?? []) as AdminItem[];

        setAdmin(body.admin as AdminIdentity);
        setItems(nextItems);
        setDrafts(
          Object.fromEntries(nextItems.map((item) => [item.sku, String(item.stock_quantity)])),
        );
        setView("ready");
      } catch (error) {
        const status = (error as Error & { status?: number }).status;

        if (status === 401) {
          await supabase.auth.signOut();
          setSession(null);
          setView("signed-out");
        } else if (status === 403) {
          setView("denied");
        } else {
          setMessage(error instanceof Error ? error.message : "Inventory could not be loaded.");
          setView("ready");
        }
      }
    },
    [supabase],
  );

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      if (data.session) {
        void loadInventory(data.session);
      } else {
        setView("signed-out");
      }
    });

    return () => {
      mounted = false;
    };
  }, [loadInventory, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      setMessage("The email or password is incorrect.");
      setSigningIn(false);
      return;
    }

    setSession(data.session);
    setPassword("");
    await loadInventory(data.session);
    setSigningIn(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setAdmin(null);
    setItems([]);
    setMessage("");
    setView("signed-out");
  }

  async function saveStock(item: AdminItem) {
    if (!session) return;

    const quantity = Number(drafts[item.sku]);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 100_000) {
      setMessage("Stock must be a whole number between 0 and 100,000.");
      return;
    }

    setSavingSku(item.sku);
    setMessage("");

    try {
      await readJson(
        await fetch("/api/admin/inventory", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sku: item.sku, stock_quantity: quantity }),
        }),
      );
      await loadInventory(session);
      setMessage(`${item.name} stock updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Stock could not be updated.");
    } finally {
      setSavingSku("");
    }
  }

  const groups = useMemo(() => {
    const result = new Map<string, AdminItem[]>();
    for (const item of items) {
      result.set(item.service_slug, [...(result.get(item.service_slug) ?? []), item]);
    }
    return [...result.entries()];
  }, [items]);

  if (view === "checking" || view === "loading") {
    return <main className="admin-loading">Loading secure stock controls…</main>;
  }

  if (view === "signed-out") {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <p className="admin-wordmark">HIBISCUS GROUP</p>
          <p className="admin-eyebrow">SECURE STAFF ACCESS</p>
          <h1 id="admin-login-title">Stock administration</h1>
          <span className="admin-heading-line" aria-hidden="true" />
          <p>Sign in with an approved admin account to manage booking availability.</p>

          <form className="admin-login-form" onSubmit={signIn}>
            <label>
              Email address
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {message ? <p className="admin-alert error" role="alert">{message}</p> : null}
            <button className="button" type="submit" disabled={signingIn}>
              {signingIn ? "Signing in…" : "SIGN IN"}
            </button>
          </form>

          <Link className="admin-back-link" href="/">← Back to the website</Link>
        </section>
      </main>
    );
  }

  if (view === "denied") {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <p className="admin-wordmark">HIBISCUS GROUP</p>
          <h1>Access not approved</h1>
          <span className="admin-heading-line" aria-hidden="true" />
          <p>This Supabase account is valid, but it has not been granted admin privileges.</p>
          <button className="button" type="button" onClick={signOut}>SIGN OUT</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <p className="admin-wordmark">HIBISCUS GROUP</p>
        <div className="admin-account">
          <span>{admin?.display_name || admin?.email || "Administrator"}</span>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-title-row">
          <div>
            <p className="admin-eyebrow">BOOKING MANAGEMENT</p>
            <h1>Stock control</h1>
            <span className="admin-heading-line" aria-hidden="true" />
          </div>
          <button
            className="admin-refresh"
            type="button"
            onClick={() => session && void loadInventory(session)}
          >
            Refresh stock
          </button>
        </div>

        <p className="admin-intro">
          Set total stock for each booking option. Active unpaid reservations are shown separately,
          so the available figure matches what customers see.
        </p>

        {message ? <p className="admin-alert" role="status">{message}</p> : null}

        {groups.map(([serviceSlug, serviceItems]) => (
          <section className="admin-inventory-group" key={serviceSlug}>
            <div className="admin-group-heading">
              <h2>{serviceNames[serviceSlug] ?? serviceSlug}</h2>
              <span>{serviceItems.length} options</span>
            </div>

            <div className="admin-inventory-table">
              <div className="admin-table-header" aria-hidden="true">
                <span>Option</span>
                <span>Reserved</span>
                <span>Available</span>
                <span>Total stock</span>
                <span />
              </div>

              {serviceItems.map((item) => {
                const draft = drafts[item.sku] ?? String(item.stock_quantity);
                return (
                  <div className="admin-stock-row" key={item.sku}>
                    <div className="admin-item-name">
                      <strong>{item.name}</strong>
                      <span>{item.detail || item.sku}</span>
                    </div>
                    <div className="admin-stat">
                      <span className="admin-mobile-label">Reserved</span>
                      <strong>{item.reserved_quantity}</strong>
                    </div>
                    <div className="admin-stat">
                      <span className="admin-mobile-label">Available</span>
                      <strong>{item.available_quantity}</strong>
                    </div>
                    <div className="admin-stock-input">
                      <span className="admin-mobile-label">Total stock</span>
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} stock`}
                        onClick={() => setDrafts((current) => ({
                          ...current,
                          [item.sku]: String(Math.max(0, Number(draft || 0) - 1)),
                        }))}
                      >
                        −
                      </button>
                      <input
                        aria-label={`${item.name} total stock`}
                        type="number"
                        min="0"
                        max="100000"
                        step="1"
                        inputMode="numeric"
                        value={draft}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [item.sku]: event.target.value,
                        }))}
                      />
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} stock`}
                        onClick={() => setDrafts((current) => ({
                          ...current,
                          [item.sku]: String(Math.min(100_000, Number(draft || 0) + 1)),
                        }))}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="admin-save"
                      type="button"
                      disabled={savingSku === item.sku || draft === String(item.stock_quantity)}
                      onClick={() => void saveStock(item)}
                    >
                      {savingSku === item.sku ? "Saving…" : "Save"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
