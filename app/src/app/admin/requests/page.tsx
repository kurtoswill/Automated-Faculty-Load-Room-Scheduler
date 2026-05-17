"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    ChevronDown,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    Eye,
    ArrowUpDown,
    CalendarDays,
    Building2,
} from "lucide-react";

// Import the AppShell component from your Navbar file
import AppShell from "@/components/Navbar";

// ─── Types ───────────────────────────────────────────────────
type RequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | "Released";

interface RoomRequest {
    id: number;
    instructor: string;
    section: string;
    course: string;
    room: string;
    building: string;
    day: string;
    time_start: string;
    time_end: string;
    status: RequestStatus;
    submitted_at: string;
    expected_students: number;
    room_capacity: number;
}

// ─── Placeholder Data ─────────────────────────────────────────
const PLACEHOLDER_REQUESTS: RoomRequest[] = [
    {
        id: 1,
        instructor: "Dr. Maria Santos",
        section: "BSCS 3-A",
        course: "CS 3101 – Web Systems and Technologies",
        room: "CS-101",
        building: "New Academic Building",
        day: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        status: "Pending",
        submitted_at: "2025-08-01T09:15:00",
        expected_students: 35,
        room_capacity: 40,
    },
    {
        id: 2,
        instructor: "Prof. Juan dela Cruz",
        section: "IT 2-B",
        course: "IT 2201 – Data Structures and Algorithms",
        room: "LAB-3",
        building: "Technology Building",
        day: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        status: "Approved",
        submitted_at: "2025-07-30T14:00:00",
        expected_students: 30,
        room_capacity: 35,
    },
    {
        id: 3,
        instructor: "Dr. Ana Reyes",
        section: "BSIT 4-A",
        course: "IT 4401 – Capstone Project 1",
        room: "AVR-2",
        building: "Main Building",
        day: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        status: "Rejected",
        submitted_at: "2025-07-29T11:30:00",
        expected_students: 50,
        room_capacity: 45,
    },
    {
        id: 4,
        instructor: "Prof. Roberto Lim",
        section: "BSCS 1-C",
        course: "CS 1101 – Introduction to Computing",
        room: "LEC-5",
        building: "Old Academic Building",
        day: "Thursday",
        time_start: "07:00",
        time_end: "09:00",
        status: "Cancelled",
        submitted_at: "2025-07-28T08:00:00",
        expected_students: 42,
        room_capacity: 50,
    },
    {
        id: 5,
        instructor: "Dr. Maria Santos",
        section: "BSCS 3-B",
        course: "CS 3201 – Software Engineering",
        room: "CS-102",
        building: "New Academic Building",
        day: "Friday",
        time_start: "09:00",
        time_end: "11:00",
        status: "Released",
        submitted_at: "2025-07-27T16:00:00",
        expected_students: 28,
        room_capacity: 40,
    },
    {
        id: 6,
        instructor: "Prof. Carla Mendoza",
        section: "IT 3-A",
        course: "IT 3301 – Database Management Systems",
        room: "LAB-1",
        building: "Technology Building",
        day: "Saturday",
        time_start: "08:00",
        time_end: "11:00",
        status: "Pending",
        submitted_at: "2025-08-02T07:45:00",
        expected_students: 38,
        room_capacity: 40,
    },
];

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<
    RequestStatus,
    { label: string; badgeClass: string; icon: React.ReactNode }
> = {
    Pending: {
        label: "Pending",
        badgeClass: "badge badge-yellow",
        icon: <Clock size={11} />,
    },
    Approved: {
        label: "Approved",
        badgeClass: "badge badge-green",
        icon: <CheckCircle2 size={11} />,
    },
    Rejected: {
        label: "Rejected",
        badgeClass: "badge badge-red",
        icon: <XCircle size={11} />,
    },
    Cancelled: {
        label: "Cancelled",
        badgeClass: "badge badge-gray",
        icon: <AlertCircle size={11} />,
    },
    Released: {
        label: "Released",
        badgeClass: "badge badge-blue",
        icon: <RotateCcw size={11} />,
    },
};

function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const ALL_STATUSES: RequestStatus[] = ["Pending", "Approved", "Rejected", "Cancelled", "Released"];

// ─── Summary Cards ────────────────────────────────────────────
function SummaryCards({ requests }: { requests: RoomRequest[] }) {
    const counts = ALL_STATUSES.reduce(
        (acc, s) => ({ ...acc, [s]: requests.filter((r) => r.status === s).length }),
        {} as Record<RequestStatus, number>
    );

    const cards = [
        { label: "Total", value: requests.length, color: "text-text", bg: "bg-surface-2" },
        { label: "Pending", value: counts.Pending, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Approved", value: counts.Approved, color: "text-primary", bg: "bg-primary-muted" },
        { label: "Rejected", value: counts.Rejected, color: "text-error", bg: "bg-error-light" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {cards.map((c) => (
                <div key={c.label} className="card card-body !p-4">
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        {c.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminRequestsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
    const [dayFilter, setDayFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState<"submitted_at" | "instructor" | "status">("submitted_at");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const filtered = PLACEHOLDER_REQUESTS.filter((r) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            r.instructor.toLowerCase().includes(q) ||
            r.section.toLowerCase().includes(q) ||
            r.course.toLowerCase().includes(q) ||
            r.room.toLowerCase().includes(q);
        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        const matchDay = dayFilter === "All" || r.day === dayFilter;
        return matchSearch && matchStatus && matchDay;
    }).sort((a, b) => {
        let cmp = 0;
        if (sortField === "submitted_at") cmp = a.submitted_at.localeCompare(b.submitted_at);
        else if (sortField === "instructor") cmp = a.instructor.localeCompare(b.instructor);
        else cmp = a.status.localeCompare(b.status);
        return sortDir === "asc" ? cmp : -cmp;
    });

    function toggleSort(field: typeof sortField) {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    }

    return (
        <AppShell
            role="admin"
            userName="Dalisay Admin"
            pageTitle="Room Requests"
        >
            {/* Page Header is optional since AppShell sets the pageTitle, but kept for descriptions */}
            <div className="mb-6">
                <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                    Review and act on instructor room booking requests.
                </p>
            </div>

            {/* Summary */}
            <SummaryCards requests={PLACEHOLDER_REQUESTS} />

            {/* Toolbar */}
            <div className="card mb-4">
                <div className="card-body !p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="input-icon-wrapper flex-1">
                            <span className="input-icon-left">
                                <Search size={15} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search instructor, section, course, room…"
                                className="input-has-left-icon"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filter toggle */}
                        <button
                            className="btn btn-outline btn-sm gap-2"
                            onClick={() => setShowFilters((v) => !v)}
                        >
                            <Filter size={14} />
                            Filters
                            <ChevronDown
                                size={13}
                                className="transition-transform duration-200"
                                style={{ transform: showFilters ? "rotate(180deg)" : "none" }}
                            />
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div
                            className="flex flex-wrap gap-3 mt-3 pt-3 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            {/* Status */}
                            <div className="form-group min-w-[160px]">
                                <label className="form-label text-xs">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "All")}
                                >
                                    <option value="All">All Statuses</option>
                                    {ALL_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Day */}
                            <div className="form-group min-w-[160px]">
                                <label className="form-label text-xs">Day</label>
                                <select
                                    value={dayFilter}
                                    onChange={(e) => setDayFilter(e.target.value)}
                                >
                                    <option value="All">All Days</option>
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => { setStatusFilter("All"); setDayFilter("All"); setSearch(""); }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results count */}
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                Showing {filtered.length} of {PLACEHOLDER_REQUESTS.length} requests
            </p>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="table-base">
                    <thead>
                        <tr>
                            <th>
                                <button
                                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                                    onClick={() => toggleSort("instructor")}
                                >
                                    Instructor <ArrowUpDown size={11} />
                                </button>
                            </th>
                            <th>Section / Course</th>
                            <th>
                                <span className="flex items-center gap-1">
                                    <Building2 size={11} />
                                    Room
                                </span>
                            </th>
                            <th>
                                <span className="flex items-center gap-1">
                                    <CalendarDays size={11} />
                                    Schedule
                                </span>
                            </th>
                            <th>Headcount</th>
                            <th>
                                <button
                                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                                    onClick={() => toggleSort("status")}
                                >
                                    Status <ArrowUpDown size={11} />
                                </button>
                            </th>
                            <th>
                                <button
                                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                                    onClick={() => toggleSort("submitted_at")}
                                >
                                    Submitted <ArrowUpDown size={11} />
                                </button>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                    No requests match your filters.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((req) => {
                                const sc = STATUS_CONFIG[req.status];
                                const overCapacity = req.expected_students > req.room_capacity;
                                return (
                                    <tr key={req.id} className="animate-fade-in">
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                                                    style={{ backgroundColor: "var(--color-primary-light)" }}
                                                >
                                                    {req.instructor.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium whitespace-nowrap">
                                                    {req.instructor}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm font-medium">{req.section}</p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                                                {req.course}
                                            </p>
                                        </td>
                                        <td>
                                            <p className="text-sm font-semibold">{req.room}</p>
                                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                {req.building}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <p className="text-sm">{req.day}</p>
                                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                                {formatTime(req.time_start)} – {formatTime(req.time_end)}
                                            </p>
                                        </td>
                                        <td>
                                            <span
                                                className={`text-sm font-medium ${overCapacity ? "text-error" : ""}`}
                                            >
                                                {req.expected_students}
                                                <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
                                                    /{req.room_capacity}
                                                </span>
                                            </span>
                                            {overCapacity && (
                                                <p className="text-xs text-error mt-0.5">Over capacity</p>
                                            )}
                                        </td>
                                        <td>
                                            <span className={sc.badgeClass}>
                                                {sc.icon}
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            {formatDate(req.submitted_at)}
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/requests/${req.id}`}
                                                className="btn btn-ghost btn-sm gap-1.5"
                                            >
                                                <Eye size={13} />
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Page 1 of 1
                </p>
                <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" disabled>Previous</button>
                    <button className="btn btn-outline btn-sm" disabled>Next</button>
                </div>
            </div>
        </AppShell>
    );
}