'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type RequestStatus  = 'Pending' | 'Approved' | 'Rejected';
type EnlistStatus   = 'Pending' | 'Approved' | 'Rejected';

interface ScheduleClass {
  id:       string;
  subject:  string;
  code:     string;
  room:     string;
  building: string;
  day:      string;
  time:     string;
  students: number;
  capacity: number;
  isToday:  boolean;
}

interface RequestRow {
  id:      string;
  subject: string;
  room:    string;
  date:    string;
  time:    string;
  count:   number;
  status:  RequestStatus;
  remarks?: string;
}

interface EnlistRow {
  student:  string;
  initials: string;
  id:       string;
  subject:  string;
  type:     string;
  status:   EnlistStatus;
  time:     string;
}

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const MY_SCHEDULE: ScheduleClass[] = [
  { id: 'S1', subject: 'Data Structures',   code: 'CMSC 101', room: 'Room 204',  building: 'Main',  day: 'Mon/Wed/Fri', time: '07:30–09:00', students: 38, capacity: 40, isToday: true  },
  { id: 'S2', subject: 'Algorithm Analysis',code: 'CS 401',   room: 'Room 202',  building: 'Main',  day: 'Tue/Thu',     time: '09:00–10:30', students: 22, capacity: 40, isToday: true  },
  { id: 'S3', subject: 'Web Development',   code: 'IT 301',   room: 'Lab 1',     building: 'ICT',   day: 'Mon/Wed',     time: '13:00–14:30', students: 30, capacity: 30, isToday: false },
  { id: 'S4', subject: 'Software Engineering',code:'CS 402',  room: 'Room 305',  building: 'Main',  day: 'Fri',         time: '10:30–12:00', students: 25, capacity: 35, isToday: false },
];

const MY_REQUESTS: RequestRow[] = [
  { id: 'RQ-041', subject: 'CMSC 101 — Data Structures',      room: 'Room 204', date: 'May 16', time: '07:30–09:00', count: 38, status: 'Pending'  },
  { id: 'RQ-038', subject: 'CS 401 — Algorithm Analysis',     room: 'Room 202', date: 'May 14', time: '09:00–10:30', count: 22, status: 'Approved' },
  { id: 'RQ-035', subject: 'IT 301 — Web Development',        room: 'Lab 1',    date: 'May 12', time: '13:00–14:30', count: 30, status: 'Approved' },
  { id: 'RQ-032', subject: 'CS 402 — Software Engineering',   room: 'Room 101', date: 'May 10', time: '10:30–12:00', count: 25, status: 'Rejected', remarks: 'Room at capacity for that slot.' },
];

const ENLIST_REQUESTS: EnlistRow[] = [
  { student: 'Carlo Reyes',  initials: 'CR', id: '2021-00123', subject: 'CMSC 101', type: 'Irregular', status: 'Pending',  time: '2h ago'  },
  { student: 'Sofia Garcia', initials: 'SG', id: '2021-00456', subject: 'CS 401',   type: 'Irregular', status: 'Pending',  time: '5h ago'  },
  { student: 'Marco Lim',    initials: 'ML', id: '2020-00789', subject: 'CMSC 101', type: 'Irregular', status: 'Approved', time: '1d ago'  },
  { student: 'Nina Flores',  initials: 'NF', id: '2021-00321', subject: 'IT 301',   type: 'Irregular', status: 'Rejected', time: '2d ago'  },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ─────────────────────────────────────────────────────────────
// Inline Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IcoArrow    = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={13} />;
const IcoRoom     = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9" size={15} />;
const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" size={14} />;
const IcoUsers    = () => <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" size={15} />;
const IcoCalendar = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={15} />;
const IcoBar      = () => <Ico d="M12 20V10M18 20V4M6 20v-4" size={15} />;
const IcoPlus     = () => <Ico d="M12 5v14M5 12h14" size={15} />;
const IcoCheck    = () => <Ico d="M20 6L9 17l-5-5" size={13} />;
const IcoX        = () => <Ico d="M18 6L6 18M6 6l12 12" size={13} />;
const IcoAlert    = () => <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" size={14} />;

// ─────────────────────────────────────────────────────────────
// Reusable pieces
// ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, href }: { title: string; sub?: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        {sub && <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
      <Link href={href} className="flex items-center gap-1 text-[12px] font-medium"
        style={{ color: 'var(--color-primary-light)' }}>
        View all <IcoArrow />
      </Link>
    </div>
  );
}

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ width: size, height: size, background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus | EnlistStatus }) {
  const map = {
    Pending:  { bg: '#fff8e6', color: '#92620a', dot: '#f0a500' },
    Approved: { bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050' },
    Rejected: { bg: '#fdecea', color: '#d93025', dot: '#d93025' },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI Stat Card
// ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, iconBg, iconColor, href, accent,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
  href?: string; accent?: string;
}) {
  const inner = (
    <div className="card card-body h-full flex flex-col gap-3 hover:-translate-y-px transition-transform duration-150"
      style={{ boxShadow: 'var(--shadow-sm)', borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div>
        <p className="text-[26px] font-bold leading-none mb-1" style={{ color: iconColor }}>{value}</p>
        <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
        <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

// ─────────────────────────────────────────────────────────────
// Faculty Load Ring
// ─────────────────────────────────────────────────────────────
function LoadRing({ current, max }: { current: number; max: number }) {
  const pct     = Math.min(current / max, 1);
  const r       = 44;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - pct);
  const color   = pct >= 1 ? '#d93025' : pct >= 0.8 ? '#f0a500' : '#22a050';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90" style={{ display: 'block' }}>
          <circle cx="56" cy="56" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="10" />
          <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] font-bold leading-none" style={{ color }}>{current}</p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>of {max} u</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
          {max - current > 0 ? `${max - current} units remaining` : 'At maximum load'}
        </p>
        <p className="text-[11.5px]" style={{ color }}>
          {Math.round(pct * 100)}% utilized
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Today's Schedule strip
// ─────────────────────────────────────────────────────────────
function TodayCard({ cls }: { cls: ScheduleClass }) {
  const fillPct = Math.round((cls.students / cls.capacity) * 100);
  const full    = fillPct >= 100;
  return (
    <div className="card p-4 flex flex-col gap-2.5 hover:-translate-y-px transition-transform duration-150"
      style={{ borderLeft: '3px solid var(--color-primary-light)' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
            {cls.subject}
          </p>
          <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>{cls.code}</p>
        </div>
        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
          Today
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoClock /> {cls.time}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoRoom /> {cls.room} · {cls.building}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: full ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
          <IcoUsers /> {cls.students}/{cls.capacity} students {full && '· Full'}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Weekly mini-schedule grid
// ─────────────────────────────────────────────────────────────
function WeekGrid() {
  const today = 'Mon';

  // Build simple day → classes map
  const dayMap: Record<string, ScheduleClass[]> = {};
  DAYS.forEach(d => { dayMap[d] = []; });
  MY_SCHEDULE.forEach(cls => {
    cls.day.split('/').forEach(d => {
      if (dayMap[d]) dayMap[d].push(cls);
    });
  });

  return (
    <div className="grid grid-cols-5 gap-2">
      {DAYS.map(day => {
        const isToday = day === today;
        const classes = dayMap[day];
        return (
          <div key={day} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-center">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={isToday
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-muted)' }}
              >
                {day}
              </span>
            </div>
            {classes.length === 0 ? (
              <div className="h-14 rounded-lg border border-dashed flex items-center justify-center"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Free</span>
              </div>
            ) : (
              classes.map(c => (
                <div key={c.id}
                  className="rounded-lg p-2 flex flex-col gap-0.5"
                  style={{ background: 'var(--color-primary-muted)', borderLeft: '2px solid var(--color-primary-light)' }}>
                  <p className="text-[10.5px] font-semibold leading-tight" style={{ color: 'var(--color-primary)' }}>
                    {c.code}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{c.time.split('–')[0]}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{c.room}</p>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const [enlistTab, setEnlistTab] = useState<'all' | 'pending'>('pending');

  const pendingEnlist   = ENLIST_REQUESTS.filter(e => e.status === 'Pending');
  const filteredEnlist  = enlistTab === 'pending' ? pendingEnlist : ENLIST_REQUESTS;
  const pendingRequests = MY_REQUESTS.filter(r => r.status === 'Pending').length;

  return (
    <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="Dashboard">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
            Good morning, Dr. Santos 👋
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Thursday, May 15, 2025 · You have {MY_SCHEDULE.filter(c => c.isToday).length} classes today.
          </p>
        </div>
        <Link href="/requests/create"
          className="btn btn-primary shrink-0 flex items-center gap-2 text-[13px]"
          style={{ padding: '9px 18px' }}>
          <IcoPlus /> Request Room
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Classes Today"
          value={MY_SCHEDULE.filter(c => c.isToday).length}
          sub="Confirmed & scheduled"
          icon={<IcoCalendar />}
          iconBg="#e8f5ee" iconColor="#1a7a3c"
          accent="#22a050"
          href="/schedule"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          sub="Awaiting admin approval"
          icon={<Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12v4M10 14h4" size={15} />}
          iconBg="#fff8e6" iconColor="#92620a"
          accent="#f0a500"
          href="/requests"
        />
        <StatCard
          label="Enlistment Requests"
          value={pendingEnlist.length}
          sub="From irregular students"
          icon={<IcoUsers />}
          iconBg="#eef2ff" iconColor="#3730a3"
          accent="#6366f1"
          href="/enlistments"
        />
        <StatCard
          label="Total Students"
          value={MY_SCHEDULE.reduce((a, c) => a + c.students, 0)}
          sub="Across all classes"
          icon={<IcoBar />}
          iconBg="#fdecea" iconColor="#9b1c1c"
          accent="#ef4444"
        />
      </div>

      {/* ── Row 2: Load ring + Today's classes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Faculty Load */}
        <div className="card card-body flex flex-col gap-4">
          <div>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>Faculty Load</h2>
            <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>This semester</p>
          </div>

          <div className="flex justify-center">
            <LoadRing current={21} max={24} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Breakdown */}
          <div className="flex flex-col gap-2">
            {MY_SCHEDULE.map(cls => (
              <div key={cls.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-primary-light)' }} />
                  <span className="text-[12px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {cls.code} — {cls.subject}
                  </span>
                </div>
                <span className="text-[11.5px] font-semibold shrink-0 ml-2" style={{ color: 'var(--color-primary)' }}>
                  3u
                </span>
              </div>
            ))}
          </div>

          <Link href="/instructor/faculty-load"
            className="btn btn-outline btn-full text-[12.5px] mt-1"
            style={{ padding: '8px 14px' }}>
            View Full Load Summary
          </Link>
        </div>

        {/* Today's classes */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>Today's Classes</h2>
              <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>Thursday, May 15</p>
            </div>
            <Link href="/instructor/schedule" className="flex items-center gap-1 text-[12px] font-medium"
              style={{ color: 'var(--color-primary-light)' }}>
              Full schedule <IcoArrow />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MY_SCHEDULE.filter(c => c.isToday).map(cls => (
              <TodayCard key={cls.id} cls={cls} />
            ))}
          </div>

          {/* Weekly overview */}
          <div className="card card-body mt-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>This Week</h3>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>May 13–17</span>
            </div>
            <WeekGrid />
          </div>
        </div>
      </div>

      {/* ── Row 3: Room Requests + Enlistment Requests ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Room Requests */}
        <div className="card">
          <div className="card-body pb-2">
            <SectionHeader title="My Room Requests" sub="Recent submissions" href="/requests" />
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MY_REQUESTS.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-text)' }}>
                        {r.subject.split('—')[0].trim()}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{r.id}</p>
                    </td>
                    <td>
                      <p className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{r.room}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{r.time}</p>
                    </td>
                    <td className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{r.date}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={r.status} />
                        {r.remarks && (
                          <p className="text-[10.5px]" style={{ color: 'var(--color-text-muted)' }}>
                            {r.remarks}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Irregular Enlistment Requests */}
        <div className="card">
          <div className="card-body pb-2">
            {/* Header + tab toggle */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                  Enlistment Requests
                </h2>
                <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>From irregular students</p>
              </div>
              <Link href="/enlistments" className="flex items-center gap-1 text-[12px] font-medium"
                style={{ color: 'var(--color-primary-light)' }}>
                View all <IcoArrow />
              </Link>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-lg p-0.5 gap-0.5 mb-4"
              style={{ background: 'var(--color-surface-2)' }}>
              {(['pending', 'all'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setEnlistTab(t)}
                  className="flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-150"
                  style={enlistTab === t ? {
                    background: 'var(--color-surface)',
                    color: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-xs)',
                  } : {
                    background: 'transparent',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {t === 'pending'
                    ? `Pending (${pendingEnlist.length})`
                    : `All (${ENLIST_REQUESTS.length})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filteredEnlist.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    No pending enlistment requests.
                  </p>
                </div>
              )}
              {filteredEnlist.map((e, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <Avatar initials={e.initials} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                        {e.student}
                      </p>
                      <span className="text-[10.5px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: '#eef2ff', color: '#3730a3' }}>
                        {e.type}
                      </span>
                    </div>
                    <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                      {e.id} · {e.subject}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{e.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {e.status === 'Pending' ? (
                      <div className="flex gap-1.5">
                        <button
                          className="flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ background: '#e8f5ee', color: '#1a7a3c' }}>
                          <IcoCheck /> Approve
                        </button>
                        <button
                          className="flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                          <IcoX /> Reject
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={e.status} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Load warning banner ── */}
      <div
        className="mt-5 flex items-start gap-3 p-4 rounded-xl border"
        style={{
          background:  '#fff8e6',
          borderColor: 'rgba(240,165,0,.25)',
          color:       '#92620a',
        }}>
        <span className="shrink-0 mt-0.5"><IcoAlert /></span>
        <div>
          <p className="text-[13px] font-semibold">Load limit approaching</p>
          <p className="text-[12px] mt-0.5" style={{ color: '#a07030' }}>
            You are at <strong>21 of 24 units</strong>. Submitting more room requests may be blocked once you reach your maximum load limit set by the administrator.
          </p>
        </div>
      </div>

    </AppShell>
  );
}