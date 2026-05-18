"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Token states: "valid" | "invalid" | "expired"
// In production: validated server-side via generateMetadata or useEffect on mount
// by calling GET /api/auth/validate-token/[token]
type TokenStatus = "valid" | "invalid" | "expired";
type FormState = "idle" | "loading" | "success" | "error";

// Simulate a valid token for placeholder — swap with real validation
const MOCK_TOKEN_STATUS: TokenStatus = "valid";

export default function ResetPasswordPage() {
    const tokenStatus: TokenStatus = MOCK_TOKEN_STATUS;

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formState, setFormState] = useState<FormState>("idle");
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

    const strength = getStrength(password);

    function validate() {
        const errs: typeof errors = {};
        if (!password) errs.password = "Password is required.";
        else if (password.length < 8) errs.password = "Must be at least 8 characters.";
        else if (strength.score < 2) errs.password = "Password is too weak. Add numbers or symbols.";
        if (!confirm) errs.confirm = "Please confirm your password.";
        else if (confirm !== password) errs.confirm = "Passwords do not match.";
        return errs;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setFormState("loading");

        // TODO: POST /api/auth/reset-password { token: params.token, password }
        setTimeout(() => setFormState("success"), 1500);
    }

    // ── Invalid / expired token guard
    if (tokenStatus !== "valid") {
        return (
            <TokenErrorScreen
                expired={tokenStatus === "expired"}
            />
        );
    }

    return (
        <div className="page-shell min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>

            {/* ── Decorative blobs ── */}
            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                <div style={{
                    position: "absolute", top: "-80px", right: "-80px",
                    width: "400px", height: "400px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(34,160,80,0.07) 0%, transparent 70%)",
                }} />
                <div style={{
                    position: "absolute", bottom: "-80px", left: "-80px",
                    width: "360px", height: "360px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(26,115,232,0.06) 0%, transparent 70%)",
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
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                        {formState === "success" ? "Password updated" : "Set a new password"}
                    </h1>
                    <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
                        {formState === "success"
                            ? "Your password has been reset successfully."
                            : "Choose a strong password for your account."}
                    </p>
                </div>

                <div className="card card-body">

                    {formState === "success" ? (
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
                                    <p className="font-semibold">Password changed</p>
                                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-primary)" }}>
                                        You can now log in with your new password. This reset link has been invalidated.
                                    </p>
                                </div>
                            </div>

                            <Link href="/" className="btn btn-primary btn-full">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                                </svg>
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">

                            {/* New password */}
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">New Password</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon-left">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                                        className="input-has-left-icon input-has-right-icon"
                                        disabled={formState === "loading"}
                                        aria-invalid={!!errors.password}
                                        style={errors.password ? { borderColor: "var(--color-error)" } : {}}
                                    />
                                    <button
                                        type="button"
                                        className="input-icon-right"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="form-error flex items-center gap-1.5 mt-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {errors.password}
                                    </p>
                                )}

                                {/* Strength meter */}
                                {password.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        <div className="flex gap-1">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 h-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: i < strength.score
                                                            ? strength.score <= 1 ? "var(--color-error)"
                                                                : strength.score === 2 ? "var(--color-warning)"
                                                                    : "var(--color-success)"
                                                            : "var(--color-border)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs" style={{
                                            color: strength.score <= 1 ? "var(--color-error)"
                                                : strength.score === 2 ? "var(--color-warning)"
                                                    : "var(--color-success)",
                                        }}>
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="form-group">
                                <label htmlFor="confirm" className="form-label">Confirm Password</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon-left">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    <input
                                        id="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Re-enter your password"
                                        value={confirm}
                                        onChange={(e) => { setConfirm(e.target.value); setErrors((prev) => ({ ...prev, confirm: undefined })); }}
                                        className="input-has-left-icon input-has-right-icon"
                                        disabled={formState === "loading"}
                                        aria-invalid={!!errors.confirm}
                                        style={
                                            errors.confirm
                                                ? { borderColor: "var(--color-error)" }
                                                : confirm && confirm === password
                                                    ? { borderColor: "var(--color-success)" }
                                                    : {}
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="input-icon-right"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.confirm ? (
                                    <p className="form-error flex items-center gap-1.5 mt-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {errors.confirm}
                                    </p>
                                ) : confirm && confirm === password && (
                                    <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "var(--color-success)" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Requirements */}
                            <ul className="space-y-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                <Req met={password.length >= 8} label="At least 8 characters" />
                                <Req met={/[0-9]/.test(password)} label="Contains a number" />
                                <Req met={/[^a-zA-Z0-9]/.test(password)} label="Contains a special character" />
                            </ul>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={formState === "loading"}
                                style={formState === "loading" ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                            >
                                {formState === "loading" ? (
                                    <><Spinner /> Updating password…</>
                                ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-muted)" }}>
                    <Link href="/" style={{ color: "var(--color-primary-light)" }} className="font-medium">
                        ← Back to login
                    </Link>
                </p>

            </div>
        </div>
    );
}

// ─── Token Error Screen ───────────────────────────────────────
function TokenErrorScreen({ expired }: { expired: boolean }) {
    return (
        <div className="page-shell min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
            <div className="w-full max-w-sm animate-fade-in text-center">
                <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
                    style={{ background: "var(--color-error-light)" }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-error)" }}>
                        {expired
                            ? <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                            : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                        }
                    </svg>
                </div>

                <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                    {expired ? "Link has expired" : "Invalid reset link"}
                </h1>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                    {expired
                        ? "This password reset link expired after 30 minutes. Please request a new one."
                        : "This reset link is invalid or has already been used. Please request a new one."}
                </p>

                <div className="card card-body space-y-3">
                    <Link href="/forgot-password" className="btn btn-primary btn-full">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Request a new link
                    </Link>
                    <Link href="/" className="btn btn-ghost btn-full" style={{ color: "var(--color-text-secondary)" }}>
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Requirement item ─────────────────────────────────────────
function Req({ met, label }: { met: boolean; label: string }) {
    return (
        <li className="flex items-center gap-1.5">
            <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ color: met ? "var(--color-success)" : "var(--color-border)", transition: "color 200ms" }}
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ color: met ? "var(--color-text-secondary)" : "var(--color-text-muted)", transition: "color 200ms" }}>
                {label}
            </span>
        </li>
    );
}

// ─── Password strength ────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string } {
    if (!pw) return { score: 0, label: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score] ?? "Strong" };
}

// ─── Spinner ──────────────────────────────────────────────────
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