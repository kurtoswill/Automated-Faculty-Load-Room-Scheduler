"use client";

import Link from "next/link";
import AppShell from "@/components/Navbar";

// ─── Placeholder Data ─────────────────────────────────────────
const FACULTY_LOAD_DATA = [
    {
        id: 1,
        instructor_id: 101,
        first_name: "Juan",
        last_name: "Dela Cruz",
        employee_id: "EMP-001",
        dept: "DCS",
        max_units: 21.0,
        max_classes: 6,
        current_units: 15.0,
        pending_units: 3.0,
        current_classes: 5,
        pending_classes: 1,
        updated_at: "2025-06-01T10:30:00",
    },
    {
        id: 2,
        instructor_id: 102,
        first_name: "Maria",
        last_name: "Santos",
        employee_id: "EMP-002",
        dept: "DCS",
        max_units: 18.0,
        max_classes: 5,
        current_units: 18.0,
        pending_units: 0,
        current_classes: 5,
        pending_classes: 0,
        updated_at: "2025-06-01T09:00:00",
    },
    {
        id: 3,
        instructor_id: 103,
        first_name: "Pedro",
        last_name: "Reyes",
        employee_id: "EMP-003",
        dept: "DIT",
        max_units: 21.0,
        max_classes: 6,
        current_units: 9.0,
        pending_units: 0,
        current_classes: 3,
        pending_classes: 0,
        updated_at: "2025-05-28T14:00:00",
    },
    {
        id: 4,
        instructor_id: 104,
        first_name: "Ana",
        last_name: "Lim",
        employee_id: "EMP-004",
        dept: "DCS",
        max_units: 21.0,
        max_classes: 6,
        current_units: 0,
        pending_units: 6.0,
        current_classes: 0,
        pending_classes: 2,
        updated_at: "2025-06-02T08:00:00",
    },
    {
        id: 5,
        instructor_id: 105,
        first_name: "Carlos",
        last_name: "Mendoza",
        employee_id: "EMP-005",
        dept: "DIT",
        max_units: 18.0,
        max_classes: 5,
        current_units: 12.0,
        pending_units: 3.0,
        current_classes: 4,
        pending_classes: 1,
        updated_at: "2025-06-01T11:00:00",
    },
];

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function getLoadStatus(current: number, pending: number, max: number): { label: string; cls: string } {
    const total = current + pending;
    const pct = (total / max) * 100;
    if (current >= max) return { label: "At Limit", cls: "badge-red" };
    if (pct >= 80) return { label: "Near Limit", cls: "badge-yellow" };
    if (current === 0 && pending === 0) return { label: "No Load", cls: "badge-gray" };
    return { label: "Within Limit", cls: "badge-green" };
}

export default function AdminFacultyLoadPage() {
    const atLimit = FACULTY_LOAD_DATA.filter((f) => f.current_units >= f.max_units).length;
    const nearLimit = FACULTY_LOAD_DATA.filter((f) => {
        const pct = ((f.current_units + f.pending_units) / f.max_units) * 100;
        return pct >= 80 && f.current_units < f.max_units;
    }).length;
    const noLoad = FACULTY_LOAD_DATA.filter((f) => f.current_units === 0 && f.pending_units === 0).length;

    return (
        <AppShell role="admin" userName="Admin User" pageTitle="Faculty Load Management">
            <div className="animate-fade-in space-y-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                            Faculty Load Management
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                            Configure and monitor teaching load limits per instructor — 2025–2026 • 1st Semester
                        </p>
                    </div>
                </div>

                {/* ── Summary Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Instructors"
                        value={String(FACULTY_LOAD_DATA.length)}
                        icon={<InstructorIcon />}
                    />

                    <StatCard
                        label="At Load Limit"
                        value={String(atLimit)}
                        icon={<LoadStatusIcon status="At Limit" />}
                    />

                    <StatCard
                        label="Near Limit (≥80%)"
                        value={String(nearLimit)}
                        icon={<LoadStatusIcon status="Near Limit" />}
                    />

                    <StatCard
                        label="No Load Assigned"
                        value={String(noLoad)}
                        icon={<LoadStatusIcon status="No Load" />}
                    />
                </div>

                {/* ── Table ── */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "var(--color-border)" }}>
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>All Instructors</h2>
                        <div className="flex gap-2 items-center">
                            {/* Search placeholder */}
                            <div className="input-icon-wrapper">
                                <span className="input-icon-left">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search instructor..."
                                    className="input-has-left-icon"
                                    style={{ width: "200px", padding: "7px 14px 7px 2.5rem" }}
                                    disabled
                                />
                            </div>
                            {/* Dept filter placeholder */}
                            <select disabled style={{ width: "130px", padding: "7px 14px" }}>
                                <option>All Departments</option>
                                <option>DCS</option>
                                <option>DIT</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Instructor</th>
                                    <th>Department</th>
                                    <th>Load Limit</th>
                                    <th>Units Used</th>
                                    <th>Classes</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {FACULTY_LOAD_DATA.map((f) => {
                                    const totalUnits = f.current_units + f.pending_units;
                                    const unitsPct = Math.min((totalUnits / f.max_units) * 100, 100);
                                    const status = getLoadStatus(f.current_units, f.pending_units, f.max_units);
                                    return (
                                        <tr key={f.id}>
                                            <td>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                                        {f.first_name} {f.last_name}
                                                    </p>
                                                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                                        {f.employee_id}
                                                    </p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-blue">{f.dept}</span>
                                            </td>
                                            <td>
                                                <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                                    {f.max_units} units / {f.max_classes} classes
                                                </p>
                                            </td>
                                            <td style={{ minWidth: "160px" }}>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                                        <span>{f.current_units.toFixed(1)}{f.pending_units > 0 && <span style={{ color: "var(--color-accent)" }}> +{f.pending_units.toFixed(1)}</span>}</span>
                                                        <span>{f.max_units.toFixed(1)}</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${unitsPct}%`,
                                                                background: unitsPct >= 100
                                                                    ? "var(--color-error)"
                                                                    : unitsPct >= 80
                                                                        ? "var(--color-warning)"
                                                                        : "var(--color-primary-light)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                                                    {f.current_classes}
                                                    {f.pending_classes > 0 && (
                                                        <span className="text-xs ml-1" style={{ color: "var(--color-accent)" }}>+{f.pending_classes}</span>
                                                    )}
                                                </span>
                                                <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>/ {f.max_classes}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${status.cls}`}>{status.label}</span>
                                            </td>
                                            <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                {formatDate(f.updated_at)}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/faculty-load/${f.id}`}
                                                    className="btn btn-sm btn-outline"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination placeholder */}
                    <div className="px-6 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                        <span>Showing {FACULTY_LOAD_DATA.length} of {FACULTY_LOAD_DATA.length} instructors</span>
                        <div className="flex gap-1">
                            <button className="btn btn-sm btn-ghost" disabled>← Prev</button>
                            <button className="btn btn-sm btn-ghost" disabled>Next →</button>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="card card-body flex items-center gap-4">
            <span className="text-2xl">{icon}</span>
            <div>
                <p className="text-xl font-bold leading-none" style={{ color: "var(--color-text)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
            </div>
        </div>
    );
}

function InstructorIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    );
}

function LoadStatusIcon({ status }: { status: string }) {
    const color = status === "At Limit" ? "text-red-500" : status === "Near Limit" ? "text-amber-500" : "text-gray-400";
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${color}`}>
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-25" />
        </svg>
    );
}