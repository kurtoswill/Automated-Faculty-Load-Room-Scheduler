"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/Navbar";
import type { User, Department, Role } from "./types";

// ─── Mock Data ────────────────────────────────────────────────
// TODO: Replace with fetch("/api/admin/users") + fetch("/api/departments")

const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Department of Computer Science",       code: "DCS"   },
  { id: 2, name: "Department of Information Technology", code: "DIT"   },
  { id: 3, name: "Department of Mathematics",            code: "DMATH" },
  { id: 4, name: "Department of Engineering",            code: "DE"    },
];

const MOCK_USERS: User[] = [
  { id: 1,  employee_id: "EMP-001", student_id: null,           email: "admin@cvsu.edu.ph",       first_name: "Maria",  last_name: "Santos",    dept_id: 1, role: "Admin",      is_irregular: false, is_active: true,  created_at: "2024-06-01T08:00:00Z" },
  { id: 2,  employee_id: "EMP-002", student_id: null,           email: "jdelacruz@cvsu.edu.ph",   first_name: "Juan",   last_name: "Dela Cruz", dept_id: 1, role: "Instructor", is_irregular: false, is_active: true,  created_at: "2024-07-15T08:00:00Z" },
  { id: 3,  employee_id: "EMP-003", student_id: null,           email: "rreyes@cvsu.edu.ph",      first_name: "Rosa",   last_name: "Reyes",     dept_id: 2, role: "Instructor", is_irregular: false, is_active: true,  created_at: "2024-07-20T08:00:00Z" },
  { id: 4,  employee_id: "EMP-004", student_id: null,           email: "bmanalo@cvsu.edu.ph",     first_name: "Ben",    last_name: "Manalo",    dept_id: 3, role: "Instructor", is_irregular: false, is_active: false, created_at: "2024-07-22T08:00:00Z" },
  { id: 5,  employee_id: null,      student_id: "STU-2024-001", email: "acruz@cvsu.edu.ph",       first_name: "Ana",    last_name: "Cruz",      dept_id: 1, role: "Student",    is_irregular: false, is_active: true,  created_at: "2024-08-01T08:00:00Z" },
  { id: 6,  employee_id: null,      student_id: "STU-2024-002", email: "mgarcia@cvsu.edu.ph",     first_name: "Marco",  last_name: "Garcia",    dept_id: 2, role: "Student",    is_irregular: true,  is_active: true,  created_at: "2024-08-01T08:00:00Z" },
  { id: 7,  employee_id: null,      student_id: "STU-2024-003", email: "ltan@cvsu.edu.ph",        first_name: "Lisa",   last_name: "Tan",       dept_id: 1, role: "Student",    is_irregular: false, is_active: true,  created_at: "2024-08-02T08:00:00Z" },
  { id: 8,  employee_id: "EMP-005", student_id: null,           email: "pvillanueva@cvsu.edu.ph", first_name: "Pedro",  last_name: "Villanueva",dept_id: 4, role: "Instructor", is_irregular: false, is_active: true,  created_at: "2024-08-05T08:00:00Z" },
  { id: 9,  employee_id: null,      student_id: "STU-2024-004", email: "jbautista@cvsu.edu.ph",   first_name: "Jade",   last_name: "Bautista",  dept_id: 4, role: "Student",    is_irregular: false, is_active: false, created_at: "2024-08-06T08:00:00Z" },
  { id: 10, employee_id: "EMP-006", student_id: null,           email: "cramos@cvsu.edu.ph",      first_name: "Carlos", last_name: "Ramos",     dept_id: 2, role: "Admin",      is_irregular: false, is_active: true,  created_at: "2024-08-10T08:00:00Z" },
];

const PAGE_SIZE = 8;

// ─── Config ───────────────────────────────────────────────────
const ROLE_BADGE: Record<Role, { bg: string; color: string; dot: string }> = {
  Admin:      { bg: "#eef2ff", color: "#3730a3", dot: "#6366f1" },
  Instructor: { bg: "#fff8e6", color: "#92620a", dot: "#f0a500" },
  Student:    { bg: "#e8f5ee", color: "#1a7a3c", dot: "#22a050" },
};

// ─── Helpers ──────────────────────────────────────────────────
const initials = (f: string, l: string) => `${f[0]}${l[0]}`.toUpperCase();
const fmtDate  = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card flex flex-col gap-1" style={{ padding: "14px 18px", borderLeft: `3px solid ${color}` }}>
      <span className="text-[22px] font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const s = ROLE_BADGE[role];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {role}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users]       = useState<User[]>(MOCK_USERS);
  const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState<Role | "All">("All");
  const [deptFilter,   setDeptFilter]   = useState<number | "All">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [currentPage,  setCurrentPage]  = useState(1);

  const stats = useMemo(() => ({
    total:       users.length,
    admins:      users.filter((u) => u.role === "Admin").length,
    instructors: users.filter((u) => u.role === "Instructor").length,
    students:    users.filter((u) => u.role === "Student").length,
    active:      users.filter((u) => u.is_active).length,
    inactive:    users.filter((u) => !u.is_active).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (roleFilter   !== "All" && u.role !== roleFilter)                                   return false;
      if (deptFilter   !== "All" && u.dept_id !== deptFilter)                                return false;
      if (statusFilter === "Active"   && !u.is_active)                                       return false;
      if (statusFilter === "Inactive" && u.is_active)                                        return false;
      if (q && !`${u.first_name} ${u.last_name} ${u.email} ${u.employee_id ?? ""} ${u.student_id ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pg         = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);
  const hasFilters = search || roleFilter !== "All" || deptFilter !== "All" || statusFilter !== "All";

  function reset() {
    setSearch(""); setRoleFilter("All"); setDeptFilter("All"); setStatusFilter("All"); setCurrentPage(1);
  }

  return (
    <AppShell role="admin" userName="Admin Cruz" pageTitle="User Management">
      <div className="animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: "var(--color-text)" }}>User Management</h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Manage all Admins, Instructors, and Students on the platform.
            </p>
          </div>
          <Link href="/admin/users/create" className="btn btn-primary flex items-center gap-2 text-[13px] shrink-0" style={{ padding: "9px 18px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Create User
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <StatCard label="Total"       value={stats.total}       color="var(--color-text-secondary)" />
          <StatCard label="Admins"      value={stats.admins}      color="#3730a3" />
          <StatCard label="Instructors" value={stats.instructors} color="#92620a" />
          <StatCard label="Students"    value={stats.students}    color="#1a7a3c" />
          <StatCard label="Active"      value={stats.active}      color="var(--color-success)" />
          <StatCard label="Inactive"    value={stats.inactive}    color="var(--color-error)" />
        </div>

        {/* Filters */}
        <div className="card card-body mb-4 flex flex-wrap gap-3 items-center" style={{ padding: "14px 18px" }}>
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: "200px" }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
            </span>
            <input
              type="search"
              placeholder="Search by name, email, or ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: "2.25rem", fontSize: "13px", height: "38px" }}
            />
          </div>

          <select value={roleFilter}   onChange={(e) => { setRoleFilter(e.target.value as Role | "All"); setCurrentPage(1); }} style={{ fontSize: "13px", height: "38px" }}>
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Student">Student</option>
          </select>

          <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value === "All" ? "All" : Number(e.target.value)); setCurrentPage(1); }} style={{ fontSize: "13px", height: "38px", maxWidth: "200px" }}>
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
          </select>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "All" | "Active" | "Inactive"); setCurrentPage(1); }} style={{ fontSize: "13px", height: "38px" }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {hasFilters && (
            <button onClick={reset} className="flex items-center gap-1 text-[12.5px] font-medium transition-colors" style={{ color: "var(--color-error)", background: "none", border: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden mb-3">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "4rem 0" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round"><path d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>
                        <p className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>No users match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((user) => {
                  const dept    = departments.find((d) => d.id === user.dept_id);
                  const idLabel = user.role === "Student" ? user.student_id : user.employee_id;
                  return (
                    <tr key={user.id} className="group">
                      {/* User */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
                            style={{ background: "var(--color-primary)", color: "#fff" }}>
                            {initials(user.first_name, user.last_name)}
                          </div>
                          <div>
                            <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-text)" }}>
                              {user.last_name}, {user.first_name}
                              {user.role === "Student" && user.is_irregular && (
                                <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#fff8e6", color: "#92620a" }}>IRR</span>
                              )}
                            </p>
                            <p className="text-[11.5px]" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={user.role} /></td>
                      <td>
                        <span className="font-mono text-[11.5px] px-2 py-0.5 rounded-md" style={{ background: "var(--color-surface-2)", color: "var(--color-text-secondary)" }}>
                          {dept?.code ?? "—"}
                        </span>
                      </td>
                      <td className="font-mono text-[12px]" style={{ color: "var(--color-text-secondary)" }}>{idLabel ?? "—"}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: user.is_active ? "var(--color-success)" : "var(--color-error)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.is_active ? "var(--color-success)" : "var(--color-error)" }} />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>{fmtDate(user.created_at)}</td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: "var(--color-primary-light)" }}>
                          View
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t flex items-center justify-between px-5 py-3" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                Showing {(pg - 1) * PAGE_SIZE + 1}–{Math.min(pg * PAGE_SIZE, filtered.length)} of {filtered.length} users
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={pg === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-colors disabled:opacity-30"
                  style={{ color: "var(--color-text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setCurrentPage(n)}
                    className="w-7 h-7 text-[12px] rounded-md font-medium transition-colors"
                    style={n === pg
                      ? { background: "var(--color-primary)", color: "#fff" }
                      : { color: "var(--color-text-secondary)" }}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={pg === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-colors disabled:opacity-30"
                  style={{ color: "var(--color-text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

      </div>
    </AppShell>
  );
}