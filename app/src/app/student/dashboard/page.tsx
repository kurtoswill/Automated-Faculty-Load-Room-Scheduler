'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type StudentType  = 'regular' | 'irregular';
type EnlistStatus = 'Pending' | 'Approved' | 'Rejected';

interface ScheduleClass {
  id:         string;
  subject:    string;
  code:       string;
  instructor: string;
  room:       string;
  building:   string;
  day:        string;
  time:       string;
  type:       'Lecture' | 'Lab';
  isToday:    boolean;
}

interface EnlistRow {
  id:          string;
  subject:     string;
  code:        string;
  instructor:  string;
  initials:    string;
  room:        string;
  schedule:    string;
  status:      EnlistStatus;
  submittedAt: string;
  remarks?:    string;
}

// ─────────────────────────────────────────────────────────────
// Config — swap with session/auth data
// ─────────────────────────────────────────────────────────────
const STUDENT_TYPE:   StudentType = 'irregular'; // change to 'regular' for regular view
const STUDENT_NAME    = 'Carlo Reyes';
const STUDENT_ID      = '2021-00123';
const STUDENT_COURSE  = 'BSCS — 3rd Year';

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const MY_SCHEDULE: ScheduleClass[] = [
  { id: 'S1', subject: 'Data Structures',     code: 'CMSC 101', instructor: 'Dr. Maria Santos',     room: 'Room 204', building: 'Main', day: 'Mon/Wed/Fri', time: '07:30–09:00', type: 'Lecture', isToday: true  },
  { id: 'S2', subject: 'Algorithm Analysis',  code: 'CS 401',   instructor: 'Dr. Luz Mendoza',      room: 'Room 202', building: 'Main', day: 'Tue/Thu',     time: '09:00–10:30', type: 'Lecture', isToday: true  },
  { id: 'S3', subject: 'Web Development',     code: 'IT 301',   instructor: 'Prof. Juan dela Cruz', room: 'Lab 1',    building: 'ICT',  day: 'Mon/Wed',     time: '13:00–14:30', type: 'Lab',     isToday: false },
  { id: 'S4', subject: 'Technical Writing',   code: 'ENGL 102', instructor: 'Prof. Ben Torres',     room: 'Room 305', building: 'Main', day: 'Fri',         time: '10:30–12:00', type: 'Lecture', isToday: false },
];

const MY_ENLISTMENTS: EnlistRow[] = [
  { id: 'EN-014', subject: 'Software Engineering', code: 'CS 402',   instructor: 'Dr. Ana Reyes',      initials: 'AR', room: 'Room 305', schedule: 'Fri · 10:30–12:00',        status: 'Pending',  submittedAt: '2h ago'  },
  { id: 'EN-011', subject: 'Operating Systems',    code: 'CS 303',   instructor: 'Prof. dela Cruz',    initials: 'JD', room: 'Room 202', schedule: 'Tue/Thu · 13:00–14:30',     status: 'Approved', submittedAt: '1d ago'  },
  { id: 'EN-009', subject: 'Discrete Math',        code: 'MATH 301', instructor: 'Dr. Maria Santos',  initials: 'MS', room: 'Room 104', schedule: 'Mon/Wed · 09:00–10:30',     status: 'Rejected', submittedAt: '3d ago', remarks: 'Class is already at full capacity.' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, size = 15 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IcoArrow    = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={13} />;
const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" size={14} />;
const IcoRoom     = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9" size={14} />;
const IcoUser     = () => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8" size={14} />;
const IcoBook     = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M4 19.5V21" size={14} />;
const IcoPlus     = () => <Ico d="M12 5v14M5 12h14" size={14} />;
const IcoCalendar = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={15} />;
const IcoID       = () => <Ico d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" size={15} />;
const IcoAlert    = () => <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" size={14} />;
const IcoX        = () => <Ico d="M18 6L6 18M6 6l12 12" size={13} />;
const IcoFlask    = () => <Ico d="M9 3h6M10 3v5l-3.5 7A3 3 0 009.5 21h5a3 3 0 002.96-6L14 8V3" size={13} />;
const IcoCheck    = () => <Ico d="M20 6L9 17l-5-5" size={13} />;

// ─────────────────────────────────────────────────────────────
// Shared pieces
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: EnlistStatus }) {
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

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ width: size, height: size, background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
      {initials}
    </div>
  );
}

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

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg, iconColor, accent, href }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
  accent?: string; href?: string;
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
// Today class card
// ─────────────────────────────────────────────────────────────
function TodayCard({ cls }: { cls: ScheduleClass }) {
  const isLab = cls.type === 'Lab';
  return (
    <div className="card p-4 flex flex-col gap-2.5 hover:-translate-y-px transition-transform duration-150"
      style={{ borderLeft: `3px solid ${isLab ? '#6366f1' : 'var(--color-primary-light)'}` }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
            {cls.subject}
          </p>
          <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>{cls.code}</p>
        </div>
        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
          style={isLab
            ? { background: '#eef2ff', color: '#3730a3' }
            : { background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
          {isLab ? <><IcoFlask /> Lab</> : 'Lecture'}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoClock /> {cls.time}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoRoom /> {cls.room} · {cls.building} Bldg
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoUser /> {cls.instructor}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Weekly grid
// ─────────────────────────────────────────────────────────────
function WeekGrid() {
  const today = 'Mon';
  const dayMap: Record<string, ScheduleClass[]> = {};
  DAYS.forEach(d => { dayMap[d] = []; });
  MY_SCHEDULE.forEach(cls => {
    cls.day.split('/').forEach(d => { if (dayMap[d]) dayMap[d].push(cls); });
  });

  return (
    <div className="grid grid-cols-5 gap-2">
      {DAYS.map(day => {
        const isToday = day === today;
        const classes = dayMap[day];
        return (
          <div key={day} className="flex flex-col gap-1.5">
            <div className="flex justify-center">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={isToday
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-muted)' }}>
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
                <div key={c.id} className="rounded-lg p-2 flex flex-col gap-0.5"
                  style={{
                    background: c.type === 'Lab' ? '#eef2ff' : 'var(--color-primary-muted)',
                    borderLeft: `2px solid ${c.type === 'Lab' ? '#6366f1' : 'var(--color-primary-light)'}`,
                  }}>
                  <p className="text-[10.5px] font-semibold leading-tight"
                    style={{ color: c.type === 'Lab' ? '#3730a3' : 'var(--color-primary)' }}>
                    {c.code}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {c.time.split('–')[0]}
                  </p>
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
// Enlistment card
// ─────────────────────────────────────────────────────────────
function EnlistCard({ e }: { e: EnlistRow }) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar initials={e.initials} size={34} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--color-text)' }}>
              {e.subject}
            </p>
            <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>{e.code}</p>
          </div>
        </div>
        <StatusBadge status={e.status} />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoUser /> {e.instructor}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoRoom /> {e.room}
        </div>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          <IcoClock /> {e.schedule}
        </div>
      </div>

      {/* Rejection remark */}
      {e.status === 'Rejected' && e.remarks && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <span className="shrink-0 mt-0.5"><IcoAlert /></span>
          <p className="text-[11.5px] leading-snug">{e.remarks}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t"
        style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {e.id} · {e.submittedAt}
        </span>
        {e.status === 'Pending' && (
          <button className="flex items-center gap-1 text-[11.5px] font-medium transition-colors"
            style={{ color: 'var(--color-error)' }}>
            <IcoX /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Student ID chip
// ─────────────────────────────────────────────────────────────
function IDChip() {
  const isIrregular = STUDENT_TYPE === 'irregular';
  const initials = STUDENT_NAME.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="card flex items-center gap-4"
      style={{ padding: '14px 20px', boxShadow: 'var(--shadow-sm)' }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
        style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
          {STUDENT_NAME}
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {STUDENT_ID} · {STUDENT_COURSE}
        </p>
      </div>
      <span className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0"
        style={isIrregular
          ? { background: '#fff8e6', color: '#92620a' }
          : { background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
        {isIrregular ? 'Irregular' : 'Regular'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [scheduleTab, setScheduleTab] = useState<'today' | 'week'>('today');

  const isIrregular   = STUDENT_TYPE === 'irregular';
  const todayClasses  = MY_SCHEDULE.filter(c => c.isToday);
  const pendingCount  = MY_ENLISTMENTS.filter(e => e.status === 'Pending').length;
  const approvedCount = MY_ENLISTMENTS.filter(e => e.status === 'Approved').length;
  const rejectedCount = MY_ENLISTMENTS.filter(e => e.status === 'Rejected').length;

  return (
    <AppShell role="student" userName={STUDENT_NAME} pageTitle="Dashboard">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
            Good morning, Carlo 👋
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Thursday, May 15, 2025 · You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today.
          </p>
        </div>
        {isIrregular && (
          <Link href="/student/classes"
            className="btn btn-primary shrink-0 flex items-center gap-2 text-[13px]"
            style={{ padding: '9px 18px' }}>
            <IcoPlus /> Browse Classes
          </Link>
        )}
      </div>

      {/* ── ID Chip ── */}
      <div className="mb-5">
        <IDChip />
      </div>

      {/* ── KPI Cards ── */}
      <div className={`grid gap-4 mb-6 ${isIrregular ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
        <StatCard
          label="Classes Today"
          value={todayClasses.length}
          sub="On your schedule"
          icon={<IcoCalendar />}
          iconBg="#e8f5ee" iconColor="#1a7a3c"
          accent="#22a050"
          href="/student/schedule"
        />
        <StatCard
          label="Total Subjects"
          value={MY_SCHEDULE.length}
          sub="This semester"
          icon={<IcoBook />}
          iconBg="#eef2ff" iconColor="#3730a3"
          accent="#6366f1"
          href="/student/schedule"
        />
        {isIrregular ? (
          <>
            <StatCard
              label="Pending Enlistments"
              value={pendingCount}
              sub="Awaiting instructor approval"
              icon={<Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12v4M10 14h4" />}
              iconBg="#fff8e6" iconColor="#92620a"
              accent="#f0a500"
              href="/student/enlistments"
            />
            <StatCard
              label="Approved Enlistments"
              value={approvedCount}
              sub="Confirmed this semester"
              icon={<IcoCheck />}
              iconBg="#e8f5ee" iconColor="#1a7a3c"
              accent="#22a050"
              href="/student/enlistments"
            />
          </>
        ) : (
          <StatCard
            label="Student ID"
            value={STUDENT_ID}
            sub="Present this for attendance"
            icon={<IcoID />}
            iconBg="#fff8e6" iconColor="#92620a"
            accent="#f0a500"
          />
        )}
      </div>

      {/* ── Schedule card ── */}
      <div className="card mb-5">
        <div className="card-body pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>My Schedule</h2>
              <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                {scheduleTab === 'today' ? 'Thursday, May 15' : 'Week of May 13–17'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Tab toggle */}
              <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--color-surface-2)' }}>
                {(['today', 'week'] as const).map(t => (
                  <button key={t} onClick={() => setScheduleTab(t)}
                    className="px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-150"
                    style={scheduleTab === t ? {
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      boxShadow: 'var(--shadow-xs)',
                    } : { background: 'transparent', color: 'var(--color-text-muted)' }}>
                    {t === 'today' ? 'Today' : 'This Week'}
                  </button>
                ))}
              </div>
              <Link href="/student/schedule"
                className="flex items-center gap-1 text-[12px] font-medium"
                style={{ color: 'var(--color-primary-light)' }}>
                Full <IcoArrow />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {scheduleTab === 'today' ? (
            todayClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayClasses.map(cls => <TodayCard key={cls.id} cls={cls} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface-2)' }}>
                  <IcoCalendar />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No classes today
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Enjoy your free day!</p>
              </div>
            )
          ) : (
            <WeekGrid />
          )}
        </div>
      </div>

      {/* ── Full subject table ── */}
      <div className="card mb-5">
        <div className="card-body pb-2">
          <SectionHeader
            title="All Enrolled Subjects"
            sub="This semester's official schedule"
            href="/student/schedule"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Day & Time</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {MY_SCHEDULE.map(cls => (
                <tr key={cls.id}>
                  <td>
                    <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-text)' }}>{cls.subject}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{cls.code}</p>
                  </td>
                  <td className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{cls.instructor}</td>
                  <td>
                    <p className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{cls.room}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{cls.building} Bldg</p>
                  </td>
                  <td>
                    <p className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{cls.day}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{cls.time}</p>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={cls.type === 'Lab'
                        ? { background: '#eef2ff', color: '#3730a3' }
                        : { background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                      {cls.type === 'Lab' ? <><IcoFlask /> Lab</> : 'Lecture'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Irregular-only: Enlistments ── */}
      {isIrregular && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                My Enlistment Requests
              </h2>
              <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                {pendingCount} pending · {approvedCount} approved
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/student/enlistments"
                className="flex items-center gap-1 text-[12px] font-medium"
                style={{ color: 'var(--color-primary-light)' }}>
                View all <IcoArrow />
              </Link>
              <Link href="/student/classes"
                className="btn btn-primary text-[12.5px]"
                style={{ padding: '7px 14px' }}>
                <IcoPlus /> Enlist
              </Link>
            </div>
          </div>

          {/* Status summary chips */}
          <div className="flex gap-3 mb-4 flex-wrap">
            {[
              { label: 'Pending',  count: pendingCount,  bg: '#fff8e6', color: '#92620a' },
              { label: 'Approved', count: approvedCount, bg: '#e8f5ee', color: '#1a7a3c' },
              { label: 'Rejected', count: rejectedCount, bg: '#fdecea', color: '#d93025' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: s.bg }}>
                <span className="text-[18px] font-bold" style={{ color: s.color }}>{s.count}</span>
                <span className="text-[12px] font-medium" style={{ color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Enlistment cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MY_ENLISTMENTS.map(e => <EnlistCard key={e.id} e={e} />)}
          </div>

          {/* Irregular reminder */}
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border"
            style={{ background: '#fff8e6', borderColor: 'rgba(240,165,0,.25)', color: '#92620a' }}>
            <span className="shrink-0 mt-0.5"><IcoAlert /></span>
            <div>
              <p className="text-[13px] font-semibold">Irregular student reminder</p>
              <p className="text-[12px] mt-0.5" style={{ color: '#a07030' }}>
                You may only enlist in <strong>one section per subject</strong>. Enlistment is subject to
                instructor approval and room capacity. Once approved, the Admin/Dean will be notified.
              </p>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}