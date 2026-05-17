"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PasswordFormState {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

interface FieldError {
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a 0–4 strength score for the given password. */
function getPasswordStrength(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

const STRENGTH_META: Record<
    number,
    { label: string; color: string; bar: string }
> = {
    0: { label: "", color: "text-slate-400", bar: "bg-slate-200" },
    1: { label: "Weak", color: "text-red-500", bar: "bg-red-400" },
    2: { label: "Fair", color: "text-orange-500", bar: "bg-orange-400" },
    3: { label: "Good", color: "text-amber-500", bar: "bg-amber-400" },
    4: { label: "Strong", color: "text-emerald-600", bar: "bg-emerald-400" },
};

/** Client-side validation before API call */
function validate(form: PasswordFormState): FieldError {
    const errors: FieldError = {};

    if (!form.current_password) {
        errors.current_password = "Current password is required.";
    }
    if (!form.new_password) {
        errors.new_password = "New password is required.";
    } else if (form.new_password.length < 8) {
        errors.new_password = "Password must be at least 8 characters.";
    } else if (form.new_password === form.current_password) {
        errors.new_password =
            "New password must be different from your current password.";
    }
    if (!form.confirm_password) {
        errors.confirm_password = "Please confirm your new password.";
    } else if (form.new_password !== form.confirm_password) {
        errors.confirm_password = "Passwords do not match.";
    }

    return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({
    label,
    id,
    value,
    onChange,
    error,
    hint,
    autoComplete,
}: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    hint?: string;
    autoComplete?: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-xs font-semibold uppercase tracking-widest text-slate-400"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
            w-full rounded-lg border px-4 py-2.5 pr-11 text-sm font-medium text-slate-800
            outline-none transition-all duration-150
            ${error
                            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-slate-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        }
          `}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? (
                        // Eye-off
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-7s4.477-7 10-7a10.05 10.05 0 014.875 1.175M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        </svg>
                    ) : (
                        // Eye
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9 3a1 1 0 102 0 1 1 0 00-2 0zm1-7a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}

function StrengthMeter({ password }: { password: string }) {
    const score = getPasswordStrength(password);
    const meta = STRENGTH_META[score];

    if (!password) return null;

    return (
        <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? meta.bar : "bg-slate-200"
                            }`}
                    />
                ))}
            </div>
            {score > 0 && (
                <p className={`text-xs font-medium ${meta.color}`}>
                    {meta.label}
                </p>
            )}
        </div>
    );
}

// ─── Requirements checklist ───────────────────────────────────────────────────

function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <li className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-emerald-600" : "text-slate-400"}`}>
            <svg
                className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${met ? "text-emerald-500" : "text-slate-300"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
                {met ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                )}
            </svg>
            {label}
        </li>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangePasswordPage() {
    const [form, setForm] = useState<PasswordFormState>({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState<FieldError>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
        "idle"
    );
    const [apiError, setApiError] = useState<string | null>(null);

    function update(field: keyof PasswordFormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear individual field error on change
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    async function handleSubmit() {
        const fieldErrors = validate(form);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setApiError(null);

        try {
            // TODO: Replace with actual API call
            // const res = await fetch("/api/profile/change-password", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({
            //     current_password: form.current_password,
            //     new_password: form.new_password,
            //   }),
            // });
            // if (!res.ok) {
            //   const data = await res.json();
            //   throw new Error(data.message ?? "Failed to update password.");
            // }

            await new Promise((res) => setTimeout(res, 900)); // simulate latency

            // Simulate incorrect current password (remove in production)
            // throw new Error("Current password is incorrect.");

            setSubmitStatus("success");
            setForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err: unknown) {
            setSubmitStatus("error");
            setApiError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const newPw = form.new_password;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* ── Top Bar ── */}
            <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a
                        href="/profile"
                        className="text-slate-400 text-sm hover:text-slate-700 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Profile
                    </a>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 text-sm font-semibold">Change Password</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Dalisay
                    </span>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Change Password
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Update your account password. You'll need your current password to proceed.
                    </p>
                </div>

                {/* ── Success State ── */}
                {submitStatus === "success" ? (
                    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Password Updated</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Your password has been changed successfully. Use your new password the next time you log in.
                            </p>
                        </div>
                        <a
                            href="/profile"
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-amber-500 hover:text-slate-900 transition-all"
                        >
                            Back to Profile
                        </a>
                    </div>
                ) : (

                    /* ── Form Card ── */
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-400" />

                        <div className="p-6 sm:p-8 flex flex-col gap-6">

                            {/* Current password */}
                            <PasswordInput
                                label="Current Password"
                                id="current_password"
                                value={form.current_password}
                                onChange={(v) => update("current_password", v)}
                                error={errors.current_password}
                                autoComplete="current-password"
                            />

                            <div className="border-t border-slate-100" />

                            {/* New password + strength meter */}
                            <div className="flex flex-col gap-1">
                                <PasswordInput
                                    label="New Password"
                                    id="new_password"
                                    value={form.new_password}
                                    onChange={(v) => update("new_password", v)}
                                    error={errors.new_password}
                                    autoComplete="new-password"
                                />
                                <StrengthMeter password={form.new_password} />
                            </div>

                            {/* Confirm password */}
                            <PasswordInput
                                label="Confirm New Password"
                                id="confirm_password"
                                value={form.confirm_password}
                                onChange={(v) => update("confirm_password", v)}
                                error={errors.confirm_password}
                                autoComplete="new-password"
                            />

                            {/* Requirements checklist */}
                            <ul className="flex flex-col gap-1.5 bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
                                <RequirementItem
                                    met={newPw.length >= 8}
                                    label="At least 8 characters"
                                />
                                <RequirementItem
                                    met={/[A-Z]/.test(newPw) && /[a-z]/.test(newPw)}
                                    label="Upper and lowercase letters"
                                />
                                <RequirementItem
                                    met={/\d/.test(newPw)}
                                    label="At least one number"
                                />
                                <RequirementItem
                                    met={/[^A-Za-z0-9]/.test(newPw)}
                                    label="At least one special character"
                                />
                            </ul>

                            {/* API error banner */}
                            {submitStatus === "error" && apiError && (
                                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                    </svg>
                                    {apiError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`
                    flex-1 sm:flex-none inline-flex items-center justify-center gap-2
                    px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                    ${isSubmitting
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-900 shadow-sm"
                                        }
                  `}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Updating…
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>

                                <a
                                    href="/profile"
                                    className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </a>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Security note ── */}
                <p className="text-xs text-slate-400 text-center px-4">
                    For security, you will not be automatically logged out after changing your password.
                    If you suspect unauthorized access, contact your Administrator immediately.
                </p>

            </main>
        </div>
    );
}