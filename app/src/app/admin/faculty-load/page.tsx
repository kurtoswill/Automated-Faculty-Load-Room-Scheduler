"use client";

import AppShell from "@/components/Navbar";

// ─── Placeholder Data ─────────────────────────────────────────
const LOAD_LIMIT = {
    max_units: 21.0,
    max_classes: 6,
};

const CONFIRMED_SECTIONS = [
    {
        id: 1,
        course_code: "CS 3101",
        course_title: "Web Systems and Technologies",
        section_name: "BSCS 3-A",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        room: "CS-101",
        status: "Confirmed",
    },
    {
        id: 2,
        course_code: "CS 3102",
        course_title: "Algorithms and Complexity",
        section_name: "BSCS 3-B",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        room: "CS-102",
        status: "Confirmed",
    },
    {
        id: 3,
        course_code: "CS 4201",
        course_title: "Software Engineering",
        section_name: "BSCS 4-A",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        room: "CS-201",
        status: "Confirmed",
    },
    {
        id: 4,
        course_code: "IT 2101",
        course_title: "Database Management Systems",
        section_name: "BSIT 2-A",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Thursday",
        time_start: "08:00",
        time_end: "10:00",
        room: "CS-101",
        status: "Confirmed",
    },
    {
        id: 5,
        course_code: "CS 2101",
        course_title: "Data Structures",
        section_name: "BSCS 2-A",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Friday",
        time_start: "10:00",
        time_end: "12:00",
        room: "CS-103",
        status: "Confirmed",
    },
];

const PENDING_SECTIONS = [
    {
        id: 6,
        course_code: "CS 4202",
        course_title: "Capstone Project 1",
        section_name: "BSCS 4-B",
        semester: "2025-2026 1st Sem",
        units: 3.0,
        day_of_week: "Saturday",
        time_start: "08:00",
        time_end: "10:00",
        room: "Pending",
        status: "Pending",
    },
];

// ─── Helpers ──────────────────────────────────────────────────
function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const DAY_COLOR: Record<string, string> = {
    Monday: "bg-blue-50 text-blue-700",
    Tuesday: "bg-violet-50 text-violet-700",
    Wednesday: "bg-amber-50 text-amber-700",
    Thursday: "bg-rose-50 text-rose-700",
    Friday: "bg-teal-50 text-teal-700",
    Saturday: "bg-orange-50 text-orange-700",
};

export default function InstructorFacultyLoadPage() {
    const confirmedUnits = CONFIRMED_SECTIONS.reduce((s, x) => s + x.units, 0);
    const pendingUnits = PENDING_SECTIONS.reduce((s, x) => s + x.units, 0);
    const totalClasses = CONFIRMED_SECTIONS.length + PENDING_SECTIONS.length;
    const unitsPct = Math.min((confirmedUnits / LOAD_LIMIT.max_units) * 100, 100);
    const classesPct = Math.min((totalClasses / LOAD_LIMIT.max_classes) * 100, 100);

    const unitsRemaining = LOAD_LIMIT.max_units - confirmedUnits - pendingUnits;
    const classesRemaining = LOAD_LIMIT.max_classes - totalClasses;

    return (
        <AppShell role="instructor" userName="Juan Dela Cruz" pageTitle="My Faculty Load">
            <div className="animate-fade-in space-y-6 max-w-5xl">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                        Faculty Load Overview
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        2025–2026 • 1st Semester
                    </p>
                </div>

                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <SummaryCard label="Units Loaded" value={confirmedUnits.toFixed(1)} sub={`of ${LOAD_LIMIT.max_units} max`} color="primary" />
                    <SummaryCard label="Pending Units" value={pendingUnits.toFixed(1)} sub="awaiting approval" color="warning" />
                    <SummaryCard label="Classes" value={String(totalClasses)} sub={`of ${LOAD_LIMIT.max_classes} max`} color="info" />
                    <SummaryCard label="Units Available" value={unitsRemaining > 0 ? unitsRemaining.toFixed(1) : "0.0"} sub="remaining capacity" color={unitsRemaining <= 3 ? "error" : "success"} />
                </div>

                {/* ── Load Progress ── */}
                <div className="card card-body space-y-5">
                    <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        Load Utilization
                    </h2>

                    {/* Units bar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            <span>Teaching Units</span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                                {confirmedUnits.toFixed(1)} + {pendingUnits.toFixed(1)} pending / {LOAD_LIMIT.max_units}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                            <div className="h-full flex gap-0.5">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(confirmedUnits / LOAD_LIMIT.max_units) * 100}%`, background: "var(--color-primary-light)" }}
                                />
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(pendingUnits / LOAD_LIMIT.max_units) * 100}%`, background: "var(--color-accent)", opacity: 0.7 }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--color-primary-light)" }} />
                                Confirmed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--color-accent)" }} />
                                Pending
                            </span>
                        </div>
                    </div>

                    {/* Classes bar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            <span>Class Sections</span>
                            <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                                {totalClasses} / {LOAD_LIMIT.max_classes}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${classesPct}%`,
                                    background: classesPct >= 90 ? "var(--color-error)" : "var(--color-info)",
                                }}
                            />
                        </div>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {classesRemaining > 0 ? `${classesRemaining} more section${classesRemaining !== 1 ? "s" : ""} allowed` : "Class limit reached"}
                        </p>
                    </div>
                </div>

                {/* ── Confirmed Sections Table ── */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                            Confirmed Sections
                        </h2>
                        <span className="badge badge-green">{CONFIRMED_SECTIONS.length} sections</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {CONFIRMED_SECTIONS.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div>
                                                <p className="font-medium text-xs" style={{ color: "var(--color-text)" }}>{s.course_code}</p>
                                                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.course_title}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{s.section_name}</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-green">{s.units.toFixed(1)} units</span>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pending Sections Table ── */}
                {PENDING_SECTIONS.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                                Pending Sections
                            </h2>
                            <span className="badge badge-yellow">{PENDING_SECTIONS.length} pending</span>
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
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PENDING_SECTIONS.map((s) => (
                                        <tr key={s.id}>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-xs" style={{ color: "var(--color-text)" }}>{s.course_code}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.course_title}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{s.section_name}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-yellow">{s.units.toFixed(1)} units</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${DAY_COLOR[s.day_of_week] ?? "badge-gray"}`}>{s.day_of_week}</span>
                                            </td>
                                            <td className="text-xs whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                                                {formatTime(s.time_start)} – {formatTime(s.time_end)}
                                            </td>
                                            <td>
                                                <span className="badge badge-yellow">Awaiting Room</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Limit Info ── */}
                <div
                    className="rounded-xl border px-5 py-4 text-sm flex gap-3 items-start"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-primary-muted)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p style={{ color: "var(--color-primary-dark)" }}>
                        Your load limit is set to <strong>{LOAD_LIMIT.max_units} units</strong> and <strong>{LOAD_LIMIT.max_classes} classes</strong> per semester. Contact your Admin if you need adjustments.
                    </p>
                </div>

            </div>
        </AppShell>
    );
}

// ─── Summary Card ─────────────────────────────────────────────
type CardColor = "primary" | "warning" | "info" | "error" | "success";

const COLOR_MAP: Record<CardColor, { bg: string; text: string; label: string }> = {
    primary: { bg: "var(--color-primary-muted)", text: "var(--color-primary)", label: "var(--color-primary-dark)" },
    warning: { bg: "#fff8e6", text: "var(--color-warning)", label: "#92620a" },
    info: { bg: "#e8f0fe", text: "var(--color-info)", label: "#1557b0" },
    error: { bg: "var(--color-error-light)", text: "var(--color-error)", label: "#a52017" },
    success: { bg: "var(--color-primary-muted)", text: "var(--color-success)", label: "var(--color-primary-dark)" },
};

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: CardColor }) {
    const c = COLOR_MAP[color];
    return (
        <div className="card card-body" style={{ background: c.bg, border: "none" }}>
            <p className="text-xs font-medium mb-1" style={{ color: c.label }}>{label}</p>
            <p className="text-2xl font-bold leading-none" style={{ color: c.text }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: c.label, opacity: 0.7 }}>{sub}</p>
        </div>
    );
}