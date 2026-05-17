"use client";

import { useState, useMemo } from "react";
import type { User, Department, Role } from "./types";

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: Replace with → fetch("/api/admin/users") and fetch("/api/departments")

const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: "Department of Computer Science", code: "DCS" },
    { id: 2, name: "Department of Information Technology", code: "DIT" },
    { id: 3, name: "Department of Mathematics", code: "DMATH" },
    { id: 4, name: "Department of Engineering", code: "DE" },
];

const MOCK_USERS: User[] = [
    { id: 1, employee_id: "EMP-001", student_id: null, email: "admin@uni.edu.ph", first_name: "Maria", last_name: "Santos", dept_id: 1, role: "Admin", is_irregular: false, is_active: true, created_at: "2024-06-01T08:00:00Z" },
    { id: 2, employee_id: "EMP-002", student_id: null, email: "jdelacruz@uni.edu.ph", first_name: "Juan", last_name: "Dela Cruz", dept_id: 1, role: "Instructor", is_irregular: false, is_active: true, created_at: "2024-07-15T08:00:00Z" },
    { id: 3, employee_id: "EMP-003", student_id: null, email: "rreyes@uni.edu.ph", first_name: "Rosa", last_name: "Reyes", dept_id: 2, role: "Instructor", is_irregular: false, is_active: true, created_at: "2024-07-20T08:00:00Z" },
    { id: 4, employee_id: "EMP-004", student_id: null, email: "bmanalo@uni.edu.ph", first_name: "Ben", last_name: "Manalo", dept_id: 3, role: "Instructor", is_irregular: false, is_active: false, created_at: "2024-07-22T08:00:00Z" },
    { id: 5, employee_id: null, student_id: "STU-2024-001", email: "acruz@student.uni.edu.ph", first_name: "Ana", last_name: "Cruz", dept_id: 1, role: "Student", is_irregular: false, is_active: true, created_at: "2024-08-01T08:00:00Z" },
    { id: 6, employee_id: null, student_id: "STU-2024-002", email: "mgarcia@student.uni.edu.ph", first_name: "Marco", last_name: "Garcia", dept_id: 2, role: "Student", is_irregular: true, is_active: true, created_at: "2024-08-01T08:00:00Z" },
    { id: 7, employee_id: null, student_id: "STU-2024-003", email: "ltan@student.uni.edu.ph", first_name: "Lisa", last_name: "Tan", dept_id: 1, role: "Student", is_irregular: false, is_active: true, created_at: "2024-08-02T08:00:00Z" },
    { id: 8, employee_id: "EMP-005", student_id: null, email: "pvillanueva@uni.edu.ph", first_name: "Pedro", last_name: "Villanueva", dept_id: 4, role: "Instructor", is_irregular: false, is_active: true, created_at: "2024-08-05T08:00:00Z" },
    { id: 9, employee_id: null, student_id: "STU-2024-004", email: "jbautista@student.uni.edu.ph", first_name: "Jade", last_name: "Bautista", dept_id: 4, role: "Student", is_irregular: false, is_active: false, created_at: "2024-08-06T08:00:00Z" },
    { id: 10, employee_id: "EMP-006", student_id: null, email: "cadmin@uni.edu.ph", first_name: "Carlos", last_name: "Ramos", dept_id: 2, role: "Admin", is_irregular: false, is_active: true, created_at: "2024-08-10T08:00:00Z" },
];

const PAGE_SIZE = 8;

// ─── Config maps ─────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<Role, { label: string; className: string }> = {
    Admin: { label: "Admin", className: "bg-amber-50 text-amber-700 border-amber-200" },
    Instructor: { label: "Instructor", className: "bg-sky-50 text-sky-700 border-sky-200" },
    Student: { label: "Student", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
    return `${first[0]}${last[0]}`.toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-surface border border-border rounded-xl px-5 py-4 flex flex-col gap-1">
            <span className={`text-2xl font-bold tracking-tight ${accent ?? "text-text"}`}>
                {value}
            </span>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
}

function RoleBadge({ role }: { role: Role }) {
    const s = ROLE_STYLE[role];
    return (
        <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${s.className}`}>
            {s.label}
        </span>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    <p className="text-sm text-text-secondary font-medium">No users match your filters.</p>
                    <p className="text-xs text-text-muted">Try adjusting your search or filter criteria.</p>
                </div>
            </td>
        </tr>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    // TODO: Replace state below with useEffect → fetch("/api/admin/users") and setUsers(data)
    const [users] = useState<User[]>(MOCK_USERS);
    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

    // ── Filter state ──
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
    const [deptFilter, setDeptFilter] = useState<number | "All">("All");
    const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
    const [currentPage, setCurrentPage] = useState(1);

    // ── Derived stats ──
    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter((u) => u.role === "Admin").length,
        instructors: users.filter((u) => u.role === "Instructor").length,
        students: users.filter((u) => u.role === "Student").length,
        active: users.filter((u) => u.is_active).length,
        inactive: users.filter((u) => !u.is_active).length,
    }), [users]);

    // ── Filtered + paginated data ──
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter((u) => {
            const matchSearch =
                !q ||
                u.first_name.toLowerCase().includes(q) ||
                u.last_name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.employee_id ?? "").toLowerCase().includes(q) ||
                (u.student_id ?? "").toLowerCase().includes(q);

            const matchRole = roleFilter === "All" || u.role === roleFilter;
            const matchDept = deptFilter === "All" || u.dept_id === deptFilter;
            const matchStatus =
                statusFilter === "All" ||
                (statusFilter === "Active" && u.is_active) ||
                (statusFilter === "Inactive" && !u.is_active);

            return matchSearch && matchRole && matchDept && matchStatus;
        });
    }, [users, search, roleFilter, deptFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function resetFilters() {
        setSearch("");
        setRoleFilter("All");
        setDeptFilter("All");
        setStatusFilter("All");
        setCurrentPage(1);
    }

    const hasActiveFilters =
        search || roleFilter !== "All" || deptFilter !== "All" || statusFilter !== "All";

    // ─────────────────────────────────────────────────────────────────────────────

    return (
        <div className="page-shell">

            {/* ── Top Bar ── */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-text-muted text-sm">Admin</span>
                    <span className="text-border">/</span>
                    <span className="text-text text-sm font-semibold">Users</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Dalisay</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

                {/* ── Page heading + CTA ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text tracking-tight">User Management</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Manage all Admins, Instructors, and Students on the platform.
                        </p>
                    </div>
                    <a
                        href="/admin/users/create"
                        className="btn btn-primary flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create User
                    </a>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard label="Total Users" value={stats.total} />
                    <StatCard label="Admins" value={stats.admins} accent="text-accent" />
                    <StatCard label="Instructors" value={stats.instructors} accent="text-info" />
                    <StatCard label="Students" value={stats.students} accent="text-success" />
                    <StatCard label="Active" value={stats.active} accent="text-success" />
                    <StatCard label="Inactive" value={stats.inactive} accent="text-error" />
                </div>

                {/* ── Search + Filters ── */}
                <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-muted text-text placeholder:text-text-muted"
                        />
                    </div>

                    {/* Role filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value as Role | "All"); setCurrentPage(1); }}
                        className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text bg-surface"
                    >
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Student">Student</option>
                    </select>

                    {/* Department filter */}
                    <select
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value === "All" ? "All" : Number(e.target.value)); setCurrentPage(1); }}
                        className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text bg-surface max-w-[200px]"
                    >
                        <option value="All">All Departments</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as "All" | "Active" | "Inactive"); setCurrentPage(1); }}
                        className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text bg-surface"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-sm text-text-secondary hover:text-error transition-colors flex items-center gap-1"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Table ── */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface-2">
                                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Department</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Created</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginated.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    paginated.map((user) => {
                                        const dept = departments.find((d) => d.id === user.dept_id);
                                        const idLabel = user.role === "Student"
                                            ? user.student_id
                                            : user.employee_id;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-primary-muted transition-colors group"
                                            >
                                                {/* User */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-text-on-primary">
                                                                {getInitials(user.first_name, user.last_name)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-text">
                                                                {user.last_name}, {user.first_name}
                                                                {user.role === "Student" && user.is_irregular && (
                                                                    <span className="ml-2 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-1.5 py-0.5">
                                                                        IRR
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-text-muted">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-4 py-3.5">
                                                    <RoleBadge role={user.role} />
                                                </td>

                                                {/* Department */}
                                                <td className="px-4 py-3.5">
                                                    <span className="font-mono text-xs text-text bg-surface-2 rounded-md px-2 py-1">
                                                        {dept?.code ?? "—"}
                                                    </span>
                                                </td>

                                                {/* ID */}
                                                <td className="px-4 py-3.5">
                                                    <span className="font-mono text-xs text-text-secondary">
                                                        {idLabel ?? "—"}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.is_active ? "text-success" : "text-error"}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-success" : "bg-error"}`} />
                                                        {user.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* Created */}
                                                <td className="px-4 py-3.5 text-xs text-text-muted">
                                                    {formatDate(user.created_at)}
                                                </td>

                                                {/* Action */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <a
                                                        href={`/admin/users/${user.id}`}
                                                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text font-medium transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        View
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                            <p className="text-xs text-text-muted">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setCurrentPage(n)}
                                        className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${n === page
                                                ? "bg-primary text-text-on-primary"
                                                : "text-text-secondary hover:bg-surface-2"
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results count */}
                {filtered.length > 0 && (
                    <p className="text-xs text-text-muted text-center">
                        {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
                    </p>
                )}

            </main>
        </div>
    );
}