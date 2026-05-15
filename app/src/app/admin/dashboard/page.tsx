"use client";

import AppShell from "@/components/Navbar";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; up: boolean };
  href?: string;
}

interface RequestRow {
  id: string;
  instructor: string;
  initials: string;
  subject: string;
  room: string;
  date: string;
  time: string;
  count: number;
  capacity: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface LoadRow {
  name: string;
  initials: string;
  dept: string;
  current: number;
  max: number;
}

interface EnlistRow {
  student: string;
  initials: string;
  subject: string;
  instructor: string;
  status: "Pending" | "Approved" | "Rejected";
  time: string;
}

interface AuditRow {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "approve" | "reject" | "enlist" | "cancel" | "create";
}

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const REQUESTS: RequestRow[] = [
  {
    id: "RQ-041",
    instructor: "Dr. Maria Santos",
    initials: "MS",
    subject: "CMSC 101 — Data Structures",
    room: "Room 204",
    date: "May 16",
    time: "07:30–09:00",
    count: 38,
    capacity: 40,
    status: "Pending",
  },
  {
    id: "RQ-042",
    instructor: "Prof. Juan dela Cruz",
    initials: "JD",
    subject: "IT 301 — Web Development",
    room: "Lab 1",
    date: "May 16",
    time: "09:00–10:30",
    count: 30,
    capacity: 30,
    status: "Pending",
  },
  {
    id: "RQ-043",
    instructor: "Dr. Ana Reyes",
    initials: "AR",
    subject: "MATH 201 — Calculus II",
    room: "Room 101",
    date: "May 17",
    time: "10:30–12:00",
    count: 45,
    capacity: 50,
    status: "Pending",
  },
  {
    id: "RQ-044",
    instructor: "Prof. Ben Torres",
    initials: "BT",
    subject: "ENGL 102 — Technical Writing",
    room: "Room 305",
    date: "May 17",
    time: "13:00–14:30",
    count: 28,
    capacity: 35,
    status: "Approved",
  },
  {
    id: "RQ-045",
    instructor: "Dr. Luz Mendoza",
    initials: "LM",
    subject: "CS 401 — Algorithm Analysis",
    room: "Room 202",
    date: "May 18",
    time: "14:30–16:00",
    count: 22,
    capacity: 40,
    status: "Rejected",
  },
];

const LOAD_DATA: LoadRow[] = [
  {
    name: "Dr. Maria Santos",
    initials: "MS",
    dept: "CITE",
    current: 21,
    max: 24,
  },
  {
    name: "Prof. Juan dela Cruz",
    initials: "JD",
    dept: "CITE",
    current: 24,
    max: 24,
  },
  { name: "Dr. Ana Reyes", initials: "AR", dept: "CAS", current: 18, max: 21 },
  {
    name: "Prof. Ben Torres",
    initials: "BT",
    dept: "CAS",
    current: 9,
    max: 24,
  },
  {
    name: "Dr. Luz Mendoza",
    initials: "LM",
    dept: "CITE",
    current: 15,
    max: 21,
  },
];

const ENLIST_DATA: EnlistRow[] = [
  {
    student: "Carlo Reyes",
    initials: "CR",
    subject: "CMSC 101",
    instructor: "Dr. Santos",
    status: "Pending",
    time: "2h ago",
  },
  {
    student: "Nina Flores",
    initials: "NF",
    subject: "IT 301",
    instructor: "Prof. dela Cruz",
    status: "Approved",
    time: "3h ago",
  },
  {
    student: "Marco Lim",
    initials: "ML",
    subject: "MATH 201",
    instructor: "Dr. Reyes",
    status: "Pending",
    time: "5h ago",
  },
  {
    student: "Sofia Garcia",
    initials: "SG",
    subject: "CS 401",
    instructor: "Dr. Mendoza",
    status: "Rejected",
    time: "1d ago",
  },
];

const AUDIT_DATA: AuditRow[] = [
  {
    actor: "Admin Cruz",
    action: "Approved room request",
    target: "RQ-040 · Prof. Torres",
    time: "10 min ago",
    type: "approve",
  },
  {
    actor: "Dr. Santos",
    action: "Submitted room request",
    target: "RQ-041 · Room 204",
    time: "25 min ago",
    type: "create",
  },
  {
    actor: "Admin Cruz",
    action: "Rejected room request",
    target: "RQ-039 · Dr. Mendoza",
    time: "1h ago",
    type: "reject",
  },
  {
    actor: "Prof. dela Cruz",
    action: "Released booking",
    target: "RQ-038 · Lab 1",
    time: "2h ago",
    type: "cancel",
  },
  {
    actor: "Nina Flores",
    action: "Enlistment approved",
    target: "IT 301 · Prof. dela Cruz",
    time: "3h ago",
    type: "enlist",
  },
];

// ─────────────────────────────────────────────────────────────
// Inline SVG Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const IcoBuilding = () => (
  <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9" />
);
const IcoClipboard = () => (
  <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
);
const IcoCalendar = () => (
  <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
);
const IcoUsers = () => (
  <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
);
const IcoBar = () => <Ico d="M12 20V10M18 20V4M6 20v-4" />;
const IcoArrow = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={14} />;
const IcoCheck = () => <Ico d="M20 6L9 17l-5-5" size={14} />;
const IcoX = () => <Ico d="M18 6L6 18M6 6l12 12" size={14} />;
const IcoClock = () => (
  <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" size={14} />
);
const IcoShield = () => (
  <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} />
);
const IcoTrend = ({ up }: { up: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path
      d={
        up
          ? "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"
          : "M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6"
      }
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  trend,
  href,
}: StatCardProps) {
  const inner = (
    <div
      className="card card-body h-full flex flex-col gap-3 group hover:-translate-y-px transition-transform duration-150"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend.up ? "#e8f5ee" : "#fdecea",
              color: trend.up ? "#1a7a3c" : "#d93025",
            }}
          >
            <IcoTrend up={trend.up} />
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p
          className="text-[26px] font-bold leading-none mb-1"
          style={{ color: "var(--color-text)" }}
        >
          {value}
        </p>
        <p
          className="text-[12.5px] font-medium"
          style={{ color: "var(--color-text)" }}
        >
          {label}
        </p>
        <p
          className="text-[11.5px] mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {sub}
        </p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────
function StatusBadge({
  status,
}: {
  status: "Pending" | "Approved" | "Rejected";
}) {
  const map = {
    Pending: { bg: "#fff8e6", color: "#92620a", dot: "#f0a500" },
    Approved: { bg: "#e8f5ee", color: "#1a7a3c", dot: "#22a050" },
    Rejected: { bg: "#fdecea", color: "#d93025", dot: "#d93025" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Load bar
// ─────────────────────────────────────────────────────────────
function LoadBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  const color = pct >= 100 ? "#d93025" : pct >= 80 ? "#f0a500" : "#22a050";
  return (
    <div className="flex items-center gap-2.5 w-full">
      <div
        className="flex-1 h-1.5 rounded-full"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
      <span
        className="text-[11px] font-semibold shrink-0"
        style={{ color, minWidth: "52px", textAlign: "right" }}
      >
        {current}/{max} u
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--color-primary-muted)",
        color: "var(--color-primary)",
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Audit type config
// ─────────────────────────────────────────────────────────────
const AUDIT_TYPE: Record<
  AuditRow["type"],
  { icon: React.ReactNode; bg: string; color: string }
> = {
  approve: { icon: <IcoCheck />, bg: "#e8f5ee", color: "#1a7a3c" },
  reject: { icon: <IcoX />, bg: "#fdecea", color: "#d93025" },
  enlist: { icon: <IcoUsers />, bg: "#eef2ff", color: "#3730a3" },
  cancel: { icon: <IcoClock />, bg: "#fff8e6", color: "#92620a" },
  create: {
    icon: <IcoClipboard />,
    bg: "var(--color-surface-2)",
    color: "var(--color-text-secondary)",
  },
};

// ─────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  sub,
  href,
  label = "View all",
}: {
  title: string;
  sub?: string;
  href: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2
          className="text-[14px] font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h2>
        {sub && (
          <p
            className="text-[12px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {sub}
          </p>
        )}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-[12px] font-medium transition-colors"
        style={{ color: "var(--color-primary-light)" }}
      >
        {label} <IcoArrow />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <AppShell role="admin" userName="Admin Cruz" pageTitle="Dashboard">
      {/* ── Greeting ── */}
      <div className="mb-6">
        <h1
          className="text-[20px] font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Good morning, Admin Cruz 👋
        </h1>
        <p
          className="text-[13px] mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Thursday, May 15, 2025 · Here's what's happening today.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Rooms"
          value="24"
          sub="3 disabled · 21 active"
          icon={<IcoBuilding />}
          iconBg="#e8f5ee"
          iconColor="#1a7a3c"
          trend={{ value: "+2 this sem", up: true }}
          href="/admin/rooms"
        />
        <StatCard
          label="Pending Requests"
          value="5"
          sub="Awaiting your review"
          icon={<IcoClipboard />}
          iconBg="#fff8e6"
          iconColor="#92620a"
          trend={{ value: "+3 today", up: false }}
          href="/admin/requests"
        />
        <StatCard
          label="Active Bookings"
          value="38"
          sub="Confirmed this week"
          icon={<IcoCalendar />}
          iconBg="#eef2ff"
          iconColor="#3730a3"
          trend={{ value: "+6 vs last wk", up: true }}
          href="/admin/schedule"
        />
        <StatCard
          label="Faculty Members"
          value="12"
          sub="2 at load limit"
          icon={<IcoUsers />}
          iconBg="#fdecea"
          iconColor="#d93025"
          href="/admin/faculty-load"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Avg Room Utilization", value: "74%", color: "#22a050" },
          { label: "Irregular Enlistments", value: "9", color: "#3730a3" },
          { label: "Load Limit Warnings", value: "2", color: "#d93025" },
          { label: "Audit Actions Today", value: "14", color: "#92620a" },
        ].map((s) => (
          <div
            key={s.label}
            className="card card-body flex items-center gap-4"
            style={{ padding: "14px 18px" }}
          >
            <div
              className="w-2 self-stretch rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <div>
              <p
                className="text-[22px] font-bold leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p
                className="text-[11.5px] mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid: Requests + Load ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Pending Room Requests — 2/3 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body pb-2">
              <SectionHeader
                title="Pending Room Requests"
                sub="Requires your approval"
                href="/admin/requests"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Subject</th>
                    <th>Room</th>
                    <th>Date & Time</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {REQUESTS.map((r) => {
                    const capPct = Math.round((r.count / r.capacity) * 100);
                    const capWarn = capPct >= 100;
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={r.initials} />
                            <div>
                              <p
                                className="text-[12.5px] font-medium leading-tight"
                                style={{ color: "var(--color-text)" }}
                              >
                                {r.instructor}
                              </p>
                              <p
                                className="text-[11px]"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                {r.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p
                            className="text-[12.5px] font-medium"
                            style={{ color: "var(--color-text)" }}
                          >
                            {r.subject.split("—")[0].trim()}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {r.subject.split("—")[1]?.trim()}
                          </p>
                        </td>
                        <td
                          className="text-[12.5px]"
                          style={{ color: "var(--color-text)" }}
                        >
                          {r.room}
                        </td>
                        <td>
                          <p
                            className="text-[12.5px]"
                            style={{ color: "var(--color-text)" }}
                          >
                            {r.date}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {r.time}
                          </p>
                        </td>
                        <td>
                          <span
                            className="text-[12px] font-semibold"
                            style={{
                              color: capWarn
                                ? "var(--color-error)"
                                : "var(--color-text)",
                            }}
                          >
                            {r.count}/{r.capacity}
                          </span>
                          {capWarn && (
                            <p
                              className="text-[10.5px]"
                              style={{ color: "var(--color-error)" }}
                            >
                              At limit
                            </p>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          {r.status === "Pending" && (
                            <div className="flex gap-1.5">
                              <button
                                className="btn btn-sm"
                                style={{
                                  background: "var(--color-primary-muted)",
                                  color: "var(--color-primary)",
                                  padding: "5px 10px",
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{
                                  background: "var(--color-error-light)",
                                  color: "var(--color-error)",
                                  padding: "5px 10px",
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Faculty Load — 1/3 */}
        <div>
          <div className="card h-full">
            <div className="card-body pb-2">
              <SectionHeader
                title="Faculty Load"
                sub="Units vs limit"
                href="/admin/faculty-load"
              />
            </div>
            <div className="px-6 pb-5 flex flex-col gap-4">
              {LOAD_DATA.map((l) => {
                const pct = Math.round((l.current / l.max) * 100);
                const warn = pct >= 100;
                return (
                  <div key={l.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={l.initials} />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12.5px] font-medium truncate leading-tight"
                          style={{ color: "var(--color-text)" }}
                        >
                          {l.name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {l.dept}{" "}
                          {warn && (
                            <span
                              style={{
                                color: "var(--color-error)",
                                fontWeight: 600,
                              }}
                            >
                              · At limit
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <LoadBar current={l.current} max={l.max} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom grid: Enlistments + Audit ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Irregular Enlistments */}
        <div className="card">
          <div className="card-body pb-2">
            <SectionHeader
              title="Irregular Enlistments"
              sub="Recent activity"
              href="/admin/enlistments"
            />
          </div>
          <div className="px-6 pb-5 flex flex-col gap-3">
            {ENLIST_DATA.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Avatar initials={e.initials} />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12.5px] font-medium leading-tight"
                    style={{ color: "var(--color-text)" }}
                  >
                    {e.student}
                  </p>
                  <p
                    className="text-[11.5px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {e.subject} · {e.instructor}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={e.status} />
                  <span
                    className="text-[10.5px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {e.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="card">
          <div className="card-body pb-2">
            <SectionHeader
              title="Recent Audit Activity"
              sub="Last 24 hours"
              href="/admin/audit-log"
            />
          </div>
          <div className="px-6 pb-5 flex flex-col gap-3">
            {AUDIT_DATA.map((a, i) => {
              const t = AUDIT_TYPE[a.type];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: t.bg, color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12.5px] font-medium leading-tight"
                      style={{ color: "var(--color-text)" }}
                    >
                      {a.actor}
                      <span
                        className="font-normal"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {" "}
                        — {a.action}
                      </span>
                    </p>
                    <p
                      className="text-[11.5px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {a.target}
                    </p>
                  </div>
                  <span
                    className="text-[10.5px] shrink-0 mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {a.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
