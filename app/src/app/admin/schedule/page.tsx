"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LayoutGrid,
    List,
    Download,
    Filter,
    X,
    Clock,
    Building2,
    User,
    BookOpen,
    Users,
} from "lucide-react";
import AppShell from "@/components/Navbar"; // adjust path if needed

// ─── Types ────────────────────────────────────────────────────
type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

interface ScheduleEntry {
    id: number;
    request_id: number;
    section: string;
    course_code: string;
    course_title: string;
    instructor: string;
    room: string;
    building: string;
    day: Day;
    time_start: string; // "HH:MM"
    time_end: string;
    expected_students: number;
    room_capacity: number;
    is_active: boolean;
    confirmed_at: string;
}

// ─── Placeholder Data ─────────────────────────────────────────
const SCHEDULE: ScheduleEntry[] = [
    {
        id: 1,
        request_id: 2,
        section: "BSCS 3-A",
        course_code: "CS 3101",
        course_title: "Web Systems and Technologies",
        instructor: "Dr. Maria Santos",
        room: "CS-101",
        building: "New Academic Building",
        day: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        expected_students: 35,
        room_capacity: 40,
        is_active: true,
        confirmed_at: "2025-08-01T10:00:00",
    },
    {
        id: 2,
        request_id: 3,
        section: "IT 2-B",
        course_code: "IT 2201",
        course_title: "Data Structures and Algorithms",
        instructor: "Prof. Juan dela Cruz",
        room: "LAB-3",
        building: "Technology Building",
        day: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        expected_students: 30,
        room_capacity: 35,
        is_active: true,
        confirmed_at: "2025-07-30T14:30:00",
    },
    {
        id: 3,
        request_id: 5,
        section: "BSIT 4-A",
        course_code: "IT 4401",
        course_title: "Capstone Project 1",
        instructor: "Dr. Ana Reyes",
        room: "AVR-2",
        building: "Main Building",
        day: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        expected_students: 40,
        room_capacity: 45,
        is_active: true,
        confirmed_at: "2025-07-29T09:00:00",
    },
    {
        id: 4,
        request_id: 6,
        section: "BSCS 1-C",
        course_code: "CS 1101",
        course_title: "Introduction to Computing",
        instructor: "Prof. Roberto Lim",
        room: "LEC-5",
        building: "Old Academic Building",
        day: "Thursday",
        time_start: "07:00",
        time_end: "09:00",
        expected_students: 42,
        room_capacity: 50,
        is_active: true,
        confirmed_at: "2025-07-28T08:00:00",
    },
    {
        id: 5,
        request_id: 7,
        section: "BSCS 3-B",
        course_code: "CS 3201",
        course_title: "Software Engineering",
        instructor: "Dr. Maria Santos",
        room: "CS-102",
        building: "New Academic Building",
        day: "Friday",
        time_start: "09:00",
        time_end: "11:00",
        expected_students: 28,
        room_capacity: 40,
        is_active: true,
        confirmed_at: "2025-07-27T16:00:00",
    },
    {
        id: 6,
        request_id: 8,
        section: "IT 3-A",
        course_code: "IT 3301",
        course_title: "Database Management Systems",
        instructor: "Prof. Carla Mendoza",
        room: "LAB-1",
        building: "Technology Building",
        day: "Saturday",
        time_start: "08:00",
        time_end: "11:00",
        expected_students: 38,
        room_capacity: 40,
        is_active: true,
        confirmed_at: "2025-08-02T07:45:00",
    },
    {
        id: 7,
        request_id: 9,
        section: "BSCS 2-A",
        course_code: "CS 2101",
        course_title: "Object-Oriented Programming",
        instructor: "Prof. Juan dela Cruz",
        room: "LAB-2",
        building: "Technology Building",
        day: "Monday",
        time_start: "13:00",
        time_end: "15:00",
        expected_students: 33,
        room_capacity: 35,
        is_active: true,
        confirmed_at: "2025-08-01T11:00:00",
    },
    {
        id: 8,
        request_id: 10,
        section: "IT 1-A",
        course_code: "IT 1101",
        course_title: "Computer Fundamentals",
        instructor: "Prof. Carla Mendoza",
        room: "LEC-3",
        building: "Old Academic Building",
        day: "Wednesday",
        time_start: "07:00",
        time_end: "09:00",
        expected_students: 45,
        room_capacity: 50,
        is_active: false,
        confirmed_at: "2025-07-25T08:00:00",
    },
    {
        id: 9,
        request_id: 11,
        section: "BSIT 3-B",
        course_code: "IT 3201",
        course_title: "Systems Analysis and Design",
        instructor: "Dr. Ana Reyes",
        room: "CS-103",
        building: "New Academic Building",
        day: "Thursday",
        time_start: "13:00",
        time_end: "15:00",
        expected_students: 36,
        room_capacity: 40,
        is_active: true,
        confirmed_at: "2025-08-02T09:00:00",
    },
    {
        id: 10,
        request_id: 12,
        section: "BSCS 4-A",
        course_code: "CS 4101",
        course_title: "Thesis Writing 1",
        instructor: "Dr. Maria Santos",
        room: "CS-101",
        building: "New Academic Building",
        day: "Friday",
        time_start: "13:00",
        time_end: "16:00",
        expected_students: 20,
        room_capacity: 40,
        is_active: true,
        confirmed_at: "2025-08-03T10:00:00",
    },
];

// ─── Constants ────────────────────────────────────────────────
const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT: Record<Day, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
};

const HOUR_START = 7;
const HOUR_END = 19;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

const PALETTES = [
    { bg: "#e8f5ee", border: "#22a050", text: "#145f2e" },
    { bg: "#fffbeb", border: "#f0a500", text: "#92400e" },
    { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
    { bg: "#fdf4ff", border: "#a855f7", text: "#6b21a8" },
    { bg: "#fff1f2", border: "#f43f5e", text: "#9f1239" },
];

const instructorColors: Record<string, (typeof PALETTES)[0]> = {};
let colorIdx = 0;
function getPalette(instructor: string) {
    if (!instructorColors[instructor]) {
        instructorColors[instructor] = PALETTES[colorIdx % PALETTES.length];
        colorIdx++;
    }
    return instructorColors[instructor];
}

// ─── Helpers ──────────────────────────────────────────────────
function toMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}
function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const CELL_HEIGHT = 56;
function topOffset(time_start: string) {
    const mins = toMinutes(time_start) - HOUR_START * 60;
    return (mins / 60) * CELL_HEIGHT;
}
function blockHeight(time_start: string, time_end: string) {
    const dur = toMinutes(time_end) - toMinutes(time_start);
    return Math.max((dur / 60) * CELL_HEIGHT - 4, 24);
}

// ─── Popover Card ─────────────────────────────────────────────
function EntryPopover({ entry, onClose }: { entry: ScheduleEntry; onClose: () => void }) {
    const p = getPalette(entry.instructor);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
        >
            <div className="card w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div
                    className="px-5 py-4 flex items-start justify-between gap-3"
                    style={{ background: p.bg, borderBottom: `2px solid ${p.border}` }}
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: p.border }}>
                            {entry.course_code}
                        </p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: p.text }}>
                            {entry.course_title}
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-sm !p-1" onClick={onClose} style={{ color: p.text }}>
                        <X size={14} />
                    </button>
                </div>

                <div className="card-body !p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <User size={14} style={{ color: "var(--color-text-muted)" }} />
                        <span>{entry.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={14} style={{ color: "var(--color-text-muted)" }} />
                        <span>{entry.section}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 size={14} style={{ color: "var(--color-text-muted)" }} />
                        <span>
                            {entry.room} · {entry.building}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} style={{ color: "var(--color-text-muted)" }} />
                        <span>
                            {entry.day} · {formatTime(entry.time_start)} – {formatTime(entry.time_end)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Users size={14} style={{ color: "var(--color-text-muted)" }} />
                        <span>
                            {entry.expected_students} / {entry.room_capacity} students
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                        <span className={`badge ${entry.is_active ? "badge-green" : "badge-gray"}`}>
                            {entry.is_active ? "Active" : "Released"}
                        </span>
                        <Link href={`/admin/requests/${entry.request_id}`} className="btn btn-outline btn-sm text-xs">
                            View Request
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Calendar Block ───────────────────────────────────────────
function CalendarBlock({ entry, onClick }: { entry: ScheduleEntry; onClick: () => void }) {
    const p = getPalette(entry.instructor);
    const top = topOffset(entry.time_start);
    const height = blockHeight(entry.time_start, entry.time_end);
    const short = height < 52;

    return (
        <button
            onClick={onClick}
            className="absolute left-1 right-1 rounded-md text-left px-2 py-1.5 overflow-hidden transition-all duration-150 hover:brightness-95 hover:-translate-y-px"
            style={{
                top: `${top}px`,
                height: `${height}px`,
                background: p.bg,
                borderLeft: `3px solid ${p.border}`,
                opacity: entry.is_active ? 1 : 0.45,
            }}
        >
            <p className="text-xs font-semibold leading-tight truncate" style={{ color: p.text }}>
                {entry.course_code}
            </p>
            {!short && (
                <>
                    <p className="text-xs leading-tight truncate mt-0.5" style={{ color: p.border }}>
                        {entry.room}
                    </p>
                    <p className="text-xs leading-tight truncate" style={{ color: p.text, opacity: 0.7 }}>
                        {entry.section}
                    </p>
                </>
            )}
        </button>
    );
}

// ─── Calendar View ────────────────────────────────────────────
function CalendarView({
    entries,
    onEntryClick,
}: {
    entries: ScheduleEntry[];
    onEntryClick: (e: ScheduleEntry) => void;
}) {
    const byDay: Record<Day, ScheduleEntry[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    };

    entries.forEach((e) => byDay[e.day].push(e));

    return (
        <div className="card overflow-hidden">
            <div
                className="grid border-b"
                style={{
                    gridTemplateColumns: "52px repeat(6, 1fr)",
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface-2)",
                }}
            >
                <div className="py-2.5" />
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="py-2.5 text-center border-l"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                            {DAY_SHORT[d]}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {byDay[d].length} class{byDay[d].length !== 1 ? "es" : ""}
                        </p>
                    </div>
                ))}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="grid" style={{ gridTemplateColumns: "52px repeat(6, 1fr)" }}>
                    <div className="relative" style={{ height: `${HOURS.length * CELL_HEIGHT}px` }}>
                        {HOURS.map((h) => (
                            <div
                                key={h}
                                className="absolute right-0 pr-2 flex items-start"
                                style={{
                                    top: `${(h - HOUR_START) * CELL_HEIGHT}px`,
                                    height: `${CELL_HEIGHT}px`,
                                }}
                            >
                                <span className="text-xs" style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
                                    {h % 12 || 12}
                                    {h < 12 ? "a" : "p"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {DAYS.map((d) => (
                        <div
                            key={d}
                            className="relative border-l"
                            style={{
                                height: `${HOURS.length * CELL_HEIGHT}px`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            {HOURS.map((h) => (
                                <div
                                    key={h}
                                    className="absolute left-0 right-0 border-t"
                                    style={{
                                        top: `${(h - HOUR_START) * CELL_HEIGHT}px`,
                                        borderColor: "var(--color-border)",
                                        opacity: 0.5,
                                    }}
                                />
                            ))}

                            {byDay[d].map((entry) => (
                                <CalendarBlock key={entry.id} entry={entry} onClick={() => onEntryClick(entry)} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── List View ────────────────────────────────────────────────
function ListView({
    entries,
    onEntryClick,
}: {
    entries: ScheduleEntry[];
    onEntryClick: (e: ScheduleEntry) => void;
}) {
    const grouped: Partial<Record<Day, ScheduleEntry[]>> = {};
    entries.forEach((e) => {
        if (!grouped[e.day]) grouped[e.day] = [];
        grouped[e.day]!.push(e);
    });

    return (
        <div className="space-y-4">
            {DAYS.filter((d) => grouped[d]?.length).map((d) => (
                <div key={d} className="card overflow-hidden">
                    <div
                        className="px-5 py-3 border-b flex items-center gap-2"
                        style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-primary-light)" }} />
                        <h3 className="text-sm font-semibold">{d}</h3>
                        <span className="badge badge-green ml-auto">
                            {grouped[d]!.length} class{grouped[d]!.length !== 1 ? "es" : ""}
                        </span>
                    </div>

                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Course / Section</th>
                                <th>Instructor</th>
                                <th>Room</th>
                                <th>Headcount</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {grouped[d]!
                                .sort((a, b) => toMinutes(a.time_start) - toMinutes(b.time_start))
                                .map((e) => {
                                    return (
                                        <tr key={e.id}>
                                            <td className="whitespace-nowrap text-sm font-medium">
                                                {formatTime(e.time_start)}
                                                <br />
                                                <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
                                                    – {formatTime(e.time_end)}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="text-sm font-medium">{e.course_code}</p>
                                                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                                                    {e.section}
                                                </p>
                                            </td>
                                            <td className="text-sm">{e.instructor}</td>
                                            <td>
                                                <p className="text-sm font-semibold">{e.room}</p>
                                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    {e.building}
                                                </p>
                                            </td>
                                            <td className="text-sm">
                                                {e.expected_students}
                                                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    /{e.room_capacity}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${e.is_active ? "badge-green" : "badge-gray"}`}>
                                                    {e.is_active ? "Active" : "Released"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm text-xs" onClick={() => onEntryClick(e)}>
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            ))}

            {!Object.keys(grouped).length && (
                <div className="card card-body text-center py-16" style={{ color: "var(--color-text-muted)" }}>
                    No confirmed schedules match your filters.
                </div>
            )}
        </div>
    );
}

// ─── Page Content ─────────────────────────────────────────────
function AdminScheduleContent() {
    const [view, setView] = useState<"calendar" | "list">("calendar");
    const [popover, setPopover] = useState<ScheduleEntry | null>(null);

    const [filterInstructor, setFilterInstructor] = useState("All");
    const [filterRoom, setFilterRoom] = useState("All");
    const [filterDay, setFilterDay] = useState<Day | "All">("All");
    const [filterStatus, setFilterStatus] = useState<"active" | "released" | "all">("active");
    const [showFilters, setShowFilters] = useState(false);

    const instructors = ["All", ...Array.from(new Set(SCHEDULE.map((s) => s.instructor))).sort()];
    const rooms = ["All", ...Array.from(new Set(SCHEDULE.map((s) => s.room))).sort()];

    const filtered = SCHEDULE.filter((e) => {
        if (filterInstructor !== "All" && e.instructor !== filterInstructor) return false;
        if (filterRoom !== "All" && e.room !== filterRoom) return false;
        if (filterDay !== "All" && e.day !== filterDay) return false;
        if (filterStatus === "active" && !e.is_active) return false;
        if (filterStatus === "released" && e.is_active) return false;
        return true;
    });

    const activeCount = SCHEDULE.filter((e) => e.is_active).length;
    const releasedCount = SCHEDULE.filter((e) => !e.is_active).length;
    const roomsInUse = new Set(SCHEDULE.filter((e) => e.is_active).map((e) => e.room)).size;

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                        Master Schedule
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        All confirmed room bookings for 2025–2026 1st Semester
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button className="btn btn-outline btn-sm gap-2">
                        <Download size={13} />
                        Export
                    </button>

                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
                        <button
                            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors duration-150"
                            style={{
                                background: view === "calendar" ? "var(--color-primary-light)" : "var(--color-surface)",
                                color: view === "calendar" ? "#fff" : "var(--color-text-secondary)",
                            }}
                            onClick={() => setView("calendar")}
                        >
                            <LayoutGrid size={13} />
                            Calendar
                        </button>
                        <button
                            className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 border-l"
                            style={{
                                borderColor: "var(--color-border)",
                                background: view === "list" ? "var(--color-primary-light)" : "var(--color-surface)",
                                color: view === "list" ? "#fff" : "var(--color-text-secondary)",
                            }}
                            onClick={() => setView("list")}
                        >
                            <List size={13} />
                            List
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: "Total Confirmed", value: SCHEDULE.length, color: "var(--color-text)" },
                    { label: "Active", value: activeCount, color: "var(--color-success)" },
                    { label: "Released", value: releasedCount, color: "var(--color-text-muted)" },
                    { label: "Rooms in Use", value: roomsInUse, color: "var(--color-info)" },
                ].map((c) => (
                    <div key={c.label} className="card card-body !p-4">
                        <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            {c.label}
                        </p>
                        <p className="text-2xl font-bold mt-1" style={{ color: c.color }}>
                            {c.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="card mb-4">
                <div className="card-body !p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: "var(--color-border)" }}>
                            {(["all", "active", "released"] as const).map((s, i) => (
                                <button
                                    key={s}
                                    className="px-3 py-1.5 font-medium capitalize transition-colors duration-150"
                                    style={{
                                        background: filterStatus === s ? "var(--color-primary-muted)" : "var(--color-surface)",
                                        color: filterStatus === s ? "var(--color-primary)" : "var(--color-text-secondary)",
                                        borderLeft: i > 0 ? `1px solid var(--color-border)` : undefined,
                                    }}
                                    onClick={() => setFilterStatus(s)}
                                >
                                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>

                        <button className="btn btn-outline btn-sm gap-2 ml-auto" onClick={() => setShowFilters((v) => !v)}>
                            <Filter size={13} />
                            Filters
                            {(filterInstructor !== "All" || filterRoom !== "All" || filterDay !== "All") && (
                                <span
                                    className="w-4 h-4 rounded-full text-white flex items-center justify-center"
                                    style={{ background: "var(--color-primary-light)", fontSize: "9px" }}
                                >
                                    !
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                            <div className="form-group min-w-[180px]">
                                <label className="form-label text-xs">Instructor</label>
                                <select value={filterInstructor} onChange={(e) => setFilterInstructor(e.target.value)}>
                                    {instructors.map((i) => (
                                        <option key={i}>{i}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group min-w-[150px]">
                                <label className="form-label text-xs">Room</label>
                                <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
                                    {rooms.map((r) => (
                                        <option key={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group min-w-[150px]">
                                <label className="form-label text-xs">Day</label>
                                <select value={filterDay} onChange={(e) => setFilterDay(e.target.value as Day | "All")}>
                                    <option value="All">All Days</option>
                                    {DAYS.map((d) => (
                                        <option key={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setFilterInstructor("All");
                                        setFilterRoom("All");
                                        setFilterDay("All");
                                        setFilterStatus("active");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                Showing {filtered.length} of {SCHEDULE.length} confirmed schedules
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
                {Object.entries(
                    SCHEDULE.reduce<Record<string, (typeof PALETTES)[0]>>((acc, s) => {
                        acc[s.instructor] = getPalette(s.instructor);
                        return acc;
                    }, {})
                ).map(([name, p]) => (
                    <div key={name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.border }} />
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {name.split(" ").slice(-1)[0]}
                        </span>
                    </div>
                ))}
            </div>

            {view === "calendar" ? (
                <CalendarView entries={filtered} onEntryClick={setPopover} />
            ) : (
                <ListView entries={filtered} onEntryClick={setPopover} />
            )}

            {popover && <EntryPopover entry={popover} onClose={() => setPopover(null)} />}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminSchedulePage() {
    return (
        <AppShell role="admin" userName="Admin User" pageTitle="Master Schedule">
            <AdminScheduleContent />
        </AppShell>
    );
}