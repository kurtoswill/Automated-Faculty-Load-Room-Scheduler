"use client";

import { useState } from "react";
// import { useParams } from "next/navigation"; // uncomment when integrating
// import AdminShell from "@/components/AdminShell";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomType {
    id: number;
    name: string;
}

interface Room {
    id: number;
    room_number: string;
    building: string;
    capacity: number;
    type_id: number;
    type_name: string;
    is_available: boolean;
    created_at: string;
}

interface ConfirmedSchedule {
    id: number;
    section_name: string;
    course_code: string;
    course_title: string;
    instructor_name: string;
    day_of_week: string;
    time_start: string;
    time_end: string;
    is_active: boolean;
    confirmed_at: string;
}

interface FormData {
    room_number: string;
    building: string;
    capacity: string;
    type_id: string;
    is_available: boolean;
}

interface FormErrors {
    room_number?: string;
    building?: string;
    capacity?: string;
    type_id?: string;
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: GET /api/rooms/:id?include=type&include=schedule

const ROOM_TYPES: RoomType[] = [
    { id: 1, name: "Lecture" },
    { id: 2, name: "Laboratory" },
    { id: 3, name: "Seminar" },
    { id: 4, name: "AVR" },
    { id: 5, name: "Gymnasium" },
];

const BUILDINGS = [
    "New Academic Building",
    "Science Complex",
    "Main Building",
    "Faculty Center",
    "Sports Complex",
    "Engineering Building",
    "Library Building",
];

// Simulate fetched room — in real usage: const params = useParams(); fetch(`/api/rooms/${params.id}`)
const ROOM: Room = {
    id: 1,
    room_number: "CS-101",
    building: "New Academic Building",
    capacity: 50,
    type_id: 1,
    type_name: "Lecture",
    is_available: true,
    created_at: "2025-06-01",
};

const ROOM_SCHEDULE: ConfirmedSchedule[] = [
    {
        id: 1,
        section_name: "BSCS 3-A",
        course_code: "CS 3101",
        course_title: "Web Systems and Technologies",
        instructor_name: "Dr. Maria Santos",
        day_of_week: "Monday",
        time_start: "08:00",
        time_end: "10:00",
        is_active: true,
        confirmed_at: "2025-06-10",
    },
    {
        id: 2,
        section_name: "BSCS 2-A",
        course_code: "CS 2201",
        course_title: "Object-Oriented Programming",
        instructor_name: "Prof. Carlos Lim",
        day_of_week: "Tuesday",
        time_start: "10:00",
        time_end: "12:00",
        is_active: true,
        confirmed_at: "2025-06-11",
    },
    {
        id: 3,
        section_name: "BSCS 4-A",
        course_code: "CS 4101",
        course_title: "Software Engineering",
        instructor_name: "Dr. Anna Reyes",
        day_of_week: "Wednesday",
        time_start: "13:00",
        time_end: "15:00",
        is_active: false,
        confirmed_at: "2025-06-12",
    },
];

const DAY_COLORS: Record<string, string> = {
    Monday: "#3b82f6",
    Tuesday: "#8b5cf6",
    Wednesday: "#f0a500",
    Thursday: "#22a050",
    Friday: "#d93025",
    Saturday: "#0ea5e9",
};

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.room_number.trim()) errors.room_number = "Room number is required.";
    if (!data.building.trim()) errors.building = "Building is required.";
    if (!data.type_id) errors.type_id = "Select a room type.";
    const cap = parseInt(data.capacity);
    if (!data.capacity || isNaN(cap) || cap < 1) errors.capacity = "Enter a valid capacity (minimum 1).";
    if (cap > 1000) errors.capacity = "Capacity cannot exceed 1,000.";
    return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminRoomDetailPage() {
    // const { id } = useParams(); // uncomment in real app

    const [activeTab, setActiveTab] = useState<"details" | "schedule">("details");
    const [form, setForm] = useState<FormData>({
        room_number: ROOM.room_number,
        building: ROOM.building,
        capacity: String(ROOM.capacity),
        type_id: String(ROOM.type_id),
        is_available: ROOM.is_available,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);

    function handleChange(field: keyof FormData, value: string | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        setSaveSuccess(false);
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    async function handleSave() {
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setIsSaving(true);

        // TODO: PATCH /api/rooms/:id
        // await fetch(`/api/rooms/${ROOM.id}`, {
        //   method: "PATCH",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     room_number:  form.room_number.toUpperCase(),
        //     building:     form.building,
        //     capacity:     parseInt(form.capacity),
        //     type_id:      parseInt(form.type_id),
        //     is_available: form.is_available,
        //   }),
        // });

        await new Promise((r) => setTimeout(r, 700));
        setIsSaving(false);
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }

    const activeBookings = ROOM_SCHEDULE.filter((s) => s.is_active).length;
    const selectedType = ROOM_TYPES.find((t) => t.id === parseInt(form.type_id));

    return (
        <div className="page-shell" style={{ paddingLeft: "240px", paddingTop: "60px" }}>
            <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <a href="/admin/dashboard" className="text-xs" style={{ color: "var(--color-text-muted)" }}>Dashboard</a>
                            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>/</span>
                            <a href="/admin/rooms" className="text-xs" style={{ color: "var(--color-text-muted)" }}>Rooms</a>
                            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>/</span>
                            <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{ROOM.room_number}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>{ROOM.room_number}</h1>
                            {ROOM.is_available
                                ? <span className="badge badge-green"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Available</span>
                                : <span className="badge badge-red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Maintenance</span>}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {ROOM.building} · {ROOM.type_name} · {ROOM.capacity} pax
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDisableModal(true)}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            {ROOM.is_available ? "Disable Room" : "Enable Room"}
                        </button>
                    </div>
                </div>

                {/* ── Stat chips ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Room Type", value: ROOM.type_name, accent: "#1a73e8" },
                        { label: "Capacity", value: `${ROOM.capacity} pax`, accent: "#1a7a3c" },
                        { label: "Active Bookings", value: String(activeBookings), accent: "#f0a500" },
                        { label: "Total Scheduled", value: String(ROOM_SCHEDULE.length), accent: "#8b5cf6" },
                    ].map((s) => (
                        <div key={s.label} className="card card-body py-3 px-4 animate-fade-in">
                            <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
                            <p className="text-base font-semibold" style={{ color: s.accent }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-0.5 mb-4 p-1 rounded-lg w-fit" style={{ backgroundColor: "var(--color-surface-2)" }}>
                    {(["details", "schedule"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
                            style={{
                                backgroundColor: activeTab === tab ? "var(--color-surface)" : "transparent",
                                color: activeTab === tab ? "var(--color-text)" : "var(--color-text-muted)",
                                boxShadow: activeTab === tab ? "var(--shadow-xs)" : "none",
                            }}
                        >
                            {tab === "schedule" ? `Schedule (${ROOM_SCHEDULE.length})` : "Room Details"}
                        </button>
                    ))}
                </div>

                {/* ── TAB: Details ── */}
                {activeTab === "details" && (
                    <div className="card card-body animate-fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Edit Room Information</h2>
                            {isDirty && (
                                <span className="badge badge-yellow animate-fade-in">Unsaved changes</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            {/* Room Number */}
                            <div className="form-group">
                                <label className="form-label">Room Number <span style={{ color: "var(--color-error)" }}>*</span></label>
                                <input
                                    type="text"
                                    value={form.room_number}
                                    onChange={(e) => handleChange("room_number", e.target.value)}
                                    style={errors.room_number ? { borderColor: "var(--color-error)" } : {}}
                                />
                                {errors.room_number
                                    ? <span className="form-error">{errors.room_number}</span>
                                    : <span className="form-hint">Official room identifier (e.g., CS-101)</span>}
                            </div>

                            {/* Building */}
                            <div className="form-group">
                                <label className="form-label">Building <span style={{ color: "var(--color-error)" }}>*</span></label>
                                <select
                                    value={form.building}
                                    onChange={(e) => handleChange("building", e.target.value)}
                                    style={errors.building ? { borderColor: "var(--color-error)" } : {}}
                                >
                                    <option value="">Select a building…</option>
                                    {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                                {errors.building && <span className="form-error">{errors.building}</span>}
                            </div>

                            {/* Capacity */}
                            <div className="form-group">
                                <label className="form-label">Capacity <span style={{ color: "var(--color-error)" }}>*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1}
                                        max={1000}
                                        value={form.capacity}
                                        onChange={(e) => handleChange("capacity", e.target.value)}
                                        style={errors.capacity ? { borderColor: "var(--color-error)", paddingRight: "3.5rem" } : { paddingRight: "3.5rem" }}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>pax</span>
                                </div>
                                {errors.capacity
                                    ? <span className="form-error">{errors.capacity}</span>
                                    : <span className="form-hint">Strictly enforced during request approval.</span>}
                            </div>

                            {/* Room Type */}
                            <div className="form-group">
                                <label className="form-label">Room Type <span style={{ color: "var(--color-error)" }}>*</span></label>
                                <select
                                    value={form.type_id}
                                    onChange={(e) => handleChange("type_id", e.target.value)}
                                    style={errors.type_id ? { borderColor: "var(--color-error)" } : {}}
                                >
                                    <option value="">Select a type…</option>
                                    {ROOM_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                {errors.type_id && <span className="form-error">{errors.type_id}</span>}
                            </div>
                        </div>

                        {/* Availability toggle */}
                        <div className="form-group mb-6">
                            <label className="form-label">Availability Status</label>
                            <div className="flex gap-2 mt-1" style={{ maxWidth: 300 }}>
                                {[
                                    { label: "Available", val: true },
                                    { label: "Maintenance", val: false },
                                ].map((opt) => (
                                    <button
                                        key={String(opt.val)}
                                        type="button"
                                        onClick={() => handleChange("is_available", opt.val)}
                                        className="flex-1 py-2 text-xs font-medium rounded-md border-2 transition-all"
                                        style={{
                                            borderColor: form.is_available === opt.val ? "var(--color-primary-light)" : "var(--color-border)",
                                            backgroundColor: form.is_available === opt.val ? "var(--color-primary-muted)" : "var(--color-surface)",
                                            color: form.is_available === opt.val ? "var(--color-primary)" : "var(--color-text-secondary)",
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <span className="form-hint">Setting to Maintenance prevents new room requests.</span>
                        </div>

                        {/* Metadata */}
                        <div className="rounded-lg px-4 py-3 mb-6" style={{ backgroundColor: "var(--color-surface-2)" }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Record Info</p>
                            <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                                <span>Room ID: <strong style={{ color: "var(--color-text)" }}>#{ROOM.id}</strong></span>
                                <span>Created: <strong style={{ color: "var(--color-text)" }}>{ROOM.created_at}</strong></span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                            <a href="/admin/rooms" className="btn btn-ghost btn-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                                Back to Rooms
                            </a>
                            <div className="flex items-center gap-2">
                                {saveSuccess && (
                                    <span className="flex items-center gap-1 text-xs animate-fade-in" style={{ color: "var(--color-success)" }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                        Saved successfully
                                    </span>
                                )}
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSave}
                                    disabled={isSaving || !isDirty}
                                    style={(isSaving || !isDirty) ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                            Saving…
                                        </>
                                    ) : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: Schedule ── */}
                {activeTab === "schedule" && (
                    <div className="animate-fade-in">
                        {/* Weekly visual */}
                        <div className="card card-body mb-4">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Weekly Booking Map</h3>
                            <div className="flex gap-2 flex-wrap">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                                    const slots = ROOM_SCHEDULE.filter((s) => s.day_of_week === day && s.is_active);
                                    const color = DAY_COLORS[day];
                                    return (
                                        <div key={day} className="flex-1 min-w-[100px] rounded-lg p-3" style={{ backgroundColor: slots.length > 0 ? color + "14" : "var(--color-surface-2)", border: `1.5px solid ${slots.length > 0 ? color + "40" : "var(--color-border)"}` }}>
                                            <p className="text-xs font-semibold mb-2" style={{ color: slots.length > 0 ? color : "var(--color-text-muted)" }}>{day.slice(0, 3)}</p>
                                            {slots.length === 0
                                                ? <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Free</p>
                                                : slots.map((s) => (
                                                    <div key={s.id} className="text-[10px] font-medium leading-snug" style={{ color }}>
                                                        {s.time_start}–{s.time_end}
                                                        <br /><span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>{s.section_name}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <div className="card">
                            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Confirmed Bookings</h3>
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-green">{activeBookings} active</span>
                                    <span className="badge badge-gray">{ROOM_SCHEDULE.filter(s => !s.is_active).length} released</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table-base">
                                    <thead>
                                        <tr>
                                            <th>Section</th>
                                            <th>Course</th>
                                            <th>Instructor</th>
                                            <th>Day</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ROOM_SCHEDULE.map((slot) => (
                                            <tr key={slot.id}>
                                                <td>
                                                    <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{slot.section_name}</span>
                                                </td>
                                                <td>
                                                    <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{slot.course_code}</p>
                                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{slot.course_title}</p>
                                                </td>
                                                <td>
                                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{slot.instructor_name}</span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="badge text-xs"
                                                        style={{ backgroundColor: DAY_COLORS[slot.day_of_week] + "18", color: DAY_COLORS[slot.day_of_week] }}
                                                    >
                                                        {slot.day_of_week}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                                                        {slot.time_start}–{slot.time_end}
                                                    </span>
                                                </td>
                                                <td>
                                                    {slot.is_active
                                                        ? <span className="badge badge-green">Active</span>
                                                        : <span className="badge badge-gray">Released</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Disable / Enable Modal ── */}
                {showDisableModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
                        onClick={() => setShowDisableModal(false)}
                    >
                        <div
                            className="card card-body animate-fade-in"
                            style={{ width: 440, maxWidth: "90vw" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-error-light)" }}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--color-error)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">
                                        {ROOM.is_available ? "Disable" : "Enable"} Room {ROOM.room_number}?
                                    </h3>
                                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                        {ROOM.is_available
                                            ? "Setting this room as unavailable will block new requests. Existing confirmed schedules remain unaffected."
                                            : "Re-enabling this room will allow instructors to submit new booking requests."}
                                    </p>
                                    {activeBookings > 0 && ROOM.is_available && (
                                        <p className="text-xs mt-2 px-2 py-1.5 rounded" style={{ backgroundColor: "var(--color-error-light)", color: "var(--color-error)" }}>
                                            ⚠ This room has {activeBookings} active booking{activeBookings > 1 ? "s" : ""}.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowDisableModal(false)}>Cancel</button>
                                <button
                                    className="btn btn-sm"
                                    style={{ backgroundColor: "var(--color-error)", color: "#fff" }}
                                    onClick={() => {
                                        // TODO: PATCH /api/rooms/:id  { is_available: !ROOM.is_available }
                                        setShowDisableModal(false);
                                    }}
                                >
                                    {ROOM.is_available ? "Confirm Disable" : "Confirm Enable"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-center text-xs mt-8" style={{ color: "var(--color-text-muted)" }}>
                    Dalisay v1.0 · 2025
                </p>
            </div>
        </div>
    );
}

