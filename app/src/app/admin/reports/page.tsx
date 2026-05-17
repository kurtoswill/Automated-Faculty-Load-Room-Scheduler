"use client";

import { useState } from "react";
import AppShell from "@/components/Navbar"; // adjust path if needed
import {
    BarChart2,
    Download,
    FileText,
    Users,
    Building2,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────
type ReportSection =
    | "overview"
    | "requests"
    | "faculty-load"
    | "room-utilization"
    | "sections";

// ─── Placeholder Data ─────────────────────────────────────────

// KPI
const KPI = {
    totalUsers: 184,
    activeInstructors: 28,
    activeStudents: 152,
    totalRooms: 34,
    availableRooms: 30,
    totalSections: 62,
    confirmedSections: 47,
    pendingRequests: 8,
    approvedRequests: 47,
    rejectedRequests: 5,
    cancelledRequests: 3,
    releasedBookings: 4,
    totalRequests: 67,
    semester: "2025–2026 1st Sem",
};

// Requests by status (pie)
const REQUEST_STATUS_DATA = [
    { name: "Approved", value: KPI.approvedRequests, color: "#22a050" },
    { name: "Pending", value: KPI.pendingRequests, color: "#f0a500" },
    { name: "Rejected", value: KPI.rejectedRequests, color: "#d93025" },
    { name: "Cancelled", value: KPI.cancelledRequests, color: "#9ba3b2" },
    { name: "Released", value: KPI.releasedBookings, color: "#1a73e8" },
];

// Requests per week (line)
const WEEKLY_REQUESTS = [
    { week: "Jul W1", submitted: 6, approved: 5, rejected: 1 },
    { week: "Jul W2", submitted: 9, approved: 7, rejected: 1 },
    { week: "Jul W3", submitted: 14, approved: 11, rejected: 2 },
    { week: "Jul W4", submitted: 18, approved: 14, rejected: 1 },
    { week: "Aug W1", submitted: 12, approved: 8, rejected: 0 },
    { week: "Aug W2", submitted: 8, approved: 2, rejected: 0 },
];

// Faculty load (bar)
const FACULTY_LOAD_DATA = [
    { name: "Dr. Santos", units: 18, max: 21, classes: 6, maxClasses: 8 },
    { name: "Prof. dela Cruz", units: 15, max: 21, classes: 5, maxClasses: 8 },
    { name: "Dr. Reyes", units: 12, max: 21, classes: 4, maxClasses: 8 },
    { name: "Prof. Lim", units: 21, max: 21, classes: 7, maxClasses: 8 },
    { name: "Prof. Mendoza", units: 9, max: 21, classes: 3, maxClasses: 8 },
    { name: "Dr. Garcia", units: 6, max: 21, classes: 2, maxClasses: 8 },
];

// Room utilization (bar)
const ROOM_UTIL_DATA = [
    { room: "CS-101", bookings: 8, type: "Lecture" },
    { room: "LAB-1", bookings: 6, type: "Laboratory" },
    { room: "LAB-3", bookings: 5, type: "Laboratory" },
    { room: "AVR-2", bookings: 4, type: "AVR" },
    { room: "CS-102", bookings: 7, type: "Lecture" },
    { room: "LEC-5", bookings: 3, type: "Lecture" },
    { room: "LEC-3", bookings: 2, type: "Lecture" },
    { room: "CS-103", bookings: 5, type: "Lecture" },
];

// Sections table
interface SectionRow {
    id: number;
    course_code: string;
    course_title: string;
    section_name: string;
    instructor: string;
    room: string;
    day: string;
    time_start: string;
    time_end: string;
    expected_students: number;
    room_capacity: number;
    status: "Confirmed" | "Pending" | "Draft" | "Cancelled";
}

const SECTIONS_DATA: SectionRow[] = [
    {
        id: 1,
        course_code: "CS 3101",
        course_title: "Web Systems and Technologies",
        section_name: "BSCS 3-A",
        instructor: "Dr. Maria Santos",
        room: "CS-101",
        day: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        expected_students: 35,
        room_capacity: 40,
        status: "Confirmed",
    },
    {
        id: 2,
        course_code: "IT 2201",
        course_title: "Data Structures and Algorithms",
        section_name: "IT 2-B",
        instructor: "Prof. Juan dela Cruz",
        room: "LAB-3",
        day: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        expected_students: 30,
        room_capacity: 35,
        status: "Confirmed",
    },
    {
        id: 3,
        course_code: "IT 4401",
        course_title: "Capstone Project 1",
        section_name: "BSIT 4-A",
        instructor: "Dr. Ana Reyes",
        room: "AVR-2",
        day: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        expected_students: 40,
        room_capacity: 45,
        status: "Confirmed",
    },
    {
        id: 4,
        course_code: "CS 1101",
        course_title: "Introduction to Computing",
        section_name: "BSCS 1-C",
        instructor: "Prof. Roberto Lim",
        room: "LEC-5",
        day: "Thursday",
        time_start: "07:00",
        time_end: "09:00",
        expected_students: 42,
        room_capacity: 50,
        status: "Confirmed",
    },
    {
        id: 5,
        course_code: "CS 3201",
        course_title: "Software Engineering",
        section_name: "BSCS 3-B",
        instructor: "Dr. Maria Santos",
        room: "CS-102",
        day: "Friday",
        time_start: "09:00",
        time_end: "11:00",
        expected_students: 28,
        room_capacity: 40,
        status: "Pending",
    },
    {
        id: 6,
        course_code: "IT 3301",
        course_title: "Database Management Systems",
        section_name: "IT 3-A",
        instructor: "Prof. Carla Mendoza",
        room: "LAB-1",
        day: "Saturday",
        time_start: "08:00",
        time_end: "11:00",
        expected_students: 38,
        room_capacity: 40,
        status: "Confirmed",
    },
    {
        id: 7,
        course_code: "CS 2101",
        course_title: "Object-Oriented Programming",
        section_name: "BSCS 2-A",
        instructor: "Prof. Juan dela Cruz",
        room: "LAB-2",
        day: "Monday",
        time_start: "13:00",
        time_end: "15:00",
        expected_students: 33,
        room_capacity: 35,
        status: "Confirmed",
    },
    {
        id: 8,
        course_code: "IT 1101",
        course_title: "Computer Fundamentals",
        section_name: "IT 1-A",
        instructor: "Prof. Carla Mendoza",
        room: "LEC-3",
        day: "Wednesday",
        time_start: "07:00",
        time_end: "09:00",
        expected_students: 45,
        room_capacity: 50,
        status: "Cancelled",
    },
];

// ─── Helpers ──────────────────────────────────────────────────
function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const SECTION_STATUS_CLASS: Record<SectionRow["status"], string> = {
    Confirmed: "badge-green",
    Pending: "badge-yellow",
    Draft: "badge-gray",
    Cancelled: "badge-red",
};

function KpiCard({
    label,
    value,
    sub,
    icon,
    accent,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    accent?: string;
}) {
    return (
        <div className="card card-body !p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    {label}
                </p>
                <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                        background: accent ?? "var(--color-primary-muted)",
                        color: accent ? "#fff" : "var(--color-primary)",
                    }}
                >
                    {icon}
                </span>
            </div>
            <div>
                <p className="text-3xl font-bold leading-none" style={{ color: "var(--color-text)" }}>
                    {value}
                </p>
                {sub && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                {title}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {description}
            </p>
        </div>
    );
}

const CHART_TOOLTIP_STYLE = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "Poppins, sans-serif",
    color: "var(--color-text)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
};

// ─── Report Sections ──────────────────────────────────────────

function OverviewSection() {
    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title="Platform Overview" description={`Snapshot for ${KPI.semester}`} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <KpiCard
                        label="Total Users"
                        value={KPI.totalUsers}
                        sub={`${KPI.activeInstructors} instructors · ${KPI.activeStudents} students`}
                        icon={<Users size={15} />}
                    />
                    <KpiCard
                        label="Total Rooms"
                        value={KPI.totalRooms}
                        sub={`${KPI.availableRooms} available`}
                        icon={<Building2 size={15} />}
                    />
                    <KpiCard
                        label="Total Sections"
                        value={KPI.totalSections}
                        sub={`${KPI.confirmedSections} confirmed`}
                        icon={<BookOpen size={15} />}
                    />
                    <KpiCard
                        label="Total Requests"
                        value={KPI.totalRequests}
                        sub={`${KPI.pendingRequests} pending review`}
                        icon={<FileText size={15} />}
                    />
                </div>
            </div>

            <div>
                <SectionHeader
                    title="Request Breakdown"
                    description="Distribution of all room requests by outcome"
                />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                    {REQUEST_STATUS_DATA.map((s) => (
                        <div key={s.name} className="card card-body !p-4 text-center">
                            <p className="text-2xl font-bold" style={{ color: s.color }}>
                                {s.value}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                {s.name}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card card-body !p-5">
                        <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
                            Requests by Status
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={REQUEST_STATUS_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {REQUEST_STATUS_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card card-body !p-5">
                        <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
                            Weekly Request Volume
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={WEEKLY_REQUESTS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                                <YAxis tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }}
                                />
                                <Line type="monotone" dataKey="submitted" stroke="#1a73e8" strokeWidth={2} dot={false} name="Submitted" />
                                <Line type="monotone" dataKey="approved" stroke="#22a050" strokeWidth={2} dot={false} name="Approved" />
                                <Line type="monotone" dataKey="rejected" stroke="#d93025" strokeWidth={2} dot={false} name="Rejected" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequestsSection() {
    return (
        <div className="space-y-5">
            <SectionHeader
                title="Room Requests Report"
                description="Full log of all request records across all instructors and sections"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label="Approved" value={KPI.approvedRequests} icon={<CheckCircle2 size={14} />} accent="#22a050" />
                <KpiCard label="Pending" value={KPI.pendingRequests} icon={<Clock size={14} />} accent="#f0a500" />
                <KpiCard label="Rejected" value={KPI.rejectedRequests} icon={<XCircle size={14} />} accent="#d93025" />
                <KpiCard label="Released" value={KPI.releasedBookings} icon={<RefreshCw size={14} />} accent="#1a73e8" />
            </div>

            <div className="card card-body !p-5">
                <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
                    Submissions vs. Outcomes — by Week
                </p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={WEEKLY_REQUESTS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <YAxis tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }} />
                        <Bar dataKey="submitted" fill="#1a73e8" name="Submitted" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="approved" fill="#22a050" name="Approved" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="rejected" fill="#d93025" name="Rejected" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card overflow-x-auto">
                <div
                    className="px-5 py-3 border-b flex items-center gap-2"
                    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                >
                    <p className="text-sm font-semibold">All Requests</p>
                    <span className="badge badge-gray ml-auto">{KPI.totalRequests} total</span>
                </div>
                <table className="table-base">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Instructor</th>
                            <th>Section</th>
                            <th>Room</th>
                            <th>Day / Time</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            {
                                id: 1,
                                instructor: "Dr. Maria Santos",
                                section: "BSCS 3-A",
                                room: "CS-101",
                                day: "Monday",
                                time: "08:00–10:00",
                                status: "Approved",
                                submitted: "Aug 1, 2025",
                            },
                            {
                                id: 2,
                                instructor: "Prof. Juan dela Cruz",
                                section: "IT 2-B",
                                room: "LAB-3",
                                day: "Tuesday",
                                time: "10:00–12:00",
                                status: "Approved",
                                submitted: "Jul 30, 2025",
                            },
                            {
                                id: 3,
                                instructor: "Dr. Ana Reyes",
                                section: "BSIT 4-A",
                                room: "AVR-2",
                                day: "Wednesday",
                                time: "13:00–15:00",
                                status: "Rejected",
                                submitted: "Jul 29, 2025",
                            },
                            {
                                id: 4,
                                instructor: "Prof. Roberto Lim",
                                section: "BSCS 1-C",
                                room: "LEC-5",
                                day: "Thursday",
                                time: "07:00–09:00",
                                status: "Cancelled",
                                submitted: "Jul 28, 2025",
                            },
                            {
                                id: 5,
                                instructor: "Dr. Maria Santos",
                                section: "BSCS 3-B",
                                room: "CS-102",
                                day: "Friday",
                                time: "09:00–11:00",
                                status: "Released",
                                submitted: "Jul 27, 2025",
                            },
                            {
                                id: 6,
                                instructor: "Prof. Carla Mendoza",
                                section: "IT 3-A",
                                room: "LAB-1",
                                day: "Saturday",
                                time: "08:00–11:00",
                                status: "Pending",
                                submitted: "Aug 2, 2025",
                            },
                        ].map((r) => (
                            <tr key={r.id}>
                                <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    #{r.id}
                                </td>
                                <td className="text-sm font-medium">{r.instructor}</td>
                                <td className="text-sm">{r.section}</td>
                                <td className="text-sm font-semibold">{r.room}</td>
                                <td className="text-sm whitespace-nowrap">
                                    {r.day}
                                    <br />
                                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {r.time}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`badge ${r.status === "Approved"
                                                ? "badge-green"
                                                : r.status === "Pending"
                                                    ? "badge-yellow"
                                                    : r.status === "Rejected"
                                                        ? "badge-red"
                                                        : r.status === "Released"
                                                            ? "badge-blue"
                                                            : "badge-gray"
                                            }`}
                                    >
                                        {r.status}
                                    </span>
                                </td>
                                <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    {r.submitted}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FacultyLoadSection() {
    return (
        <div className="space-y-5">
            <SectionHeader
                title="Faculty Load Report"
                description="Teaching unit and class count usage per instructor vs. configured limits"
            />

            <div className="card card-body !p-5">
                <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
                    Units Used vs. Maximum
                </p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={FACULTY_LOAD_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <YAxis tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }} />
                        <Bar dataKey="units" fill="#22a050" name="Units Used" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="max" fill="#e8f5ee" name="Max Units" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card overflow-x-auto">
                <div
                    className="px-5 py-3 border-b"
                    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                >
                    <p className="text-sm font-semibold">Instructor Load Summary</p>
                </div>
                <table className="table-base">
                    <thead>
                        <tr>
                            <th>Instructor</th>
                            <th>Units Used</th>
                            <th>Max Units</th>
                            <th>Load %</th>
                            <th>Classes</th>
                            <th>Max Classes</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {FACULTY_LOAD_DATA.map((f) => {
                            const pct = Math.round((f.units / f.max) * 100);
                            const atMax = f.units >= f.max;

                            return (
                                <tr key={f.name}>
                                    <td className="text-sm font-medium">{f.name}</td>
                                    <td className="text-sm">{f.units}</td>
                                    <td className="text-sm">{f.max}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-1.5 rounded-full overflow-hidden flex-1"
                                                style={{ background: "var(--color-surface-2)", minWidth: 60 }}
                                            >
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: atMax ? "var(--color-error)" : "var(--color-primary-light)",
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-semibold"
                                                style={{ color: atMax ? "var(--color-error)" : "var(--color-text)" }}
                                            >
                                                {pct}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-sm">{f.classes}</td>
                                    <td className="text-sm">{f.maxClasses}</td>
                                    <td>
                                        <span className={`badge ${atMax ? "badge-yellow" : "badge-green"}`}>
                                            {atMax ? "At Limit" : "Within Limit"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RoomUtilizationSection() {
    return (
        <div className="space-y-5">
            <SectionHeader
                title="Room Utilization Report"
                description="Booking frequency and occupancy rate per room"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label="Total Rooms" value={KPI.totalRooms} icon={<Building2 size={14} />} />
                <KpiCard label="Available" value={KPI.availableRooms} icon={<CheckCircle2 size={14} />} accent="#22a050" />
                <KpiCard
                    label="Unavailable"
                    value={KPI.totalRooms - KPI.availableRooms}
                    icon={<AlertTriangle size={14} />}
                    accent="#f0a500"
                />
                <KpiCard label="Booked Slots" value={KPI.approvedRequests} icon={<TrendingUp size={14} />} />
            </div>

            <div className="card card-body !p-5">
                <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
                    Bookings per Room
                </p>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={ROOM_UTIL_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="room" tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <YAxis tick={{ fontSize: 10, fontFamily: "Poppins, sans-serif" }} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Bar dataKey="bookings" name="Confirmed Bookings" radius={[4, 4, 0, 0]}>
                            {ROOM_UTIL_DATA.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.bookings >= 7 ? "#22a050" : entry.bookings >= 4 ? "#1a73e8" : "#9ba3b2"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3">
                    {[
                        { label: "High (7+)", color: "#22a050" },
                        { label: "Medium (4–6)", color: "#1a73e8" },
                        { label: "Low (<4)", color: "#9ba3b2" },
                    ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                {l.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card overflow-x-auto">
                <div
                    className="px-5 py-3 border-b"
                    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                >
                    <p className="text-sm font-semibold">Room-by-Room Summary</p>
                </div>
                <table className="table-base">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Type</th>
                            <th>Confirmed Bookings</th>
                            <th>Demand Level</th>
                            <th>Availability</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROOM_UTIL_DATA.map((r) => (
                            <tr key={r.room}>
                                <td className="text-sm font-semibold">{r.room}</td>
                                <td className="text-sm">{r.type}</td>
                                <td className="text-sm">{r.bookings}</td>
                                <td>
                                    <span
                                        className={`badge ${r.bookings >= 7 ? "badge-green" : r.bookings >= 4 ? "badge-blue" : "badge-gray"
                                            }`}
                                    >
                                        {r.bookings >= 7 ? "High" : r.bookings >= 4 ? "Medium" : "Low"}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge badge-green">Available</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SectionsSection() {
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const filtered =
        statusFilter === "All"
            ? SECTIONS_DATA
            : SECTIONS_DATA.filter((s) => s.status === statusFilter);

    return (
        <div className="space-y-5">
            <SectionHeader
                title="Sections Report"
                description="All class sections for the current semester with scheduling status"
            />

            <div className="flex flex-wrap gap-2">
                {["All", "Confirmed", "Pending", "Draft", "Cancelled"].map((s) => (
                    <button
                        key={s}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 border"
                        style={{
                            background: statusFilter === s ? "var(--color-primary-light)" : "var(--color-surface)",
                            color: statusFilter === s ? "#fff" : "var(--color-text-secondary)",
                            borderColor: statusFilter === s ? "var(--color-primary-light)" : "var(--color-border)",
                        }}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="card overflow-x-auto">
                <table className="table-base">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Section</th>
                            <th>Instructor</th>
                            <th>Room</th>
                            <th>Day / Time</th>
                            <th>Headcount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    <p className="text-sm font-semibold">{s.course_code}</p>
                                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                        {s.course_title}
                                    </p>
                                </td>
                                <td className="text-sm">{s.section_name}</td>
                                <td className="text-sm">{s.instructor}</td>
                                <td className="text-sm font-semibold">{s.room}</td>
                                <td className="text-sm whitespace-nowrap">
                                    {s.day}
                                    <br />
                                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {formatTime(s.time_start)} – {formatTime(s.time_end)}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-sm">
                                        {s.expected_students}
                                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            /{s.room_capacity}
                                        </span>
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${SECTION_STATUS_CLASS[s.status]}`}>{s.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Page Content ────────────────────────────────────────
function AdminReportsContent() {
    const [activeSection, setActiveSection] = useState<ReportSection>("overview");
    const [semester, setSemester] = useState("2025-2026-1");

    const REPORT_TABS: { id: ReportSection; label: string; icon: React.ReactNode }[] = [
        { id: "overview", label: "Overview", icon: <BarChart2 size={14} /> },
        { id: "requests", label: "Requests", icon: <FileText size={14} /> },
        { id: "faculty-load", label: "Faculty Load", icon: <Users size={14} /> },
        { id: "room-utilization", label: "Room Utilization", icon: <Building2 size={14} /> },
        { id: "sections", label: "Sections", icon: <BookOpen size={14} /> },
    ];

    const semesterLabel =
        semester === "2025-2026-1"
            ? "2025–2026 1st Sem"
            : semester === "2024-2025-2"
                ? "2024–2025 2nd Sem"
                : "2024–2025 1st Sem";

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                        Reports
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        Data aggregated across all modules — {semesterLabel}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="pr-8 text-xs"
                            style={{ paddingRight: "2rem" }}
                        >
                            <option value="2025-2026-1">2025–2026 1st Sem</option>
                            <option value="2024-2025-2">2024–2025 2nd Sem</option>
                            <option value="2024-2025-1">2024–2025 1st Sem</option>
                        </select>
                    </div>

                    <button className="btn btn-primary btn-sm gap-2">
                        <Download size={13} />
                        Export PDF
                    </button>
                </div>
            </div>

            <div
                className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
                style={{ background: "var(--color-surface-2)" }}
            >
                {REPORT_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150"
                        style={
                            activeSection === tab.id
                                ? {
                                    background: "var(--color-surface)",
                                    color: "var(--color-primary)",
                                    boxShadow: "var(--shadow-sm)",
                                }
                                : { color: "var(--color-text-secondary)" }
                        }
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-in">
                {activeSection === "overview" && <OverviewSection />}
                {activeSection === "requests" && <RequestsSection />}
                {activeSection === "faculty-load" && <FacultyLoadSection />}
                {activeSection === "room-utilization" && <RoomUtilizationSection />}
                {activeSection === "sections" && <SectionsSection />}
            </div>
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminReportsPage() {
    return (
        <AppShell role="admin" userName="Admin User" pageTitle="Reports">
            <AdminReportsContent />
        </AppShell>
    );
}