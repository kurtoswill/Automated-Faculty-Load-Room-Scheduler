"use client";

import Link from "next/link";
import AppShell from "@/components/Navbar";

// ─── Placeholder Data ─────────────────────────────────────────
// In production: fetched via params.id from Faculty_Load_Limits JOIN Users JOIN Confirmed_Schedule
const INSTRUCTOR = {
    id: 1,
    instructor_id: 101,
    first_name: "Juan",
    last_name: "Dela Cruz",
    employee_id: "EMP-001",
    email: "j.delacruz@university.edu.ph",
    dept: "Department of Computer Science",
    dept_code: "DCS",
    max_units: 21.0,
    max_classes: 6,
    updated_by: "Admin User",
    updated_at: "2025-06-01T10:30:00",
};

const CONFIRMED_SECTIONS = [
    {
        id: 1,
        course_code: "CS 3101",
        course_title: "Web Systems and Technologies",
        section_name: "BSCS 3-A",
        units: 3.0,
        day_of_week: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        room: "CS-101",
        confirmed_at: "2025-05-20T09:00:00",
        is_active: true,
    },
    {
        id: 2,
        course_code: "CS 3102",
        course_title: "Algorithms and Complexity",
        section_name: "BSCS 3-B",
        units: 3.0,
        day_of_week: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        room: "CS-102",
        confirmed_at: "2025-05-21T10:00:00",
        is_active: true,
    },
    {
        id: 3,
        course_code: "CS 4201",
        course_title: "Software Engineering",
        section_name: "BSCS 4-A",
        units: 3.0,
        day_of_week: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        room: "CS-201",
        confirmed_at: "2025-05-22T11:00:00",
        is_active: true,
    },
    {
        id: 4,
        course_code: "IT 2101",
        course_title: "Database Management Systems",
        section_name: "BSIT 2-A",
        units: 3.0,
        day_of_week: "Thursday",
        time_start: "08:00",
        time_end: "10:00",
        room: "CS-101",
        confirmed_at: "2025-05-23T09:30:00",
        is_active: true,
    },
    {
        id: 5,
        course_code: "CS 2101",
        course_title: "Data Structures",
        section_name: "BSCS 2-A",
        units: 3.0,
        day_of_week: "Friday",
        time_start: "10:00",
        time_end: "12:00",
        room: "CS-103",
        confirmed_at: "2025-05-24T08:00:00",
        is_active: true,
    },
];

const AUDIT_HISTORY = [
    {
        id: 1,
        action: "UPDATE_LOAD_LIMIT",
        details: "max_units updated from 18.0 → 21.0, max_classes updated from 5 → 6.",
        actor: "Admin User",
        performed_at: "2025-06-01T10:30:00",
    },
    {
        id: 2,
        action: "UPDATE_LOAD_LIMIT",
        details: "max_units updated from 21.0 → 18.0.",
        actor: "Admin User",
        performed_at: "2025-05-15T14:00:00",
    },
];

// ─── Helpers ──────────────────────────────────────────────────
function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
    });
}

const DAY_COLOR: Record<string, string> = {
    Monday: "bg-blue-50 text-blue-700",
    Tuesday: "bg-violet-50 text-violet-700",
    Wednesday: "bg-amber-50 text-amber-700",
    Thursday: "bg-rose-50 text-rose-700",
    Friday: "bg-teal-50 text-teal-700",
    Saturday: "bg-orange-50 text-orange-700",
};

// ─── Page ─────────────────────────────────────────────────────
export default function AdminFacultyLoadDetailPage() {
    const currentUnits = CONFIRMED_SECTIONS.filter((s) => s.is_active).reduce((sum, s) => sum + s.units, 0);
    const currentClasses = CONFIRMED_SECTIONS.filter((s) => s.is_active).length;
    const unitsPct = Math.min((currentUnits / INSTRUCTOR.max_units) * 100, 100);
    const classesPct = Math.min((currentClasses / INSTRUCTOR.max_classes) * 100, 100);

    return (
        <AppShell role="admin" userName="Admin User" pageTitle="Faculty Load — Detail">
            <div className="animate-fade-in space-y-6 max-w-4xl">

                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <Link href="/admin/faculty-load" className="hover:underline" style={{ color: "var(--color-primary-light)" }}>
                        Faculty Load
                    </Link>
                    <span>/</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                        {INSTRUCTOR.first_name} {INSTRUCTOR.last_name}
                    </span>
                </nav>

                {/* ── Instructor Profile Card ── */}
                <div className="card card-body flex items-start gap-5 flex-wrap">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                        style={{ background: "#fff8e6", color: "#92620a" }}
                    >
                        {INSTRUCTOR.first_name[0]}{INSTRUCTOR.last_name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                                {INSTRUCTOR.first_name} {INSTRUCTOR.last_name}
                            </h1>
                            <span className="badge badge-blue">{INSTRUCTOR.dept_code}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                            {INSTRUCTOR.employee_id} · {INSTRUCTOR.email}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {INSTRUCTOR.dept}
                        </p>
                    </div>
                    <div className="text-right text-xs" style={{ color: "var(--color-text-muted)" }}>
                        <p>Last updated by <strong style={{ color: "var(--color-text-secondary)" }}>{INSTRUCTOR.updated_by}</strong></p>
                        <p className="mt-0.5">{formatDateTime(INSTRUCTOR.updated_at)}</p>
                    </div>
                </div>

                {/* ── Current vs Limit Stats ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <MiniStat label="Max Units" value={`${INSTRUCTOR.max_units}`} note="configured limit" />
                    <MiniStat label="Units Used" value={`${currentUnits.toFixed(1)}`} note={`${(INSTRUCTOR.max_units - currentUnits).toFixed(1)} remaining`} highlight={unitsPct >= 80} />
                    <MiniStat label="Max Classes" value={`${INSTRUCTOR.max_classes}`} note="configured limit" />
                    <MiniStat label="Classes Used" value={`${currentClasses}`} note={`${INSTRUCTOR.max_classes - currentClasses} remaining`} highlight={classesPct >= 80} />
                </div>

                {/* ── Load Progress ── */}
                <div className="card card-body space-y-4">
                    <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Load Utilization</h2>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            <span>Teaching Units</span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>{currentUnits.toFixed(1)} / {INSTRUCTOR.max_units.toFixed(1)}</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{
                                width: `${unitsPct}%`,
                                background: unitsPct >= 100 ? "var(--color-error)" : unitsPct >= 80 ? "var(--color-warning)" : "var(--color-primary-light)",
                            }} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            <span>Class Sections</span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>{currentClasses} / {INSTRUCTOR.max_classes}</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{
                                width: `${classesPct}%`,
                                background: classesPct >= 100 ? "var(--color-error)" : classesPct >= 80 ? "var(--color-warning)" : "var(--color-info)",
                            }} />
                        </div>
                    </div>
                </div>

                {/* ── Edit Load Limits Form ── */}
                <div className="card card-body space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Edit Load Limits</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                Changes apply immediately and are logged to the audit trail.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="form-group">
                            <label className="form-label">Maximum Teaching Units</label>
                            <input
                                type="number"
                                defaultValue={INSTRUCTOR.max_units}
                                min={0}
                                step={0.5}
                                placeholder="e.g. 21.0"
                            />
                            <span className="form-hint">Maximum credit units per semester (e.g., 21.0)</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Maximum Class Sections</label>
                            <input
                                type="number"
                                defaultValue={INSTRUCTOR.max_classes}
                                min={0}
                                placeholder="e.g. 6"
                            />
                            <span className="form-hint">Maximum number of sections per week</span>
                        </div>
                    </div>

                    {/* Warning if current load exceeds new limit (visual placeholder) */}
                    <div
                        className="rounded-lg border px-4 py-3 text-xs flex gap-2 items-start"
                        style={{ borderColor: "#f0a50055", background: "#fff8e6" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" style={{ color: "var(--color-warning)" }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p style={{ color: "#92620a" }}>
                            Reducing limits below the instructor's current load will not retroactively remove confirmed bookings, but new approvals will be blocked until load falls within the new limits.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button className="btn btn-primary">
                            Save Changes
                        </button>
                        <button className="btn btn-ghost">
                            Discard
                        </button>
                    </div>
                </div>

                {/* ── Confirmed Sections Table ── */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Confirmed Sections This Semester</h2>
                        <span className="badge badge-green">{currentClasses} sections · {currentUnits.toFixed(1)} units</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Section</th>
                                    <th>Units</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Confirmed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CONFIRMED_SECTIONS.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <p className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{s.course_code}</p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.course_title}</p>
                                        </td>
                                        <td className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            {s.section_name}
                                        </td>
                                        <td>
                                            <span className="badge badge-green">{s.units.toFixed(1)}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${DAY_COLOR[s.day_of_week] ?? "badge-gray"}`}>{s.day_of_week}</span>
                                        </td>
                                        <td className="text-xs whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                                            {formatTime(s.time_start)} – {formatTime(s.time_end)}
                                        </td>
                                        <td>
                                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}>
                                                {s.room}
                                            </span>
                                        </td>
                                        <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            {formatDateTime(s.confirmed_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Audit History ── */}
                <div className="card card-body space-y-4">
                    <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Load Limit Change History</h2>
                    {AUDIT_HISTORY.length === 0 ? (
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No changes recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            {AUDIT_HISTORY.map((a) => (
                                <div key={a.id} className="flex gap-3 items-start">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                        style={{ background: "var(--color-primary-light)" }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs" style={{ color: "var(--color-text)" }}>
                                            {a.details}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                            by <strong style={{ color: "var(--color-text-secondary)" }}>{a.actor}</strong> · {formatDateTime(a.performed_at)}
                                        </p>
                                    </div>
                                    <span className="badge badge-gray text-[10px]">{a.action}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Back Link ── */}
                <div>
                    <Link href="/admin/faculty-load" className="btn btn-ghost btn-sm">
                        ← Back to Faculty Load
                    </Link>
                </div>

            </div>
        </AppShell>
    );
}

// ─── Mini Stat ────────────────────────────────────────────────
function MiniStat({ label, value, note, highlight }: { label: string; value: string; note: string; highlight?: boolean }) {
    return (
        <div
            className="card card-body"
            style={highlight ? { borderColor: "var(--color-warning)", background: "#fff8e6" } : {}}
        >
            <p className="text-xs font-medium mb-1" style={{ color: highlight ? "#92620a" : "var(--color-text-secondary)" }}>{label}</p>
            <p className="text-2xl font-bold leading-none" style={{ color: highlight ? "var(--color-warning)" : "var(--color-text)" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: highlight ? "#92620a" : "var(--color-text-muted)", opacity: 0.8 }}>{note}</p>
        </div>
    );
}