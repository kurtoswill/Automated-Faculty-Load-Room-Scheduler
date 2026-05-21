"use client";

import { useState } from "react";
import type { Role, Department, CreateUserPayload } from "../types";
import AppShell from "@/components/Navbar";

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: Replace with → fetch("/api/departments")

const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: "Department of Computer Science", code: "DCS" },
    { id: 2, name: "Department of Information Technology", code: "DIT" },
    { id: 3, name: "Department of Mathematics", code: "DMATH" },
    { id: 4, name: "Department of Engineering", code: "DE" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: Role | "";
    dept_id: number | "";
    employee_id: string;
    student_id: string;
    is_irregular: boolean;
}

interface FieldErrors {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    role?: string;
    dept_id?: string;
    employee_id?: string;
    student_id?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.first_name.trim()) errors.first_name = "First name is required.";
    if (!form.last_name.trim()) errors.last_name = "Last name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Enter a valid email address.";
    if (!form.role) errors.role = "Please select a role.";
    if (!form.dept_id) errors.dept_id = "Please select a department.";
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 8)
        errors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm_password)
        errors.confirm_password = "Passwords do not match.";

    if (form.role === "Admin" || form.role === "Instructor") {
        if (!form.employee_id.trim()) errors.employee_id = "Employee ID is required.";
    }
    if (form.role === "Student") {
        if (!form.student_id.trim()) errors.student_id = "Student ID is required.";
    }

    return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="form-label block mb-1.5">
            {children}
        </label>
    );
}

function TextInput({
    id, value, onChange, placeholder, error, type = "text", autoComplete,
}: {
    id: string; value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string; type?: string; autoComplete?: string;
}) {
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === "password";
    
    return (
        <div className="form-group">
            <div className="input-icon-wrapper">
                <input
                    id={id}
                    type={isPassword && showPw ? "text" : type}
                    value={value}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${isPassword ? "input-has-right-icon" : ""} ${error ? "border-error text-error focus:border-error" : ""}`}
                    style={error ? { boxShadow: "0 0 0 3px rgba(217, 48, 37, 0.12)" } : {}}
                />
                {isPassword && (
                    <button 
                        type="button" 
                        tabIndex={-1} 
                        onClick={() => setShowPw((v) => !v)}
                        className="input-icon-right hover:text-text transition-colors"
                    >
                        {showPw ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-7s4.477-7 10-7a10.05 10.05 0 014.875 1.175M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && <p className="form-error flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9 3a1 1 0 102 0 1 1 0 00-2 0zm1-7a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>}
        </div>
    );
}

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
    { value: "Admin", label: "Administrator", description: "Full platform access. Manages users, rooms, requests, and schedules." },
    { value: "Instructor", label: "Instructor", description: "Submits room requests and manages their own teaching schedule." },
    { value: "Student", label: "Student", description: "Read-only access to assigned class schedules." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersCreatePage() {
    // TODO: Replace with fetch("/api/departments")
    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

    const [form, setForm] = useState<FormState>({
        first_name: "", last_name: "", email: "", password: "", confirm_password: "",
        role: "", dept_id: "", employee_id: "", student_id: "", is_irregular: false,
    });

    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [createdId, setCreatedId] = useState<number | null>(null);

    function update<K extends keyof FormState>(field: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FieldErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    function handleRoleSelect(role: Role) {
        setForm((prev) => ({
            ...prev, role,
            employee_id: "", student_id: "", is_irregular: false,
        }));
        setErrors((prev) => ({ ...prev, role: undefined, employee_id: undefined, student_id: undefined }));
    }

    async function handleSubmit() {
        const fieldErrors = validate(form);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        setApiError(null);

        const payload: CreateUserPayload = {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role as Role,
            dept_id: form.dept_id as number,
            employee_id: (form.role === "Admin" || form.role === "Instructor") ? form.employee_id.trim() : null,
            student_id: form.role === "Student" ? form.student_id.trim() : null,
            is_irregular: form.role === "Student" ? form.is_irregular : false,
        };

        try {
            console.log("Create user payload:", payload);
            await new Promise((r) => setTimeout(r, 900));
            setCreatedId(99); 
            setSuccess(true);
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // ─── Success state ────────────────────────────────────────────────────────

    if (success) {
        return (
            <div className="page-shell flex flex-col">
                <header className="topbar justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/admin/users" className="text-text-muted text-sm hover:text-text transition-colors flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Users
                        </a>
                        <span className="text-border">/</span>
                        <span className="text-text text-sm font-semibold">Create User</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Dalisay</span>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center px-4 py-12 pt-topbar">
                    <div className="card p-10 max-w-sm w-full flex flex-col items-center text-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-primary-muted border border-primary/20 flex items-center justify-center">
                            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">User Created</h2>
                            <p className="text-sm text-text-secondary mt-1">The account has been created and is ready to use.</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full mt-2">
                            <a href={`/admin/users/${createdId}`} className="btn btn-primary btn-full">
                                View User Profile
                            </a>
                            <a href="/admin/users/create" onClick={() => window.location.reload()} className="btn btn-outline btn-full">
                                Create Another
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ─── Form ─────────────────────────────────────────────────────────────────

    return (
        <AppShell role="admin" userName="Admin Cruz" pageTitle="Create User">
            <div className="page-shell">
                <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-text tracking-tight">Create User</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Add a new Admin, Instructor, or Student to the platform.
                        </p>
                    </div>

                    {/* ── Step 1: Role selection ── */}
                    <section className="card">
                        <div className="h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
                        <div className="card-body sm:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                    Step 1 — Select Role
                                </h2>
                                {errors.role && <p className="form-error mt-0">{errors.role}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {ROLE_OPTIONS.map((opt) => {
                                    const isSelected = form.role === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleRoleSelect(opt.value)}
                                            className={`text-left rounded-xl border-2 p-4 transition-all duration-150 ${
                                                isSelected 
                                                    ? "border-primary bg-primary-muted shadow-sm" 
                                                    : "border-border bg-surface hover:border-primary-light"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
                                                <span className="text-sm font-semibold text-text">{opt.label}</span>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 ml-auto text-primary animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed">{opt.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── Step 2: Personal info ── */}
                    {form.role && (
                        <section className="card card-body sm:p-8 flex flex-col gap-5 animate-fade-in">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                Step 2 — Personal Information
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>First Name</FieldLabel>
                                    <TextInput
                                        id="first_name"
                                        value={form.first_name}
                                        onChange={(v) => update("first_name", v)}
                                        placeholder="e.g. Juan"
                                        error={errors.first_name}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <TextInput
                                        id="last_name"
                                        value={form.last_name}
                                        onChange={(v) => update("last_name", v)}
                                        placeholder="e.g. Dela Cruz"
                                        error={errors.last_name}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <FieldLabel>Institutional Email</FieldLabel>
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(v) => update("email", v)}
                                    placeholder="e.g. jdelacruz@university.edu.ph"
                                    error={errors.email}
                                />
                            </div>

                            <div className="form-group">
                                <FieldLabel>Department</FieldLabel>
                                <select
                                    value={form.dept_id}
                                    onChange={(e) => update("dept_id", Number(e.target.value))}
                                    className={errors.dept_id ? "border-error text-error focus:border-error" : ""}
                                    style={errors.dept_id ? { boxShadow: "0 0 0 3px rgba(217, 48, 37, 0.12)" } : {}}
                                >
                                    <option value="">Select department…</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.code} — {d.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.dept_id && <p className="form-error">{errors.dept_id}</p>}
                            </div>

                            {(form.role === "Admin" || form.role === "Instructor") && (
                                <div className="form-group">
                                    <FieldLabel>Employee ID</FieldLabel>
                                    <TextInput
                                        id="employee_id"
                                        value={form.employee_id}
                                        onChange={(v) => update("employee_id", v)}
                                        placeholder="e.g. EMP-20240001"
                                        error={errors.employee_id}
                                    />
                                </div>
                            )}

                            {form.role === "Student" && (
                                <>
                                    <div className="form-group">
                                        <FieldLabel>Student ID</FieldLabel>
                                        <TextInput
                                            id="student_id"
                                            value={form.student_id}
                                            onChange={(v) => update("student_id", v)}
                                            placeholder="e.g. STU-2024-001"
                                            error={errors.student_id}
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <button
                                            type="button"
                                            onClick={() => update("is_irregular", !form.is_irregular)}
                                            className={`relative mt-0.5 w-10 h-5.5 rounded-full flex-shrink-0 transition-colors duration-200 border-2 ${form.is_irregular
                                                    ? "bg-orange-400 border-orange-400"
                                                    : "bg-slate-200 border-slate-300"
                                                }`}
                                            style={{ height: "23px", width: "40px" }}
                                            aria-pressed={form.is_irregular}
                                        >
                                            <span
                                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.is_irregular ? "translate-x-[0.7px]" : "translate-x-[-17px]"
                                                    }`}
                                            />
                                        </button>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-800">Mark as Irregular Student</p>
                                            <p className="text-xs text-orange-600 mt-0.5">
                                                Irregular students have back subjects and may be assigned to sections across multiple year levels.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    )}

                    {/* ── Step 3: Initial password ── */}
                    {form.role && (
                        <section className="card card-body sm:p-8 flex flex-col gap-5 animate-fade-in">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                    Step 3 — Set Initial Password
                                </h2>
                                <p className="text-xs text-text-secondary mt-1">
                                    The user should change this password after their first login.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Password</FieldLabel>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={form.password}
                                        onChange={(v) => update("password", v)}
                                        placeholder="Min. 8 characters"
                                        autoComplete="new-password"
                                        error={errors.password}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Confirm Password</FieldLabel>
                                    <TextInput
                                        id="confirm_password"
                                        type="password"
                                        value={form.confirm_password}
                                        onChange={(v) => update("confirm_password", v)}
                                        placeholder="Repeat password"
                                        autoComplete="new-password"
                                        error={errors.confirm_password}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {apiError && (
                        <div className="flex items-start gap-2 text-sm text-error bg-error-light border border-error/50 rounded-lg px-4 py-3 animate-fade-in">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                            </svg>
                            {apiError}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pb-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !form.role}
                            className={`btn ${isSubmitting || !form.role ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'btn-primary'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                "Create User"
                            )}
                        </button>

                        <a href="/admin/users" className="btn btn-ghost">
                            Cancel
                        </a>
                    </div>
                </main>
            </div>
        </AppShell>
    );
}