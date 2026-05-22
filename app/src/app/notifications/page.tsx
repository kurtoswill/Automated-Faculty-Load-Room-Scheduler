'use client';

/**
 * /notifications
 *
 * Tables consumed (per Pages.pdf):
 *   Notifications — id, user_id, type, reference_table, reference_id,
 *                   message, is_read, created_at
 *   Users         — first_name, last_name, role (for session display)
 *
 * Access: All roles (Admin, Instructor, Student)
 * - Each user only sees their own notifications
 * - Mark as read individually or mark all as read
 * - Filter by type and read/unread status
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';
import type { UserRole } from '@/config/navigation/types';

// ─────────────────────────────────────────────────────────────
// Types  (mirror DB columns exactly)
// ─────────────────────────────────────────────────────────────
type NotifType =
  | 'Request_Submitted'
  | 'Request_Approved'
  | 'Request_Rejected'
  | 'Request_Cancelled'
  | 'Booking_Released'
  | 'Load_Limit_Updated'
  | 'Room_Status_Changed';

type RefTable = 'Room_Requests' | 'Rooms' | 'Faculty_Load_Limits' | 'Confirmed_Schedule';

interface Notification {
  id:              number;          // Notifications.id
  userId:          number;          // Notifications.user_id
  type:            NotifType;       // Notifications.type
  referenceTable:  RefTable;        // Notifications.reference_table
  referenceId:     number;          // Notifications.reference_id
  message:         string;          // Notifications.message
  isRead:          boolean;         // Notifications.is_read
  createdAt:       string;          // Notifications.created_at
}

// ─────────────────────────────────────────────────────────────
// Session — swap with real auth
// ─────────────────────────────────────────────────────────────
const SESSION: { name: string; role: UserRole } = {
  name: 'Dr. Maria Santos',
  role: 'instructor',
};

// ─────────────────────────────────────────────────────────────
// Mock data  (mirrors Notifications table rows for this user)
// ─────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 201, userId: 2, type: 'Request_Approved', referenceTable: 'Room_Requests', referenceId: 41,
    message: 'Your room request for CS 3101 – CS-204, Monday 07:30–09:00 AM has been approved.',
    isRead: false, createdAt: '2025-05-15 11:42:00',
  },
  {
    id: 200, userId: 2, type: 'Request_Approved', referenceTable: 'Room_Requests', referenceId: 38,
    message: 'Your room request for CS 4101 – CS-202, Tuesday 09:00–10:30 AM has been approved.',
    isRead: false, createdAt: '2025-05-13 10:15:00',
  },
  {
    id: 199, userId: 2, type: 'Load_Limit_Updated', referenceTable: 'Faculty_Load_Limits', referenceId: 2,
    message: 'Your faculty load limit has been updated by Admin Cruz. New limit: 21 units / 7 classes per semester.',
    isRead: false, createdAt: '2025-05-13 09:00:00',
  },
  {
    id: 198, userId: 2, type: 'Request_Rejected', referenceTable: 'Room_Requests', referenceId: 39,
    message: 'Your room request for GE 102 – GE-305, Thursday 13:00–14:30 PM has been rejected. Reason: Room already booked at that time slot.',
    isRead: true, createdAt: '2025-05-12 16:10:00',
  },
  {
    id: 197, userId: 2, type: 'Request_Approved', referenceTable: 'Room_Requests', referenceId: 35,
    message: 'Your room request for CS 3101 – ICT-Lab1, Wednesday 13:00–14:30 PM has been approved.',
    isRead: true, createdAt: '2025-05-09 08:30:00',
  },
  {
    id: 196, userId: 2, type: 'Booking_Released', referenceTable: 'Confirmed_Schedule', referenceId: 7,
    message: 'Booking for CS-202, Wednesday 13:00–14:30 PM (IT 3-B) has been released. The slot is now available.',
    isRead: true, createdAt: '2025-05-08 14:05:00',
  },
  {
    id: 195, userId: 2, type: 'Request_Submitted', referenceTable: 'Room_Requests', referenceId: 34,
    message: 'Room request #34 for GE 102 – GE-305, Friday 10:30–12:00 PM submitted successfully and is pending review.',
    isRead: true, createdAt: '2025-05-04 14:00:00',
  },
  {
    id: 194, userId: 2, type: 'Room_Status_Changed', referenceTable: 'Rooms', referenceId: 6,
    message: 'Room ICT-Lab3 has been marked as unavailable by the administrator. Please check your pending requests.',
    isRead: true, createdAt: '2025-05-03 09:45:00',
  },
  {
    id: 193, userId: 2, type: 'Request_Cancelled', referenceTable: 'Room_Requests', referenceId: 36,
    message: 'Room request #36 for IT 3-B – GE-305, Thursday 13:00–14:30 PM has been cancelled.',
    isRead: true, createdAt: '2025-04-30 16:00:00',
  },
  {
    id: 192, userId: 2, type: 'Request_Rejected', referenceTable: 'Room_Requests', referenceId: 32,
    message: 'Your room request for CS 4101 – GE-305, Thursday 13:00–14:30 PM has been rejected. Reason: Expected student count exceeds room capacity.',
    isRead: true, createdAt: '2025-04-28 09:00:00',
  },
];

// ─────────────────────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────────────────────
const TYPE_META: Record<NotifType, {
  label:  string;
  bg:     string;
  color:  string;
  dot:    string;
  icon:   string; // SVG path
}> = {
  Request_Approved:    { label: 'Approved',        bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050', icon: 'M20 6L9 17l-5-5' },
  Request_Rejected:    { label: 'Rejected',        bg: '#fdecea', color: '#d93025', dot: '#d93025', icon: 'M18 6L6 18M6 6l12 12' },
  Request_Submitted:   { label: 'Submitted',       bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  Request_Cancelled:   { label: 'Cancelled',       bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', dot: '#9ba3b2', icon: 'M18 6L6 18M6 6l12 12' },
  Booking_Released:    { label: 'Released',        bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9', icon: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1' },
  Load_Limit_Updated:  { label: 'Load Updated',   bg: '#eef2ff', color: '#3730a3', dot: '#6366f1', icon: 'M12 20V10M18 20V4M6 20v-4' },
  Room_Status_Changed: { label: 'Room Changed',   bg: '#fff8e6', color: '#92620a', dot: '#f0a500', icon: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9' },
};

// Where to link for each reference table
function buildHref(refTable: RefTable, refId: number): string {
  if (refTable === 'Room_Requests')      return `/requests/${refId}`;
  if (refTable === 'Confirmed_Schedule') return `/instructor/schedule`;
  if (refTable === 'Rooms')              return `/instructor/rooms`;
  if (refTable === 'Faculty_Load_Limits') return `/instructor/faculty-load`;
  return '#';
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function timeAgo(ts: string): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDateTime(ts: string): string {
  return new Date(ts).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Group notifications by date label
function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const thisWeek  = new Date(today); thisWeek.setDate(today.getDate() - 7);

  const groups: Record<string, Notification[]> = {};

  items.forEach(n => {
    const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d >= today)     label = 'Today';
    else if (d >= yesterday) label = 'Yesterday';
    else if (d >= thisWeek)  label = 'This Week';
    else {
      label = d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  const ORDER = ['Today', 'Yesterday', 'This Week'];
  return Object.entries(groups).sort(([a], [b]) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  }).map(([label, items]) => ({ label, items }));
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, d2, size = 16 }: { d: string; d2?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
);
const IcoCheck   = () => <Ico d="M20 6L9 17l-5-5" size={13} />;
const IcoSearch  = () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const IcoBell    = () => <Ico d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" size={20} />;
const IcoArrow   = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={13} />;

// ─────────────────────────────────────────────────────────────
// Notification card
// ─────────────────────────────────────────────────────────────
function NotifCard({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: number) => void;
}) {
  const meta = TYPE_META[notif.type];
  const href = buildHref(notif.referenceTable, notif.referenceId);

  return (
    <div
      className="flex items-start gap-3 px-5 py-4 transition-colors group"
      style={{
        background:   notif.isRead ? 'transparent' : 'var(--color-primary-muted)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Unread dot */}
      <div className="shrink-0 mt-1 w-2 h-2 rounded-full"
        style={{ background: notif.isRead ? 'transparent' : 'var(--color-primary)' }} />

      {/* Type icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: meta.bg, color: meta.color }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <path d={meta.icon} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: meta.bg, color: meta.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
            {meta.label}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {timeAgo(notif.createdAt)}
          </span>
          {!notif.isRead && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary)', color: '#fff' }}>
              New
            </span>
          )}
        </div>
        <p className="text-[12.5px] leading-relaxed"
          style={{ color: notif.isRead ? 'var(--color-text-secondary)' : 'var(--color-text)' }}>
          {notif.message}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {fmtDateTime(notif.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.isRead && (
          <button
            onClick={() => onRead(notif.id)}
            title="Mark as read"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-primary)', background: 'var(--color-primary-muted)' }}>
            <IcoCheck />
          </button>
        )}
        <Link
          href={href}
          title="View details"
          className="p-1.5 rounded-lg transition-colors flex items-center"
          style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)' }}>
          <IcoArrow />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [search,        setSearch]        = useState('');
  const [typeFilter,    setTypeFilter]    = useState<NotifType | 'All'>('All');
  const [readFilter,    setReadFilter]    = useState<'all' | 'unread' | 'read'>('all');

  // Derived counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Unique types present in this user's notifications
  const presentTypes = useMemo(
    () => [...new Set(notifications.map(n => n.type))],
    [notifications],
  );

  // Filtered list
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (typeFilter !== 'All' && n.type !== typeFilter)           return false;
      if (readFilter === 'unread' && n.isRead)                     return false;
      if (readFilter === 'read'   && !n.isRead)                    return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!n.message.toLowerCase().includes(q) &&
            !TYPE_META[n.type].label.toLowerCase().includes(q))    return false;
      }
      return true;
    });
  }, [notifications, typeFilter, readFilter, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Actions
  function markRead(id: number) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n),
    );
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  return (
    <AppShell role={SESSION.role} userName={SESSION.name} pageTitle="Notifications">
      <div className="animate-fade-in max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              Notifications
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'Youre all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn btn-outline flex items-center gap-2 text-[12.5px] shrink-0"
              style={{ padding: '7px 14px' }}>
              <IcoCheck /> Mark all as read
            </button>
          )}
        </div>

        {/* ── KPI chips ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total',  value: notifications.length, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
            { label: 'Unread', value: unreadCount,           color: 'var(--color-primary)',         bg: 'var(--color-primary-muted)' },
            { label: 'Read',   value: notifications.length - unreadCount, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' },
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
        <div className="card card-body mb-4 flex flex-wrap gap-3 items-center"
          style={{ padding: '12px 16px' }}>

          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: '180px' }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}>
              <IcoSearch />
            </span>
            <input type="search" placeholder="Search notifications…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '13px', height: '36px' }} />
          </div>

          {/* Read status pills */}
          <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--color-surface-2)' }}>
            {(['all', 'unread', 'read'] as const).map(f => (
              <button key={f}
                onClick={() => setReadFilter(f)}
                className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize"
                style={readFilter === f
                  ? { background: 'var(--color-surface)', color: 'var(--color-primary)', boxShadow: 'var(--shadow-xs)' }
                  : { background: 'transparent', color: 'var(--color-text-muted)' }}>
                {f}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as NotifType | 'All')}
            style={{ fontSize: '13px', height: '36px', minWidth: '160px' }}>
            <option value="All">All Types</option>
            {presentTypes.map(t => (
              <option key={t} value={t}>{TYPE_META[t].label}</option>
            ))}
          </select>
        </div>

        {/* ── Notification list ── */}
        {grouped.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
              <IcoBell />
            </div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No notifications found
            </p>
            <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {grouped.map((group, gi) => (
              <div key={group.label}>
                {/* Date group header */}
                <div className="px-5 py-2.5 border-b"
                  style={{
                    background:   'var(--color-surface-2)',
                    borderColor:  'var(--color-border)',
                  }}>
                  <span className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {group.label}
                  </span>
                  <span className="ml-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    · {group.items.length} notification{group.items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Notification rows */}
                {group.items.map(n => (
                  <NotifCard key={n.id} notif={n} onRead={markRead} />
                ))}
              </div>
            ))}

            {/* Last row: result count */}
            <div className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
              <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                {filtered.length} of {notifications.length} notifications
              </p>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                  style={{ color: 'var(--color-primary-light)', background: 'none', border: 'none' }}>
                  <IcoCheck /> Mark all read
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Info note ── */}
        <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="1.85" strokeLinecap="round"
            className="shrink-0 mt-0.5">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
            Notifications are generated automatically by the system at key workflow events —
            request approvals, rejections, load limit changes, and room status updates.
            Click <strong>View details</strong> on any notification to go directly to the referenced record.
          </p>
        </div>

      </div>
    </AppShell>
  );
}