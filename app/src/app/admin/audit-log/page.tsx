'use client';

/**
 * /admin/audit-log
 *
 * Tables consumed (per Pages.pdf):
 *   Audit_Log  — id, actor_id, action, target_table, target_id,
 *                details, performed_at
 *   Users      — first_name, last_name, role (for actor display)
 *
 * Access: Admin only — read-only, append-only log
 * Records are NEVER modified or deleted (immutable by design).
 * Filters: actor, action type, target table, date range, free-text search
 */

import { useState, useMemo } from 'react';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types  (mirror DB columns exactly)
// ─────────────────────────────────────────────────────────────
type ActorRole =
  | 'Admin'
  | 'Instructor'
  | 'Student';

type ActionType =
  | 'APPROVE_REQUEST'
  | 'REJECT_REQUEST'
  | 'CANCEL_REQUEST'
  | 'RELEASE_BOOKING'
  | 'CREATE_ROOM'
  | 'UPDATE_ROOM'
  | 'DISABLE_ROOM'
  | 'ENABLE_ROOM'
  | 'UPDATE_LOAD_LIMIT'
  | 'DEACTIVATE_USER'
  | 'ACTIVATE_USER'
  | 'CREATE_USER'
  | 'ASSIGN_STUDENT'
  | 'SUBMIT_REQUEST'
  | 'SUBMIT_ENLISTMENT'
  | 'APPROVE_ENLISTMENT'
  | 'REJECT_ENLISTMENT';

type TargetTable =
  | 'Room_Requests'
  | 'Confirmed_Schedule'
  | 'Rooms'
  | 'Users'
  | 'Faculty_Load_Limits'
  | 'Student_Section'
  | 'Enlistments';

// Audit_Log JOIN Users (actor)
interface AuditRow {
  id:           number;          // Audit_Log.id  (PK, auto-increment)
  actorId:      number;          // Audit_Log.actor_id
  actorName:    string;          // Users.first_name + last_name
  actorRole:    ActorRole;       // Users.role
  action:       ActionType;      // Audit_Log.action
  targetTable:  TargetTable;     // Audit_Log.target_table
  targetId:     number;          // Audit_Log.target_id
  details:      string;          // Audit_Log.details
  performedAt:  string;          // Audit_Log.performed_at (ISO timestamp)
}

// ─────────────────────────────────────────────────────────────
// Mock data  (mirrors DB join)
// ─────────────────────────────────────────────────────────────
const AUDIT_LOG: AuditRow[] = [
  { id: 101, actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'APPROVE_REQUEST',    targetTable: 'Room_Requests',       targetId: 41, details: 'Request #41 approved. Room: CS-204, Section: BSCS 3-A, Monday 07:30–09:00. Previous status: Pending.',                performedAt: '2025-05-15 11:42:00' },
  { id: 100, actorId: 2, actorName: 'Dr. Maria Santos',   actorRole: 'Instructor', action: 'SUBMIT_REQUEST',     targetTable: 'Room_Requests',       targetId: 41, details: 'Room request #41 submitted for CS 3101 – CS-204, Monday 07:30–09:00. Section: BSCS 3-A.',                               performedAt: '2025-05-15 08:30:00' },
  { id: 99,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'REJECT_REQUEST',     targetTable: 'Room_Requests',       targetId: 39, details: 'Request #39 rejected. Reason: Room already booked at that time slot. Instructor: Prof. Torres.',                        performedAt: '2025-05-14 16:10:00' },
  { id: 98,  actorId: 3, actorName: 'Prof. Juan dela Cruz', actorRole: 'Instructor', action: 'RELEASE_BOOKING',  targetTable: 'Confirmed_Schedule',  targetId: 7,  details: 'Booking released for CS-202, Wednesday 13:00–14:30. Section: IT 3-B. is_active set to FALSE.',                        performedAt: '2025-05-14 14:05:00' },
  { id: 97,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'APPROVE_REQUEST',    targetTable: 'Room_Requests',       targetId: 38, details: 'Request #38 approved. Room: CS-202, Section: BSCS 4-A, Tuesday 09:00–10:30. Previous status: Pending.',               performedAt: '2025-05-13 10:15:00' },
  { id: 96,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'UPDATE_LOAD_LIMIT',  targetTable: 'Faculty_Load_Limits', targetId: 2,  details: 'Load limit updated for Dr. Maria Santos. max_units: 18.0 → 21.0, max_classes: 6 → 7.',                               performedAt: '2025-05-13 09:00:00' },
  { id: 95,  actorId: 4, actorName: 'Carlo Reyes',        actorRole: 'Student',    action: 'SUBMIT_ENLISTMENT',  targetTable: 'Enlistments',         targetId: 14, details: 'Enlistment request #14 submitted by Carlo Reyes (2021-00123) for CS 3101 – BSCS 3-A (Dr. Santos).',                   performedAt: '2025-05-12 11:20:00' },
  { id: 94,  actorId: 2, actorName: 'Dr. Maria Santos',   actorRole: 'Instructor', action: 'APPROVE_ENLISTMENT', targetTable: 'Enlistments',         targetId: 11, details: 'Enlistment request #11 approved by Dr. Maria Santos. Student: Nina Flores (2021-00456), Subject: CS 4101.',           performedAt: '2025-05-12 10:00:00' },
  { id: 93,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'CREATE_ROOM',        targetTable: 'Rooms',               targetId: 12, details: 'Room ICT-Lab2 created. Building: ICT Building, Capacity: 30, Type: Laboratory.',                                      performedAt: '2025-05-11 14:30:00' },
  { id: 92,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'DISABLE_ROOM',       targetTable: 'Rooms',               targetId: 6,  details: 'Room ICT-Lab3 disabled (is_available = FALSE). Reason: Under renovation.',                                            performedAt: '2025-05-11 09:45:00' },
  { id: 91,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'CREATE_USER',        targetTable: 'Users',               targetId: 15, details: 'User account created for Prof. Ana Reyes. Role: Instructor, Dept: DCS, Employee ID: EMP-2022-010.',                   performedAt: '2025-05-10 08:15:00' },
  { id: 90,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'ASSIGN_STUDENT',     targetTable: 'Student_Section',     targetId: 108, details: 'Student Carlo Reyes (2021-00123) assigned to section BSCS 3-A for CS 3101 (Dr. Santos).',                           performedAt: '2025-05-10 08:00:00' },
  { id: 89,  actorId: 3, actorName: 'Prof. Juan dela Cruz', actorRole: 'Instructor', action: 'CANCEL_REQUEST',   targetTable: 'Room_Requests',       targetId: 36, details: 'Request #36 cancelled by instructor. Room: GE-305, Section: IT 3-B, Thursday 13:00–14:30.',                          performedAt: '2025-05-09 16:00:00' },
  { id: 88,  actorId: 2, actorName: 'Dr. Maria Santos',   actorRole: 'Instructor', action: 'REJECT_ENLISTMENT',  targetTable: 'Enlistments',         targetId: 9,  details: 'Enlistment request #9 rejected by Dr. Santos. Student: Marco Lim (2020-00789). Reason: Class already full.',       performedAt: '2025-05-09 14:15:00' },
  { id: 87,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'DEACTIVATE_USER',    targetTable: 'Users',               targetId: 8,  details: 'User account deactivated for former student Juan Bautista (2019-00234). is_active set to FALSE.',                    performedAt: '2025-05-08 10:00:00' },
  { id: 86,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'UPDATE_ROOM',        targetTable: 'Rooms',               targetId: 1,  details: 'Room CS-101 updated. Capacity changed: 40 → 45.',                                                                   performedAt: '2025-05-07 09:30:00' },
  { id: 85,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'APPROVE_REQUEST',    targetTable: 'Room_Requests',       targetId: 35, details: 'Request #35 approved. Room: ICT-Lab1, Section: IT 3-B, Wednesday 13:00–14:30. Previous status: Pending.',           performedAt: '2025-05-06 11:00:00' },
  { id: 84,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'ENABLE_ROOM',        targetTable: 'Rooms',               targetId: 4,  details: 'Room ICT-Lab1 re-enabled (is_available = TRUE). Renovation completed.',                                             performedAt: '2025-05-05 08:00:00' },
  { id: 83,  actorId: 5, actorName: 'Prof. Ben Torres',   actorRole: 'Instructor', action: 'SUBMIT_REQUEST',     targetTable: 'Room_Requests',       targetId: 34, details: 'Room request #34 submitted for GE 102 – GE-305, Friday 10:30–12:00. Section: BSCS 3-A.',                            performedAt: '2025-05-04 14:00:00' },
  { id: 82,  actorId: 1, actorName: 'Admin Cruz',         actorRole: 'Admin',      action: 'APPROVE_REQUEST',    targetTable: 'Room_Requests',       targetId: 34, details: 'Request #34 approved. Room: GE-305, Section: BSCS 3-A, Friday 10:30–12:00. Previous status: Pending.',              performedAt: '2025-05-04 16:30:00' },
];

// ─────────────────────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────────────────────
const ACTION_META: Record<ActionType, { label: string; bg: string; color: string; dot: string }> = {
  APPROVE_REQUEST:    { label: 'Approved Request',    bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
  REJECT_REQUEST:     { label: 'Rejected Request',    bg: '#fdecea', color: '#d93025', dot: '#d93025' },
  CANCEL_REQUEST:     { label: 'Cancelled Request',   bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', dot: '#9ba3b2' },
  RELEASE_BOOKING:    { label: 'Released Booking',    bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
  CREATE_ROOM:        { label: 'Created Room',        bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
  UPDATE_ROOM:        { label: 'Updated Room',        bg: '#fff8e6', color: '#92620a', dot: '#f0a500' },
  DISABLE_ROOM:       { label: 'Disabled Room',       bg: '#fdecea', color: '#d93025', dot: '#d93025' },
  ENABLE_ROOM:        { label: 'Enabled Room',        bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
  UPDATE_LOAD_LIMIT:  { label: 'Updated Load Limit',  bg: '#eef2ff', color: '#3730a3', dot: '#6366f1' },
  DEACTIVATE_USER:    { label: 'Deactivated User',    bg: '#fdecea', color: '#d93025', dot: '#d93025' },
  ACTIVATE_USER:      { label: 'Activated User',      bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
  CREATE_USER:        { label: 'Created User',        bg: '#eef2ff', color: '#3730a3', dot: '#6366f1' },
  ASSIGN_STUDENT:     { label: 'Assigned Student',    bg: '#fff8e6', color: '#92620a', dot: '#f0a500' },
  SUBMIT_REQUEST:     { label: 'Submitted Request',   bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
  SUBMIT_ENLISTMENT:  { label: 'Submitted Enlistment',bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
  APPROVE_ENLISTMENT: { label: 'Approved Enlistment', bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
  REJECT_ENLISTMENT:  { label: 'Rejected Enlistment', bg: '#fdecea', color: '#d93025', dot: '#d93025' },
};

const ROLE_STYLE: Record<ActorRole, { bg: string; color: string }> = {
  Admin:      { bg: '#eef2ff', color: '#3730a3' },
  Instructor: { bg: '#e8f5ee', color: '#1a7a3c' },
  Student:    { bg: '#fff8e6', color: '#92620a' },
};

const TABLE_LABELS: Record<TargetTable, string> = {
  Room_Requests:       'Room Requests',
  Confirmed_Schedule:  'Schedule',
  Rooms:               'Rooms',
  Users:               'Users',
  Faculty_Load_Limits: 'Load Limits',
  Student_Section:     'Student Section',
  Enlistments:         'Enlistments',
};

// All unique action types and target tables for filter dropdowns
const ALL_ACTIONS = ['All', ...Object.keys(ACTION_META)] as const;
const ALL_TABLES  = ['All', ...Object.keys(TABLE_LABELS)] as const;
const ALL_ROLES   = ['All', 'Admin', 'Instructor', 'Student'] as const;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmtDateTime(ts: string) {
  return new Date(ts).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, d2, size = 15 }: { d: string; d2?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
);
const IcoSearch   = () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const IcoFilter   = () => <Ico d="M22 3H2l8 9.46V19l4 2V12.46L22 3z" />;
const IcoShield   = () => <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const IcoInfo     = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoUser     = () => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" d2="M12 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoDatabase = () => <Ico d="M12 2C6.48 2 2 4.69 2 8s4.48 6 10 6 10-2.69 10-6-4.48-6-10-6zM2 8v8c0 3.31 4.48 6 10 6s10-2.69 10-6V8" d2="M2 12c0 3.31 4.48 6 10 6s10-2.69 10-6" />;
const IcoCheck    = () => <Ico d="M20 6L9 17l-5-5" />;
const IcoX        = () => <Ico d="M18 6L6 18M6 6l12 12" />;
const IcoDownload = () => <Ico d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const IcoChevron  = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease' }}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Avatar initials
// ─────────────────────────────────────────────────────────────
function Avatar({ name, role }: { name: string; role: ActorRole }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const s = ROLE_STYLE[role];
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: s.bg, color: s.color }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Action badge
// ─────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: ActionType }) {
  const m = ACTION_META[action];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Expandable row
// ─────────────────────────────────────────────────────────────
function AuditRowItem({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false);
  const roleStyle = ROLE_STYLE[row.actorRole];

  return (
    <div className="border-b last:border-0 transition-colors"
      style={{ borderColor: 'var(--color-border)' }}>
      {/* Main row */}
      <div
        className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
        onClick={() => setOpen(o => !o)}>

        {/* ID */}
        <span className="text-[11px] font-mono shrink-0 pt-0.5 w-10 text-right"
          style={{ color: 'var(--color-text-muted)' }}>
          #{row.id}
        </span>

        {/* Avatar */}
        <Avatar name={row.actorName} role={row.actorRole} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {row.actorName}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: roleStyle.bg, color: roleStyle.color }}>
              {row.actorRole}
            </span>
            <ActionBadge action={row.action} />
          </div>
          <p className="text-[12px] line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>
            {row.details}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              <IcoDatabase />
              {TABLE_LABELS[row.targetTable]} #{row.targetId}
            </span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              <IcoClock />
              {fmtDateTime(row.performedAt)}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <span className="shrink-0 mt-1" style={{ color: 'var(--color-text-muted)' }}>
          <IcoChevron open={open} />
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-4 pt-0 animate-fade-in">
          <div className="rounded-xl border p-4 ml-14"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              {[
                { label: 'Log ID',        value: `#${row.id}`                    },
                { label: 'Actor',         value: `${row.actorName} (${row.actorRole})` },
                { label: 'Target',        value: `${TABLE_LABELS[row.targetTable]} #${row.targetId}` },
                { label: 'Performed At',  value: fmtDateTime(row.performedAt)    },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {f.label}
                  </p>
                  <p className="text-[12.5px] font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Full details text */}
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-text-muted)' }}>
                Details
              </p>
              <p className="text-[12.5px] leading-relaxed p-3 rounded-lg"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'monospace', fontSize: '12px' }}>
                {row.details}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const [search,        setSearch]       = useState('');
  const [actionFilter,  setActionFilter] = useState<string>('All');
  const [tableFilter,   setTableFilter]  = useState<string>('All');
  const [roleFilter,    setRoleFilter]   = useState<string>('All');
  const [dateFrom,      setDateFrom]     = useState('');
  const [dateTo,        setDateTo]       = useState('');
  const [page,          setPage]         = useState(1);
  const PER_PAGE = 10;

  // Filtered
  const filtered = useMemo(() => {
    return AUDIT_LOG.filter(r => {
      if (actionFilter !== 'All' && r.action !== actionFilter)         return false;
      if (tableFilter  !== 'All' && r.targetTable !== tableFilter)     return false;
      if (roleFilter   !== 'All' && r.actorRole !== roleFilter)        return false;
      if (dateFrom && r.performedAt < dateFrom + ' 00:00:00')         return false;
      if (dateTo   && r.performedAt > dateTo   + ' 23:59:59')         return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.actorName.toLowerCase().includes(q) ||
          r.details.toLowerCase().includes(q)   ||
          r.action.toLowerCase().includes(q)     ||
          String(r.targetId).includes(q)
        );
      }
      return true;
    });
  }, [search, actionFilter, tableFilter, roleFilter, dateFrom, dateTo]);

  // Paginated
  const totalPages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setSearch(''); setActionFilter('All'); setTableFilter('All');
    setRoleFilter('All'); setDateFrom(''); setDateTo(''); setPage(1);
  }

  const hasFilters = search || actionFilter !== 'All' || tableFilter !== 'All' ||
                     roleFilter !== 'All' || dateFrom || dateTo;

  // Stats
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const todayCount  = AUDIT_LOG.filter(r => r.performedAt.startsWith(todayPrefix)).length;
  const approvals   = AUDIT_LOG.filter(r => r.action === 'APPROVE_REQUEST').length;
  const rejections  = AUDIT_LOG.filter(r => r.action === 'REJECT_REQUEST').length;

  return (
    <AppShell role="admin" userName="Admin Cruz" pageTitle="Audit Log">
      <div className="animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              Audit Log
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Immutable record of every system action. Records are never modified or deleted.
            </p>
          </div>
          <button
            onClick={() => alert('Export to CSV — connect your API')}
            className="btn btn-outline flex items-center gap-2 text-[13px] shrink-0"
            style={{ padding: '8px 16px' }}>
            <IcoDownload /> Export CSV
          </button>
        </div>

        {/* ── KPI chips ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Records',    value: AUDIT_LOG.length, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
            { label: 'Actions Today',    value: todayCount,        color: '#1a7a3c', bg: '#e8f5ee'  },
            { label: 'Approvals (All)',  value: approvals,         color: '#3730a3', bg: '#eef2ff'  },
            { label: 'Rejections (All)', value: rejections,        color: '#d93025', bg: '#fdecea'  },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3"
              style={{ padding: '12px 16px', borderLeft: `3px solid ${s.color}` }}>
              <div>
                <p className="text-[22px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="card card-body mb-4" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2 mb-3">
            <IcoFilter />
            <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>Filters</span>
            {hasFilters && (
              <button onClick={resetFilters}
                className="ml-auto flex items-center gap-1 text-[12px] font-medium"
                style={{ color: 'var(--color-error)' }}>
                <IcoX /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

            {/* Search */}
            <div className="relative xl:col-span-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }}>
                <IcoSearch />
              </span>
              <input type="search" placeholder="Search actor, details…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2.25rem', fontSize: '13px', height: '38px' }} />
            </div>

            {/* Action type */}
            <select value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(1); }}
              style={{ fontSize: '13px', height: '38px' }}>
              <option value="All">All Actions</option>
              {Object.entries(ACTION_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Target table */}
            <select value={tableFilter}
              onChange={e => { setTableFilter(e.target.value); setPage(1); }}
              style={{ fontSize: '13px', height: '38px' }}>
              <option value="All">All Tables</option>
              {Object.entries(TABLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Role */}
            <select value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              style={{ fontSize: '13px', height: '38px' }}>
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Instructor">Instructor</option>
              <option value="Student">Student</option>
            </select>

            {/* Date from */}
            <input type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              style={{ fontSize: '13px', height: '38px' }} />
          </div>

          {/* Date to on new row if needed, shown inline */}
          {dateFrom && (
            <div className="mt-3 flex items-center gap-3">
              <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                To:
              </label>
              <input type="date" value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                style={{ fontSize: '13px', height: '36px', width: '180px' }} />
              {dateTo && (
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                  {dateFrom} → {dateTo}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length === AUDIT_LOG.length
              ? `Showing all ${AUDIT_LOG.length} records`
              : `${filtered.length} of ${AUDIT_LOG.length} records match your filters`}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Page {page} of {totalPages}
          </p>
        </div>

        {/* ── Log table ── */}
        <div className="card overflow-hidden mb-4">
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wide w-10 text-right"
              style={{ color: 'var(--color-text-muted)' }}>ID</span>
            <span className="w-8 shrink-0" />
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>Actor · Action · Details</span>
            <span className="w-4 shrink-0" />
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)' }}>
                <IcoShield />
              </div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                No records match your filters
              </p>
              <button onClick={resetFilters} className="btn btn-ghost text-[12.5px]">
                Clear filters
              </button>
            </div>
          ) : (
            paginated.map(row => <AuditRowItem key={row.id} row={row} />)
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-ghost text-[12.5px]"
              style={{ padding: '6px 14px', opacity: page === 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | '…')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="text-[12px]"
                    style={{ color: 'var(--color-text-muted)' }}>…</span>
                ) : (
                  <button key={n}
                    onClick={() => setPage(n as number)}
                    className="w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all"
                    style={page === n
                      ? { background: 'var(--color-primary)', color: '#fff' }
                      : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                    {n}
                  </button>
                ),
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-ghost text-[12.5px]"
              style={{ padding: '6px 14px', opacity: page === totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}

        {/* ── Immutability notice ── */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
          <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }}>
            <IcoInfo />
          </span>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
            All audit log entries are <strong>append-only and immutable</strong>. No record in{' '}
            <code style={{ fontSize: '11px', background: 'rgba(34,160,80,.1)', padding: '1px 5px', borderRadius: '4px' }}>
              Audit_Log
            </code>{' '}
            is ever modified or deleted. Every approval, rejection, cancellation, room change,
            user action, and load limit update is permanently recorded here with the actor's identity
            and an exact timestamp.
          </p>
        </div>

      </div>
    </AppShell>
  );
}