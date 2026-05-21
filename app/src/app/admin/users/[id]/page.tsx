"use client";

import { useState } from "react";
import type { User, Department, Role, UpdateUserPayload } from "../types";
import AppShell from "@/components/Navbar";

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: Replace with → fetch(`/api/admin/users/${id}`) and fetch("/api/departments")
const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: "Department of Computer Science", code: "DCS" },
    { id: 2, name: "Department of Information Technology", code: "DIT" },
    { id: 3, name: "Department of Mathematics", code: "DMATH" },
    { id: 4, name: "Department of Engineering", code: "DE" },
];

const MOCK_USER: User = {
    id: 2,
    employee_id: "EMP-002",
    student_id: null,
    email: "jdelacruz@uni.edu.ph",
    first_name: "Juan",
    last_name: "Dela Cruz",
    dept_id: 1,
    role: "Instructor",
    is_irregular: false,
    is_active: true,
    created_at: "2024-07-15T08:00:00Z",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditFormErrors {
    first_name?: string;
    last_name?: string;
    email?: string;
    employee_id?: string;
    student_id?: string;
}

type ModalType = "deactivate" | "reactivate" | "resetPassword" | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
    return `${first[0]}${last[0]}`.toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
    });
}

const ROLE_STYLE: Record<Role, { label: string; badge: string }> = {
    Admin: { label: "Administrator", badge: "badge-yellow" },
    Instructor: { label: "Instructor", badge: "badge-blue" },
    Student: { label: "Student", badge: "badge-green" },
};

function validate(form: { first_name: string; last_name: string; email: string; employee_id: string; student_id: string }, role: Role): EditFormErrors {
    const errors: EditFormErrors = {};
    if (!form.first_name.trim()) errors.first_name = "First name is required.";
    if (!form.last_name.trim()) errors.last_name = "Last name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Enter a valid email.";
    if ((role === "Admin" || role === "Instructor") && !form.employee_id.trim())
        errors.employee_id = "Employee ID is required.";
    if (role === "Student" && !form.student_id.trim())
        errors.student_id = "Student ID is required.";
    return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary block mb-1.5">
            {children}
        </label>
    );
}

function TextInput({
    id, value, onChange, error, disabled = false, type = "text",
}: {
    id: string; value: string; onChange?: (v: string) => void;
    error?: string; disabled?: boolean; type?: string;
}) {
    return (
        <div>
            <input
                id={id}
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full rounded-sm border px-3 py-2.5 text-sm font-medium outline-none transition-all
          ${disabled
                        ? "bg-surface-2 border-border text-text-muted cursor-not-allowed"
                        : error
                            ? "border-error bg-error-light text-text focus:border-error focus:ring-2 focus:ring-error/10"
                            : "border-border bg-surface text-text focus:border-border-focus focus:ring-2 focus:ring-primary-muted"}`}
            />
            {error && (
                <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9 3a1 1 0 102 0 1 1 0 00-2 0zm1-7a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <span className="block font-mono text-sm text-text-secondary bg-surface-2 border border-border rounded-sm px-3 py-2.5">
                {value || "—"}
            </span>
        </div>
    );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
    type, isLoading, onConfirm, onCancel,
}: {
    type: NonNullable<ModalType>;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const config = {
        deactivate: {
            title: "Deactivate Account",
            body: "This user will no longer be able to log in. Their data and history will be preserved. You can reactivate them at any time.",
            confirm: "Deactivate",
            confirmClass: "btn-danger",
            icon: (
                <div className="w-12 h-12 rounded-full bg-error-light flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
            ),
        },
        reactivate: {
            title: "Reactivate Account",
            body: "This user will regain access to their account and dashboard immediately.",
            confirm: "Reactivate",
            confirmClass: "btn-primary",
            icon: (
                <div className="w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            ),
        },
        resetPassword: {
            title: "Reset Password",
            body: "This will generate a temporary password for the user. You'll see it once after confirming — share it securely.",
            confirm: "Reset Password",
            confirmClass: "bg-text hover:bg-primary-light text-text-on-primary",
            icon: (
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
            ),
        },
    }[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-text/40 backdrop-blur-sm" onClick={onCancel} />
            {/* Panel */}
            <div className="relative bg-surface rounded-lg shadow-xl border border-border max-w-sm w-full p-6 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                    {config.icon}
                    <div>
                        <h3 className="text-base font-bold text-text">{config.title}</h3>
                        <p className="text-sm text-text-secondary mt-1">{config.body}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading}
                        className={`flex-1 btn text-sm font-semibold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 ${config.confirmClass}`}>
                        {isLoading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Processing…
                            </>
                        ) : config.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
    const [user, setUser] = useState<User>(MOCK_USER);
    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

    // ── Edit form state ──
    const [firstName, setFirstName] = useState(user.first_name);
    const [lastName, setLastName] = useState(user.last_name);
    const [email, setEmail] = useState(user.email);
    const [deptId, setDeptId] = useState(user.dept_id);
    const [employeeId, setEmployeeId] = useState(user.employee_id ?? "");
    const [studentId, setStudentId] = useState(user.student_id ?? "");
    const [isIrregular, setIsIrregular] = useState(user.is_irregular);

    const [editErrors, setEditErrors] = useState<EditFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // ── Modal state ──
    const [modal, setModal] = useState<ModalType>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const roleStyle = ROLE_STYLE[user.role];

    const isDirty =
        firstName !== user.first_name ||
        lastName !== user.last_name ||
        email !== user.email ||
        deptId !== user.dept_id ||
        employeeId !== (user.employee_id ?? "") ||
        studentId !== (user.student_id ?? "") ||
        isIrregular !== user.is_irregular;

    function handleDiscard() {
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);
        setDeptId(user.dept_id);
        setEmployeeId(user.employee_id ?? "");
        setStudentId(user.student_id ?? "");
        setIsIrregular(user.is_irregular);
        setEditErrors({});
        setSaveStatus("idle");
    }

    async function handleSave() {
        const errors = validate({ first_name: firstName, last_name: lastName, email, employee_id: employeeId, student_id: studentId }, user.role);
        if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }

        setIsSaving(true); setSaveStatus("idle");

        const payload: UpdateUserPayload = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            dept_id: deptId,
            employee_id: (user.role === "Admin" || user.role === "Instructor") ? employeeId.trim() : null,
            student_id: user.role === "Student" ? studentId.trim() : null,
            is_irregular: user.role === "Student" ? isIrregular : false,
        };

        try {
            console.log("Update user payload:", payload);
            await new Promise((r) => setTimeout(r, 800));
            setUser((u) => ({ ...u, ...payload, employee_id: payload.employee_id ?? null, student_id: payload.student_id ?? null }));
            setSaveStatus("success");
        } catch {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleModalConfirm() {
        if (!modal) return;
        setModalLoading(true);

        try {
            if (modal === "deactivate") {
                await new Promise((r) => setTimeout(r, 700));
                setUser((u) => ({ ...u, is_active: false }));
            } else if (modal === "reactivate") {
                await new Promise((r) => setTimeout(r, 700));
                setUser((u) => ({ ...u, is_active: true }));
            } else if (modal === "resetPassword") {
                await new Promise((r) => setTimeout(r, 700));
                setTempPassword("Tmp@" + Math.random().toString(36).slice(2, 10));
            }
            setModal(null);
        } finally {
            setModalLoading(false);
        }
    }

    return (
        <AppShell role="admin" userName="Admin Cruz" pageTitle="User Management">
            <div className="page-shell">

                {/* ── Modal ── */}
                {modal && (
                    <ConfirmModal
                        type={modal}
                        isLoading={modalLoading}
                        onConfirm={handleModalConfirm}
                        onCancel={() => setModal(null)}
                    />
                )}

                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">

                    {/* ── Identity card ── */}
                    <section className="card">
                        <div className="h-2 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
                        <div className="card-body flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                                    <span className="text-2xl font-bold text-text-on-primary">
                                        {getInitials(firstName, lastName)}
                                    </span>
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${user.is_active ? "bg-success" : "bg-error"}`} />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold text-text tracking-tight">
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <span className={`badge ${roleStyle.badge}`}>
                                        {roleStyle.label}
                                    </span>
                                    {!user.is_active && (
                                        <span className="badge badge-red">Inactive</span>
                                    )}
                                    {user.role === "Student" && user.is_irregular && (
                                        <span className="badge badge-yellow">Irregular</span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary">{user.email}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="font-mono text-xs text-text-secondary bg-surface-2 rounded-md px-2 py-1">
                                        UID #{user.id}
                                    </span>
                                    <span className="font-mono text-xs text-primary bg-primary-muted rounded-md px-2 py-1">
                                        Joined {formatDate(user.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Temp password display (after reset) ── */}
                    {tempPassword && (
                        <div className="bg-warning/10 border border-warning rounded-xl px-5 py-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-text">Temporary Password Generated</p>
                                <p className="font-mono text-sm text-text mt-1 select-all bg-surface-2 rounded px-2 py-1 inline-block">
                                    {tempPassword}
                                </p>
                                <p className="text-xs text-text-secondary mt-1.5">
                                    Share this securely. It will not be shown again.
                                </p>
                                <button onClick={() => setTempPassword(null)} className="text-xs text-text-secondary underline mt-1 hover:text-text transition-colors">
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Account Identifiers (read-only) ── */}
                    <section className="card">
                        <div className="card-body flex flex-col gap-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                Account Identifiers
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ReadOnlyField label="Role" value={user.role} />
                                {user.role !== "Student" && (
                                    <ReadOnlyField label="Employee ID" value={user.employee_id ?? "—"} />
                                )}
                                {user.role === "Student" && (
                                    <ReadOnlyField label="Student ID" value={user.student_id ?? "—"} />
                                )}
                                <ReadOnlyField label="Account Status" value={user.is_active ? "Active" : "Inactive"} />
                                <ReadOnlyField label="Created" value={formatDate(user.created_at)} />
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Role and account IDs are set at creation. To change them, contact the system administrator.
                            </p>
                        </div>
                    </section>

                    {/* ── Editable Info ── */}
                    <section className="card">
                        <div className="card-body flex flex-col gap-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                Personal Information
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>First Name</FieldLabel>
                                    <TextInput id="first_name" value={firstName}
                                        onChange={(v) => { setFirstName(v); setEditErrors((e) => ({ ...e, first_name: undefined })); }}
                                        error={editErrors.first_name} />
                                </div>
                                <div>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <TextInput id="last_name" value={lastName}
                                        onChange={(v) => { setLastName(v); setEditErrors((e) => ({ ...e, last_name: undefined })); }}
                                        error={editErrors.last_name} />
                                </div>
                            </div>

                            <div>
                                <FieldLabel>Institutional Email</FieldLabel>
                                <TextInput id="email" type="email" value={email}
                                    onChange={(v) => { setEmail(v); setEditErrors((e) => ({ ...e, email: undefined })); }}
                                    error={editErrors.email} />
                            </div>

                            <div>
                                <FieldLabel>Department</FieldLabel>
                                <select
                                    value={deptId}
                                    onChange={(e) => setDeptId(Number(e.target.value))}
                                    className="w-full rounded-sm border border-border px-3 py-2.5 text-sm font-medium text-text outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-muted bg-surface transition-all"
                                >
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {(user.role === "Admin" || user.role === "Instructor") && (
                                <div>
                                    <FieldLabel>Employee ID</FieldLabel>
                                    <TextInput id="employee_id" value={employeeId}
                                        onChange={(v) => { setEmployeeId(v); setEditErrors((e) => ({ ...e, employee_id: undefined })); }}
                                        error={editErrors.employee_id} />
                                </div>
                            )}

                            {user.role === "Student" && (
                                <>
                                    <div>
                                        <FieldLabel>Student ID</FieldLabel>
                                        <TextInput id="student_id" value={studentId}
                                            onChange={(v) => { setStudentId(v); setEditErrors((e) => ({ ...e, student_id: undefined })); }}
                                            error={editErrors.student_id} />
                                    </div>
                                    {/* is_irregular toggle */}
                                    <div className="flex items-start gap-3 bg-warning/10 border border-warning rounded-xl p-4">
                                        <button type="button"
                                            onClick={() => setIsIrregular((v) => !v)}
                                            style={{ height: "22px", width: "40px" }}
                                            className={`relative mt-0.5 rounded-full flex-shrink-0 transition-colors duration-200 border-2 ${isIrregular ? "bg-warning border-warning" : "bg-border border-border"}`}
                                            aria-pressed={isIrregular}
                                        >
                                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isIrregular ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                                        </button>
                                        <div>
                                            <p className="text-sm font-semibold text-text">Irregular Student</p>
                                            <p className="text-xs text-text-secondary mt-0.5">
                                                This student has back subjects and can be assigned to sections across multiple year levels.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Status banners */}
                            {saveStatus === "success" && (
                                <div className="flex items-center gap-2 text-sm text-success bg-primary-muted border border-success rounded-lg px-4 py-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    Profile updated successfully.
                                </div>
                            )}
                            {saveStatus === "error" && (
                                <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error rounded-lg px-4 py-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
                                    Failed to update profile. Please try again.
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <button onClick={handleSave} disabled={!isDirty || isSaving}
                                    className={`btn btn-primary ${(!isDirty || isSaving) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : "Save Changes"}
                                </button>
                                {isDirty && (
                                    <button onClick={handleDiscard} className="text-sm text-text-secondary hover:text-text transition-colors underline underline-offset-2">
                                        Discard
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Password Reset ── */}
                    <section className="card">
                        <div className="card-body">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                                Password
                            </h2>
                            <p className="text-sm text-text-secondary mb-4">
                                Generate a temporary password for this user. Share it securely — it will only be shown once.
                            </p>
                            <button
                                onClick={() => setModal("resetPassword")}
                                className="btn btn-outline"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Reset Password
                            </button>
                        </div>
                    </section>

                    {/* ── Danger Zone ── */}
                    <section className="bg-surface rounded-2xl border border-error/20 shadow-sm">
                        <div className="card-body">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-error/60 mb-1">
                                Danger Zone
                            </h2>
                            <p className="text-sm text-text-secondary mb-5">
                                {user.is_active
                                    ? "Deactivating this account will prevent the user from logging in. Their data and records will not be deleted."
                                    : "This account is currently inactive. Reactivating will restore full access immediately."}
                            </p>
                            {user.is_active ? (
                                <button
                                    onClick={() => setModal("deactivate")}
                                    className="btn btn-danger"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Deactivate Account
                                </button>
                            ) : (
                                <button
                                    onClick={() => setModal("reactivate")}
                                    className="btn btn-outline"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Reactivate Account
                                </button>
                            )}
                        </div>
                    </section>

                </main>
            </div>
        </AppShell>
    );
}