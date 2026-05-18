"use client";

import Link from "next/link";
import { useState } from "react";

import AppShell from "@/components/Navbar";
import type { UserRole } from "@/config/navigation/types";

// ─── Types (mirror DB schema) ────────────────────────────────────────────────

type Role = "Admin" | "Instructor" | "Student";

interface Department {
    id: number;
    name: string;
    code: string;
}

interface UserProfile {
    id: number;
    employee_id: string | null;   // null for Students
    student_id: string | null;    // null for Instructors & Admins
    email: string;
    first_name: string;
    last_name: string;
    dept_id: number;
    role: Role;
    is_irregular: boolean;        // Students only
    is_active: boolean;
    created_at: string;
}

// ─── Placeholder Data (TODO: replace with API call to GET /api/profile) ──────

const MOCK_USER: UserProfile = {
    id: 1,
    employee_id: "EMP-20241001",
    student_id: null,
    email: "juan.delacruz@university.edu.ph",
    first_name: "Juan",
    last_name: "Dela Cruz",
    dept_id: 1,
    role: "Instructor",
    is_irregular: false,
    is_active: true,
    created_at: "2024-08-01T08:00:00Z",
};

const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: "Department of Computer Science", code: "DCS" },
    { id: 2, name: "Department of Information Technology", code: "DIT" },
    { id: 3, name: "Department of Mathematics", code: "DMATH" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
    Admin: {
        label: "Administrator",
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
    },
    Instructor: {
        label: "Instructor",
        color: "text-sky-700",
        bg: "bg-sky-50 border-sky-200",
    },
    Student: {
        label: "Student",
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
    label,
    id,
    value,
    onChange,
    disabled = false,
    type = "text",
    hint,
}: {
    label: string;
    id: string;
    value: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    type?: string;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-xs font-semibold uppercase tracking-widest text-slate-400"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`
          rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-800
          transition-all duration-150 outline-none
          ${disabled
                        ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    }
        `}
            />
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </span>
            <span className="font-mono text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                {value || "—"}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    // TODO: Replace with useEffect → fetch("/api/profile") → setUser(data)
    const [user] = useState<UserProfile>(MOCK_USER);

    // TODO: Replace with fetched departments → fetch("/api/departments")
    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

    const department = departments.find((d) => d.id === user.dept_id);
    const roleConfig = ROLE_CONFIG[user.role];

    const roleKey = (user.role === "Admin"
        ? "admin"
        : user.role === "Instructor"
            ? "instructor"
            : "student") as UserRole;

    // Editable fields — only first_name, last_name, email are editable by user
    const [firstName, setFirstName] = useState(user.first_name);
    const [lastName, setLastName] = useState(user.last_name);
    const [email, setEmail] = useState(user.email);

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const isDirty =
        firstName !== user.first_name ||
        lastName !== user.last_name ||
        email !== user.email;

    async function handleSave() {
        if (!isDirty) return;
        setIsSaving(true);
        setSaveStatus("idle");

        try {
            // TODO: Replace with actual API call
            // await fetch("/api/profile", {
            //   method: "PATCH",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
            // });
            await new Promise((res) => setTimeout(res, 800)); // simulate latency
            setSaveStatus("success");
        } catch {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    }

    function handleDiscard() {
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.email);
        setSaveStatus("idle");
    }

    return (
        <AppShell
            role={roleKey}
            userName={`${user.first_name} ${user.last_name}`}
            pageTitle="My Profile"
            isIrregular={user.role === "Student" && user.is_irregular}
        >
            <main className="animate-fade-in mx-auto py-6 flex flex-col gap-6">

                {/* ── Identity Card ── */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Color band */}
                    <div className="h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-400" />

                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-md">
                                <span className="text-2xl font-bold tracking-tight text-white">
                                    {getInitials(firstName, lastName)}
                                </span>
                            </div>
                            {/* Active indicator */}
                            {user.is_active && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
                            )}
                        </div>

                        {/* Identity info */}
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {firstName} {lastName}
                                </h1>
                                <span
                                    className={`inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleConfig.bg} ${roleConfig.color}`}
                                >
                                    {roleConfig.label}
                                </span>
                                {user.role === "Student" && user.is_irregular && (
                                    <span className="inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 border-orange-200 text-orange-700">
                                        Irregular
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-500">{email}</p>

                            <div className="flex flex-wrap gap-3 mt-1">
                                {department && (
                                    <span className="font-mono text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-1">
                                        {department.code} — {department.name}
                                    </span>
                                )}
                                <span className="font-mono text-xs text-slate-400 bg-slate-50 rounded-md px-2 py-1">
                                    Joined {formatDate(user.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Account Identifiers (read-only) ── */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
                        Account Identifiers
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ReadOnlyField label="Role" value={user.role} />
                        <ReadOnlyField
                            label="Department"
                            value={department ? `${department.code} – ${department.name}` : "—"}
                        />
                        {user.role !== "Student" && (
                            <ReadOnlyField
                                label="Employee ID"
                                value={user.employee_id ?? "—"}
                            />
                        )}
                        {user.role === "Student" && (
                            <ReadOnlyField
                                label="Student ID"
                                value={user.student_id ?? "—"}
                            />
                        )}
                        <ReadOnlyField
                            label="Account Status"
                            value={user.is_active ? "Active" : "Deactivated"}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                        These fields are managed by the Administrator and cannot be changed here.
                    </p>
                </section>

                {/* ── Editable Info ── */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                            label="First Name"
                            id="first_name"
                            value={firstName}
                            onChange={setFirstName}
                        />
                        <InputField
                            label="Last Name"
                            id="last_name"
                            value={lastName}
                            onChange={setLastName}
                        />
                        <div className="sm:col-span-2">
                            <InputField
                                label="Institutional Email"
                                id="email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                hint="Must be your official university email address."
                            />
                        </div>
                    </div>

                    {/* Save status banner */}
                    {saveStatus === "success" && (
                        <div className="mt-5 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Profile updated successfully.
                        </div>
                    )}
                    {saveStatus === "error" && (
                        <div className="mt-5 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                            </svg>
                            Failed to update profile. Please try again.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || isSaving}
                            className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-150
                ${isDirty && !isSaving
                                    ? "bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-900 shadow-sm"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }
              `}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>

                        {isDirty && (
                            <button
                                onClick={handleDiscard}
                                className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-2"
                            >
                                Discard
                            </button>
                        )}

                        {/* Change password link */}
                        <a
                            href="/change-password"
                            className="ml-auto text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                        >
                            Change Password →
                        </a>
                    </div>
                </section>

            </main>
        </AppShell>
    );
}