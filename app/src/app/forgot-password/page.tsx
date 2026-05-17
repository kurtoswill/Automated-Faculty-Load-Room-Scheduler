"use client";

import { useState } from "react";
import Link from "next/link";

// ─── States: "idle" | "loading" | "sent" | "error"
type PageState = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [state, setState] = useState<PageState>("idle");
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address.");
            return;
        }
        setError("");
        setState("loading");

        // TODO: replace with API call — POST /api/auth/forgot-password { email }
        setTimeout(() => setState("sent"), 1500);
    }

    return (
        <div className="page-shell min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>

            {/* ── Decorative background blobs ── */}
            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                <div style={{
                    position: "absolute", top: "-80px", left: "-80px",
                    width: "420px", height: "420px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(34,160,80,0.08) 0%, transparent 70%)",
                }} />
                <div style={{
                    position: "absolute", bottom: "-60px", right: "-60px",
                    width: "340px", height: "340px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(240,165,0,0.07) 0%, transparent 70%)",
                }} />
            </div>

            <div className="w-full max-w-sm relative animate-fade-in">

                {/* ── Brand mark ── */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                        style={{ background: "var(--color-primary-muted)", boxShadow: "var(--shadow-green)" }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                        {state === "sent" ? "Check your email" : "Forgot your password?"}
                    </h1>
                    <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
                        {state === "sent"
                            ? `We sent a reset link to ${email}`
                            : "Enter your institutional email and we'll send you a reset link."}
                    </p>
                </div>

                {/* ── Card ── */}
                <div className="card card-body">

                    {state === "sent" ? (
                        /* ── Success state ── */
                        <div className="space-y-5">
                            <div
                                className="rounded-xl p-4 flex gap-3 items-start"
                                style={{ background: "var(--color-primary-muted)" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <div className="text-sm" style={{ color: "var(--color-primary-dark)" }}>
                                    <p className="font-semibold">Reset link sent</p>
                                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-primary)" }}>
                                        Check your inbox at <strong>{email}</strong>. The link expires in 30 minutes.
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 shrink-0" style={{ color: "var(--color-text-muted)" }}>•</span>
                                    Didn't receive it? Check your spam or junk folder.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 shrink-0" style={{ color: "var(--color-text-muted)" }}>•</span>
                                    Make sure you entered your institutional email address.
                                </li>
                            </ul>

                            <button
                                type="button"
                                className="btn btn-outline btn-full"
                                onClick={() => { setState("idle"); setEmail(""); }}
                            >
                                Try a different email
                            </button>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Institutional Email</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon-left">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="yourname@university.edu.ph"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        className="input-has-left-icon"
                                        disabled={state === "loading"}
                                        aria-describedby={error ? "email-error" : undefined}
                                        aria-invalid={!!error}
                                        style={error ? { borderColor: "var(--color-error)" } : {}}
                                    />
                                </div>
                                {error && (
                                    <p id="email-error" className="form-error flex items-center gap-1.5 mt-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={state === "loading"}
                                style={state === "loading" ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                            >
                                {state === "loading" ? (
                                    <>
                                        <Spinner /> Sending link…
                                    </>
                                ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* ── Back to login ── */}
                <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-muted)" }}>
                    Remembered it?{" "}
                    <Link href="/" className="font-medium" style={{ color: "var(--color-primary-light)" }}>
                        Back to login
                    </Link>
                </p>

            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg
            width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.7s linear infinite" }}
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}