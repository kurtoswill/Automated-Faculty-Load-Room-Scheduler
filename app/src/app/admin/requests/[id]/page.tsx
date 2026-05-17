"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    Building2,
    CalendarDays,
    Users,
    BookOpen,
    User,
    Layers,
    ShieldAlert,
    ChevronRight,
} from "lucide-react";

// Import the AppShell component
import AppShell from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────
type RequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | "Released";

interface RequestDetail {
    id: number;
    status: RequestStatus;
    submitted_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    admin_remarks: string | null;
    instructor_name: string;
    instructor_email: string;
    instructor_dept: string;
    employee_id: string;
    section_name: string;
    semester: string;
    year_level: number;
    expected_students: number;
    day_of_week: string;
    time_start: string;
    time_end: string;
    course_code: string;
    course_title: string;
    course_units: number;
    room_number: string;
    building: string;
    room_capacity: number;
    room_type: string;
    current_units: number;
    max_units: number;
    current_classes: number;
    max_classes: number;
}

// ─── Placeholder Data ─────────────────────────────────────────
const PLACEHOLDER: RequestDetail = {
    id: 1,
    status: "Pending",
    submitted_at: "2025-08-01T09:15:00",
    reviewed_at: null,
    reviewed_by: null,
    admin_remarks: null,
    instructor_name: "Dr. Maria Santos",
    instructor_email: "m.santos@cvsu.edu.ph",
    instructor_dept: "Department of Computer Science",
    employee_id: "EMP-2019-0042",
    section_name: "BSCS 3-A",
    semester: "2025-2026 1st Sem",
    year_level: 3,
    expected_students: 35,
    day_of_week: "Monday",
    time_start: "08:00",
    time_end: "10:00",
    course_code: "CS 3101",
    course_title: "Web Systems and Technologies",
    course_units: 3.0,
    room_number: "CS-101",
    building: "New Academic Building",
    room_capacity: 40,
    room_type: "Lecture",
    current_units: 15.0,
    max_units: 21.0,
    current_classes: 5,
    max_classes: 8,
};

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<RequestStatus, { label: string; badgeClass: string; icon: React.ReactNode; color: string }> = {
    Pending: { label: "Pending Review", badgeClass: "badge badge-yellow", icon: <Clock size={12} />, color: "var(--color-warning)" },
    Approved: { label: "Approved", badgeClass: "badge badge-green", icon: <CheckCircle2 size={12} />, color: "var(--color-success)" },
    Rejected: { label: "Rejected", badgeClass: "badge badge-red", icon: <XCircle size={12} />, color: "var(--color-error)" },
    Cancelled: { label: "Cancelled", badgeClass: "badge badge-gray", icon: <AlertCircle size={12} />, color: "var(--color-text-muted)" },
    Released: { label: "Released", badgeClass: "badge badge-blue", icon: <RotateCcw size={12} />, color: "var(--color-info)" },
};

function formatTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        month: "long", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function InfoSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="card">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
                <span style={{ color: "var(--color-primary)" }}>{icon}</span>
                <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{title}</h2>
            </div>
            <div className="card-body !p-5">{children}</div>
        </div>
    );
}

function Field({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
    return (
        <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>{label}</p>
            <p className="text-sm font-medium" style={{ color: highlight ? "var(--color-error)" : "var(--color-text)" }}>
                {value}
            </p>
        </div>
    );
}

function LoadBar({ label, current, max, unit }: { label: string; current: number; max: number; unit: string }) {
    const pct = Math.min((current / max) * 100, 100);
    const danger = pct >= 90;
    const barColor = danger ? "var(--color-error)" : "var(--color-primary-light)";

    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                <span className="text-xs font-semibold" style={{ color: danger ? "var(--color-error)" : "var(--color-text)" }}>
                    {current} / {max} {unit}
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
        </div>
    );
}

function ConflictRow({ label, passed, detail }: { label: string; passed: boolean; detail: string }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: passed ? "var(--color-primary-muted)" : "var(--color-error-light)" }}>
                {passed ? <CheckCircle2 size={12} style={{ color: "var(--color-success)" }} /> : <XCircle size={12} style={{ color: "var(--color-error)" }} />}
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: passed ? "var(--color-text-muted)" : "var(--color-error)" }}>{detail}</p>
            </div>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────
type ModalAction = "approve" | "reject" | null;

function ActionModal({ action, onClose, onConfirm }: { action: ModalAction; onClose: () => void; onConfirm: (remarks: string) => void }) {
    const [remarks, setRemarks] = useState("");
    if (!action) return null;
    const isApprove = action === "approve";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
            <div className="card w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--color-border)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isApprove ? "var(--color-primary-muted)" : "var(--color-error-light)" }}>
                        {isApprove ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <XCircle size={16} style={{ color: "var(--color-error)" }} />}
                    </div>
                    <h3 className="font-semibold">{isApprove ? "Approve Request" : "Reject Request"}</h3>
                </div>
                <div className="card-body !p-6 space-y-4">
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {isApprove ? "Approving will lock the room slot and create a confirmed schedule entry." : "Rejecting will release the room slot. Please provide a reason."}
                    </p>
                    <div className="form-group">
                        <label className="form-label">Admin Remarks {!isApprove && <span className="text-error">*</span>}</label>
                        <textarea rows={3} placeholder={isApprove ? "Optional note…" : "Reason for rejection…"} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                        <button className={`btn btn-sm ${isApprove ? "btn-primary" : "btn-danger"}`} onClick={() => { if (!isApprove && !remarks.trim()) return; onConfirm(remarks); }}>
                            {isApprove ? "Confirm Approval" : "Confirm Rejection"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminRequestDetailPage() {
    const request = PLACEHOLDER;
    const sc = STATUS_CONFIG[request.status];
    const [modal, setModal] = useState<ModalAction>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    function handleConfirm(remarks: string) {
        setModal(null);
        setToast({
            msg: modal === "approve" ? "Request approved successfully." : "Request rejected.",
            type: modal === "approve" ? "success" : "error",
        });
        setTimeout(() => setToast(null), 3000);
    }

    const overCapacity = request.expected_students > request.room_capacity;
    const unitAfter = request.current_units + request.course_units;
    const loadOk = unitAfter <= request.max_units;
    const classOk = request.current_classes + 1 <= request.max_classes;

    return (
        <AppShell
            role="admin"
            userName="Dalisay Admin"
            pageTitle={`Request #${request.id}`}
        >
            {/* Custom Header with Actions */}
            <div className="mb-6">
                <Link href="/admin/requests" className="inline-flex items-center gap-1.5 text-sm mb-3 btn btn-ghost btn-sm !px-2" style={{ color: "var(--color-text-secondary)" }}>
                    <ArrowLeft size={14} /> Back to Requests
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-semibold">Request #{request.id}</h1>
                            <span className={sc.badgeClass}>{sc.icon} {sc.label}</span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Submitted {formatDate(request.submitted_at)}
                        </p>
                    </div>

                    {request.status === "Pending" && (
                        <div className="flex gap-2 shrink-0">
                            <button className="btn btn-danger btn-sm" onClick={() => setModal("reject")}>
                                <XCircle size={14} /> Reject
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setModal("approve")}>
                                <CheckCircle2 size={14} /> Approve
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <InfoSection title="Course & Section" icon={<BookOpen size={15} />}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <Field label="Course Code" value={request.course_code} />
                            <Field label="Units" value={`${request.course_units} units`} />
                            <Field label="Course Title" value={request.course_title} />
                            <Field label="Section" value={request.section_name} />
                            <Field label="Semester" value={request.semester} />
                            <Field label="Year Level" value={`Year ${request.year_level}`} />
                            <Field label="Day" value={request.day_of_week} />
                            <Field label="Time" value={`${formatTime(request.time_start)} – ${formatTime(request.time_end)}`} />
                        </div>
                    </InfoSection>

                    <InfoSection title="Requested Room" icon={<Building2 size={15} />}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <Field label="Room Number" value={request.room_number} />
                            <Field label="Room Type" value={request.room_type} />
                            <Field label="Building" value={request.building} />
                            <Field label="Room Capacity" value={`${request.room_capacity} students`} />
                            <Field label="Expected Students" value={`${request.expected_students} students`} highlight={overCapacity} />
                            {overCapacity && (
                                <div className="col-span-2">
                                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>
                                        <ShieldAlert size={14} className="shrink-0 mt-0.5" /> Expected headcount exceeds room capacity. Approval will be blocked.
                                    </div>
                                </div>
                            )}
                        </div>
                    </InfoSection>

                    {request.reviewed_at && (
                        <InfoSection title="Admin Decision" icon={<CheckCircle2 size={15} />}>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <Field label="Reviewed By" value={request.reviewed_by ?? "—"} />
                                    <Field label="Reviewed At" value={request.reviewed_at ? formatDate(request.reviewed_at) : "—"} />
                                </div>
                                {request.admin_remarks && (
                                    <div>
                                        <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>Remarks</p>
                                        <p className="text-sm p-3 rounded-lg" style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}>{request.admin_remarks}</p>
                                    </div>
                                )}
                            </div>
                        </InfoSection>
                    )}
                </div>

                <div className="space-y-5">
                    <InfoSection title="Instructor" icon={<User size={15} />}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0" style={{ backgroundColor: "var(--color-primary-light)" }}>
                                {request.instructor_name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{request.instructor_name}</p>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{request.employee_id}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Field label="Email" value={request.instructor_email} />
                            <Field label="Department" value={request.instructor_dept} />
                        </div>
                    </InfoSection>

                    <InfoSection title="Faculty Load" icon={<Layers size={15} />}>
                        <div className="space-y-4">
                            <LoadBar label="Teaching Units" current={request.current_units} max={request.max_units} unit="units" />
                            <LoadBar label="Classes" current={request.current_classes} max={request.max_classes} unit="classes" />
                            <div className="text-xs p-2.5 rounded-lg" style={{ background: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>
                                After approval: <span className="font-semibold" style={{ color: loadOk ? "var(--color-text)" : "var(--color-error)" }}>{unitAfter} / {request.max_units} units</span>
                            </div>
                        </div>
                    </InfoSection>

                    <InfoSection title="Conflict Checks" icon={<ShieldAlert size={15} />}>
                        <ConflictRow label="Room Available" passed={true} detail="CS-101 is free on Monday 08:00–10:00" />
                        <ConflictRow label="Instructor Available" passed={true} detail="No overlapping confirmed schedule" />
                        <ConflictRow label="Headcount vs. Capacity" passed={!overCapacity} detail={overCapacity ? `${request.expected_students} students exceeds capacity of ${request.room_capacity}` : `${request.expected_students} within ${request.room_capacity} cap`} />
                        <ConflictRow label="Unit Load Limit" passed={loadOk} detail={loadOk ? `${unitAfter} units within ${request.max_units} limit` : `${unitAfter} units exceeds ${request.max_units} limit`} />
                        <ConflictRow label="Class Count Limit" passed={classOk} detail={classOk ? `${request.current_classes + 1} classes within ${request.max_classes} limit` : `Would exceed max classes of ${request.max_classes}`} />
                    </InfoSection>
                </div>
            </div>

            <ActionModal action={modal} onClose={() => setModal(null)} onConfirm={handleConfirm} />

            {toast && (
                <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
                    {toast.msg}
                </div>
            )}
        </AppShell>
    );
}