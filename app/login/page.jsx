"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Design tokens — mirror your globals.css variables ─── */
const STAGES = [
  { name: "Appointments", color: "var(--stage-appointment)", count: 8 },
  { name: "Contracts", color: "var(--stage-contract)", count: 5 },
  { name: "In production", color: "var(--stage-production)", count: 12 },
  { name: "Ready to deliver", color: "var(--stage-ready)", count: 4 },
  { name: "Completed", color: "var(--stage-completed)", count: 18 },
];

/* ─── Icons ─── */
const Icon = {
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Key: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Home: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9 12 3l9 6v12H3z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
};

/* ─── Logo with fallback ─── */
function BrandLogo() {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="lp-brand-mark" aria-hidden="true">
        <Icon.Home />
      </div>
    );
  }
  return (
    <div className="lp-brand-mark lp-brand-mark-img" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="DZ Wood Kitchen"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="lp-toast"
      style={{ borderLeftColor: type === "error" ? "var(--stage-contract)" : "var(--stage-completed)" }}
      role="status"
    >
      <span
        className="lp-toast-icon"
        style={{ color: type === "error" ? "var(--stage-contract)" : "var(--stage-completed)" }}
      >
        {type === "error" ? <Icon.Alert /> : <Icon.Check />}
      </span>
      <span>{message}</span>
    </div>
  );
}

/* ─── Activity card ─── */
function ActivityCard() {
  const maxCount = Math.max(...STAGES.map((s) => s.count));
  return (
    <div className="lp-activity">
      <div className="lp-activity-head">
        <span>Today across the workshop</span>
        <span className="lp-live">
          <span className="lp-live-dot" />
          Live
        </span>
      </div>
      <div className="lp-stages">
        {STAGES.map((s, i) => {
          const pct = (s.count / maxCount) * 100;
          return (
            <div className="lp-stage-row" key={s.name}>
              <span className="lp-stage-dot" style={{ background: s.color }} />
              <span className="lp-stage-name">{s.name}</span>
              <span className="lp-stage-bar">
                <span
                  className="lp-stage-fill"
                  style={{
                    background: s.color,
                    width: `${pct}%`,
                    animationDelay: `${0.5 + i * 0.08}s`,
                  }}
                />
              </span>
              <span className="lp-stage-count">{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Forgot password modal ─── */
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // API returns the same success message whether the account exists
      // or not — that's intentional (prevents user enumeration).
      if (!res.ok && res.status !== 200) {
        throw new Error("Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset link.");
    } finally {
      setSending(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lp-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="lp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-title"
      >
        <button
          className="lp-modal-close"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <Icon.X />
        </button>

        <div className="lp-modal-icon">
          <Icon.Key />
        </div>

        {sent ? (
          <>
            <h3 id="forgot-title" className="lp-modal-title">Check your inbox</h3>
            <p className="lp-modal-sub">
              If an account exists for <strong>{email}</strong>, we've sent a
              password reset link. It expires in 1 hour.
            </p>
            <button
              className="lp-btn-primary"
              onClick={onClose}
              type="button"
              style={{ marginTop: 8 }}
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <h3 id="forgot-title" className="lp-modal-title">Forgot your password?</h3>
            <p className="lp-modal-sub">
              No worries — enter the email tied to your account and we'll
              send you a reset link.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-field" style={{ marginBottom: 12 }}>
                <label className="lp-label" htmlFor="forgot-email">Email</label>
                <div className="lp-input-wrap">
                  <input
                    className="lp-input"
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="you@dzwood.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <span className="lp-input-icon">
                    <Icon.Mail />
                  </span>
                </div>
                {error && <div className="lp-modal-err">{error}</div>}
              </div>

              <div className="lp-modal-actions">
                <button
                  type="button"
                  className="lp-btn-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lp-btn-primary"
                  disabled={sending}
                  style={{ width: "auto", padding: "0 22px", animation: "none" }}
                >
                  {sending ? "Sending…" : "Send reset link"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const shakeRef = useRef(null);

  function showToast(message, type = "success") {
    setToast({ message, type, key: Date.now() });
  }

  function triggerShake() {
    if (!shakeRef.current) return;
    shakeRef.current.classList.remove("lp-shake");
    void shakeRef.current.offsetWidth;
    shakeRef.current.classList.add("lp-shake");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // ── Client-side validation first (don't even hit the API for garbage) ──
    if (!email.trim() || !password) {
      showToast("Please fill in both email and password.", "error");
      triggerShake();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include" so the httpOnly `token` cookie sticks
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 401/400 → bad creds. Anything else → server error.
        const msg =
          res.status === 401 || res.status === 400
            ? "Invalid email or password."
            : data?.error || "Sign in failed. Please try again.";
        showToast(msg, "error");
        triggerShake();
        return;
      }

      // ── Success ──
      // Server returns { loginData: { token, user: { id, name, email, role } } }
      // Note: `role` is a BOOLEAN (true = admin), not a string.
      const { user, token } = data.loginData || {};
      if (!token || !user) {
        showToast("Unexpected response from server.", "error");
        return;
      }

      // Stash a tiny non-sensitive user blob for the client UI.
      // The real auth happens via the httpOnly cookie set by the server.
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            // store the boolean — components should check `role === true` for admin
            isAdmin: user.role === true,
          })
        );
      } catch {
          /* localStorage may be blocked — non-fatal, the cookie is what matters */
      }

      showToast("Signed in — welcome back!");

      // Small delay so the user actually sees the success toast
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 400);
    } catch (err) {
      // Network error / server down
      showToast(
        err?.message
          ? `Network error: ${err.message}`
          : "Could not reach the server. Check your connection.",
        "error"
      );
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .lp-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          color: var(--ink);
          font-family: inherit;
        }
        @media (max-width: 920px) {
          .lp-root { grid-template-columns: 1fr; }
          .lp-visual { display: none; }
        }

        /* utility bar */
        .lp-utility {
          position: fixed; top: 0; left: 0; right: 0; z-index: 10;
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 28px;
          font-size: 12px; color: var(--ink-muted);
          background: linear-gradient(to bottom, rgba(10,13,20,0.9), transparent);
        }
        .lp-utility a, .lp-utility button {
          color: var(--ink-muted); text-decoration: none;
          background: none; border: none; font-family: inherit; font-size: inherit;
          cursor: pointer; padding: 0;
          transition: color .2s ease;
        }
        .lp-utility a:hover, .lp-utility button:hover { color: var(--ink); }
        .lp-status-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: var(--surface); border: 1px solid var(--border);
          font-size: 11.5px; font-weight: 500;
        }
        .lp-status-dot {
          position: relative; width: 7px; height: 7px; border-radius: 50%;
          background: var(--stage-completed);
        }
        .lp-status-dot::before {
          content: ""; position: absolute; inset: -3px; border-radius: 50%;
          background: var(--stage-completed); opacity: .35;
          animation: lp-ring 1.8s ease-out infinite;
        }
        @keyframes lp-ring {
          0% { transform: scale(.8); opacity: .6; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        /* visual panel */
        .lp-visual {
          position: relative; background: var(--surface);
          border-right: 1px solid var(--border);
          overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px;
        }
        .lp-visual::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(59,130,246,.18), transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(34,197,94,.12), transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(245,158,11,.08), transparent 50%);
          pointer-events: none;
        }
        .lp-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .lp-visual-content {
          position: relative; z-index: 1; height: 100%;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .lp-brand {
          display: flex; align-items: center; gap: 22px;
          animation: lp-fadeUp .6s ease-out;
        }
        .lp-brand-mark {
          width: 140px; height: 140px; border-radius: 28px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 14px 50px rgba(59,130,246,.55);
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }
        .lp-brand-mark::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,.12), transparent 50%);
          pointer-events: none;
        }
        .lp-brand-mark-img {
          background: #fff;
          padding: 14px;
        }
        .lp-brand-mark img {
          width: 100%; height: 100%; object-fit: contain; display: block;
        }
        .lp-brand-text { display: flex; flex-direction: column; }
        .lp-brand-name {
          font-size: 28px; font-weight: 800; letter-spacing: -.02em;
          line-height: 1.1;
        }
        .lp-brand-tag {
          font-size: 13px; color: var(--ink-muted);
          margin-top: 6px; letter-spacing: .02em;
        }

        .lp-hero h1 {
          font-size: clamp(28px, 3vw, 38px); font-weight: 800;
          line-height: 1.15; letter-spacing: -.02em; margin-bottom: 16px;
          animation: lp-fadeUp .7s ease-out .1s both;
        }
        .lp-hero h1 .lp-accent {
          background: linear-gradient(135deg, var(--accent), #22c55e);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lp-hero p {
          font-size: 14.5px; line-height: 1.6; color: var(--ink-muted);
          max-width: 420px; animation: lp-fadeUp .7s ease-out .2s both;
        }

        .lp-activity {
          position: relative; z-index: 1;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px;
          backdrop-filter: blur(10px);
          animation: lp-fadeUp .7s ease-out .3s both;
        }
        .lp-activity-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .06em; color: var(--ink-muted);
        }
        .lp-live {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--stage-completed);
        }
        .lp-live-dot {
          position: relative; width: 6px; height: 6px; border-radius: 50%;
          background: var(--stage-completed);
        }
        .lp-stages { display: flex; flex-direction: column; gap: 10px; }
        .lp-stage-row {
          display: flex; align-items: center; gap: 10px; font-size: 12.5px;
        }
        .lp-stage-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .lp-stage-name { color: var(--ink); font-weight: 500; min-width: 130px; }
        .lp-stage-bar {
          flex: 1; height: 4px; background: var(--surface-3);
          border-radius: 999px; overflow: hidden;
        }
        .lp-stage-fill {
          display: block; height: 100%; width: 0; border-radius: 999px;
          animation: lp-bar 1.4s cubic-bezier(.2,.7,.2,1) forwards;
        }
        @keyframes lp-bar { from { width: 0; } }
        .lp-stage-count {
          font-size: 11.5px; color: var(--ink-muted);
          font-variant-numeric: tabular-nums; min-width: 30px; text-align: right;
        }
        .lp-footer-mark {
          position: relative; z-index: 1;
          font-size: 11.5px; color: var(--ink-dim, #6b7280);
          animation: lp-fadeUp .7s ease-out .4s both;
        }

        /* form panel */
        .lp-form-panel {
          display: flex; align-items: center; justify-content: center;
          padding: 32px 24px; background: var(--bg);
          position: relative; overflow: hidden;
        }
        .lp-form-panel::before {
          content: ""; position: absolute;
          top: -20%; right: -10%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,.08), transparent 70%);
          pointer-events: none; animation: lp-float 12s ease-in-out infinite;
        }
        @keyframes lp-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 30px); }
        }
        .lp-form-card {
          width: 100%; max-width: 380px;
          position: relative; z-index: 1;
          animation: lp-fadeUp .6s ease-out;
        }
        .lp-eyebrow {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .08em; color: var(--accent); margin-bottom: 10px;
        }
        .lp-title {
          font-size: 26px; font-weight: 700; letter-spacing: -.02em;
          margin-bottom: 8px; color: var(--ink);
        }
        .lp-sub {
          font-size: 14px; color: var(--ink-muted);
          margin-bottom: 32px; line-height: 1.5;
        }

        .lp-field { margin-bottom: 16px; animation: lp-fadeUp .5s ease-out both; }
        .lp-field:nth-of-type(1) { animation-delay: .1s; }
        .lp-field:nth-of-type(2) { animation-delay: .18s; }
        .lp-label {
          display: block; font-size: 12px; font-weight: 600;
          margin-bottom: 8px; color: var(--ink); letter-spacing: .01em;
        }
        .lp-input-wrap { position: relative; }
        .lp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--ink-dim, #6b7280); pointer-events: none;
          transition: color .2s ease; display: flex;
        }
        .lp-input {
          width: 100%; height: 46px;
          padding: 0 14px 0 44px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; color: var(--ink);
          font-family: inherit; font-size: 14px;
          transition: all .2s ease; outline: none;
        }
        .lp-input::placeholder { color: var(--ink-dim, #6b7280); }
        .lp-input:hover { border-color: var(--border-2, #353b4d); }
        .lp-input:focus {
          border-color: var(--accent);
          background: var(--surface-2);
          box-shadow: 0 0 0 4px var(--accent-soft);
        }
        .lp-input:disabled { opacity: .6; cursor: not-allowed; }
        .lp-input-wrap:focus-within .lp-input-icon { color: var(--accent); }
        .lp-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none;
          color: var(--ink-dim, #6b7280);
          cursor: pointer; padding: 4px; border-radius: 6px;
          display: flex; transition: all .2s ease;
        }
        .lp-pw-toggle:hover { color: var(--ink); background: var(--surface-2); }
        .lp-pw-toggle:disabled { cursor: not-allowed; }

        .lp-row-between {
          display: flex; align-items: center; justify-content: space-between;
          margin: 6px 0 22px; font-size: 13px;
          animation: lp-fadeUp .5s ease-out .26s both;
        }
        .lp-check {
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--ink-muted); cursor: pointer; user-select: none;
        }
        .lp-check input {
          appearance: none; width: 16px; height: 16px;
          border: 1.5px solid var(--border-2, #353b4d);
          border-radius: 4px; background: var(--surface);
          cursor: pointer; position: relative;
          transition: all .15s ease; flex-shrink: 0;
        }
        .lp-check input:hover { border-color: var(--accent); }
        .lp-check input:checked {
          background: var(--accent); border-color: var(--accent);
        }
        .lp-check input:checked::after {
          content: ""; position: absolute; left: 4px; top: 1px;
          width: 4px; height: 8px;
          border: solid white; border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .lp-forgot {
          color: var(--accent); text-decoration: none;
          font-weight: 500; font-size: 13px;
          background: none; border: none; padding: 0; cursor: pointer;
          font-family: inherit;
          transition: opacity .15s ease;
        }
        .lp-forgot:hover { opacity: .8; text-decoration: underline; }

        .lp-btn-primary {
          width: 100%; height: 46px;
          background: var(--accent); color: #fff;
          border: none; border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all .2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(59,130,246,.3);
          animation: lp-fadeUp .5s ease-out .32s both;
        }
        .lp-btn-primary:hover:not(:disabled) {
          background: #2563eb; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59,130,246,.45);
        }
        .lp-btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(59,130,246,.3);
        }
        .lp-btn-primary:disabled {
          opacity: .7; cursor: not-allowed; transform: none;
        }
        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: lp-spin .7s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        .lp-signup {
          margin-top: 28px; text-align: center;
          font-size: 13.5px; color: var(--ink-muted);
          animation: lp-fadeUp .5s ease-out .42s both;
        }
        .lp-signup a {
          color: var(--accent); text-decoration: none;
          font-weight: 600; margin-left: 4px;
          transition: opacity .15s ease;
        }
        .lp-signup a:hover { opacity: .8; }

        /* modal */
        .lp-modal-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,.6);
          backdrop-filter: blur(4px);
          animation: lp-fadeIn .15s ease-out;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        @keyframes lp-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lp-modal {
          position: relative;
          width: 100%; max-width: 420px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px;
          padding: 32px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,.5);
          animation: lp-modalIn .2s ease-out;
        }
        @keyframes lp-modalIn {
          from { opacity: 0; transform: translateY(8px) scale(.97); }
          to { opacity: 1; transform: none; }
        }
        .lp-modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink); cursor: pointer;
          transition: all .15s ease;
        }
        .lp-modal-close:hover {
          background: var(--surface-3, #232838);
          border-color: var(--border-2, #353b4d);
        }
        .lp-modal-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--accent-soft);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .lp-modal-title {
          font-size: 20px; font-weight: 700;
          letter-spacing: -.015em;
          margin-bottom: 8px; color: var(--ink);
        }
        .lp-modal-sub {
          font-size: 13.5px; line-height: 1.55;
          color: var(--ink-muted);
          margin-bottom: 20px;
        }
        .lp-modal-err {
          font-size: 11.5px; color: var(--stage-contract);
          margin-top: 6px;
        }
        .lp-modal-actions {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 16px;
        }
        .lp-btn-ghost {
          background: transparent;
          color: var(--ink-muted);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 18px; height: 42px;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          cursor: pointer;
          transition: all .15s ease;
        }
        .lp-btn-ghost:hover {
          background: var(--surface-2);
          color: var(--ink);
        }

        /* toast */
        .lp-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 100;
          background: var(--surface-2); border: 1px solid var(--border);
          border-left: 3px solid var(--stage-completed);
          border-radius: 10px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px;
          box-shadow: 0 12px 30px rgba(0,0,0,.4);
          backdrop-filter: blur(10px);
          animation: lp-toastIn .3s ease-out;
          max-width: 360px;
        }
        @keyframes lp-toastIn {
          from { opacity: 0; transform: translateX(20px); }
        }
        .lp-toast-icon { flex-shrink: 0; display: flex; }

        /* shake on invalid */
        .lp-shake { animation: lp-shake .35s cubic-bezier(.36,.07,.19,.97); }
        @keyframes lp-shake {
          10%,90% { transform: translateX(-1px); }
          20%,80% { transform: translateX(2px); }
          30%,50%,70% { transform: translateX(-4px); }
          40%,60% { transform: translateX(4px); }
        }

        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* top utility bar */}
      <div className="lp-utility">
        <a href="#">Need help?</a>
        <span className="lp-status-pill">
          <span className="lp-status-dot" />
          All systems operational
        </span>
      </div>

      <div className="lp-root">
        {/* LEFT: visual panel */}
        <section className="lp-visual">
          <div className="lp-grid-overlay" />
          <div className="lp-visual-content">
            <div className="lp-brand">
              <BrandLogo />
              <div className="lp-brand-text">
                <div className="lp-brand-name">DZ Wood Kitchen</div>
                <div className="lp-brand-tag">Operations Suite</div>
              </div>
            </div>

            <div className="lp-hero">
              <h1>
                Run your workshop
                <br />
                with <span className="lp-accent">clarity</span>.
              </h1>
              <p>
                Track every order from appointment to delivery, manage
                materials and workers, and keep your books in line — all in
                one place.
              </p>
            </div>

            <ActivityCard />

            <div className="lp-footer-mark">© 2026 DZ Wood Kitchen · v2.4.1</div>
          </div>
        </section>

        {/* RIGHT: form panel */}
        <section className="lp-form-panel">
          <form className="lp-form-card" onSubmit={handleSubmit} noValidate ref={shakeRef}>
            <div className="lp-eyebrow">Welcome back</div>
            <h2 className="lp-title">Sign in to your account</h2>
            <p className="lp-sub">
              Enter your credentials to access the dashboard.
            </p>

            <div className="lp-field">
              <label className="lp-label" htmlFor="email">Email</label>
              <div className="lp-input-wrap">
                <input
                  className="lp-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@dzwood.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="lp-input-icon">
                  <Icon.Mail />
                </span>
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label" htmlFor="password">Password</label>
              <div className="lp-input-wrap">
                <input
                  className="lp-input"
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="lp-input-icon">
                  <Icon.Lock />
                </span>
                <button
                  type="button"
                  className="lp-pw-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPw ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>
            </div>

            <div className="lp-row-between">
              <label className="lp-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="lp-forgot"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>

            <button
              className="lp-btn-primary"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Signing in…" : "Sign in"}</span>
              {loading ? <span className="lp-spinner" /> : <Icon.ArrowRight />}
            </button>

            <div className="lp-signup">
              Don't have an account?<a href="#">Contact your admin</a>
            </div>
          </form>
        </section>
      </div>

      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
