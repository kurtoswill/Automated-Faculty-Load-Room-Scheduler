'use client';

/**
 * /instructor/schedule
 *
 * Tables consumed (per Pages.pdf):
 *   Confirmed_Schedule — request_id, section_id, room_id, instructor_id,
 *                        day_of_week, time_start, time_end, is_active, confirmed_at
 *   Sections           — section_name, semester, year_level, expected_students,
 *                        course_id, status
 *   Courses            — course_code, course_title, units, dept_id
 *   Rooms              — room_number, building, capacity, type_id → Room_Types.name
 *
 * Access: Instructor (read-only — own confirmed schedule only)
 * Data source: Confirmed_Schedule WHERE instructor_id = session.id AND is_active = TRUE
 * Release action links back to /requests/[id] (approved request detail)
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types  (mirror joined DB columns exactly)
// ─────────────────────────────────────────────────────────────
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
type ViewMode  = 'week' | 'list' | 'day';

// Joined: Confirmed_Schedule + Sections + Courses + Rooms + Room_Types
interface ConfirmedClass {
  // Confirmed_Schedule
  scheduleId:       number;
  requestId:        number;   // link to /requests/[id]
  dayOfWeek:        DayOfWeek;
  timeStart:        string;   // HH:MM
  timeEnd:          string;
  isActive:         boolean;
  confirmedAt:      string;
  // Sections
  sectionId:        number;
  sectionName:      string;   // e.g. BSCS 3-A
  semester:         string;
  yearLevel:        number;
  expectedStudents: number;
  // Courses
  courseCode:       string;
  courseTitle:      string;
  units:            number;
  deptCode:         string;
  // Rooms + Room_Types
  roomNumber:       string;
  building:         string;
  roomCapacity:     number;
  roomType:         string;
}

// ─────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────
const SESSION = {
  name:       'Dr. Maria Santos',
  employeeId: 'EMP-2019-004',
  dept:       'Department of Computer Science',
  semester:   '2025-2026 1st Sem',
};

// ─────────────────────────────────────────────────────────────
// Mock data  (mirrors DB join)
// ─────────────────────────────────────────────────────────────
const SCHEDULE: ConfirmedClass[] = [
  {
    scheduleId: 1, requestId: 38,
    dayOfWeek: 'Monday', timeStart: '07:30', timeEnd: '09:00',
    isActive: true, confirmedAt: '2025-05-11 10:15:00',
    sectionId: 1, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, expectedStudents: 38,
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, deptCode: 'DCS',
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
  },
  {
    scheduleId: 2, requestId: 38,
    dayOfWeek: 'Wednesday', timeStart: '07:30', timeEnd: '09:00',
    isActive: true, confirmedAt: '2025-05-11 10:15:00',
    sectionId: 1, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, expectedStudents: 38,
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, deptCode: 'DCS',
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
  },
  {
    scheduleId: 3, requestId: 38,
    dayOfWeek: 'Friday', timeStart: '07:30', timeEnd: '09:00',
    isActive: true, confirmedAt: '2025-05-11 10:15:00',
    sectionId: 1, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, expectedStudents: 38,
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, deptCode: 'DCS',
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
  },
  {
    scheduleId: 4, requestId: 35,
    dayOfWeek: 'Tuesday', timeStart: '09:00', timeEnd: '10:30',
    isActive: true, confirmedAt: '2025-05-09 08:30:00',
    sectionId: 2, sectionName: 'BSCS 4-A', semester: '2025-2026 1st Sem',
    yearLevel: 4, expectedStudents: 25,
    courseCode: 'CS 4101', courseTitle: 'Software Engineering', units: 3.0, deptCode: 'DCS',
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
  },
  {
    scheduleId: 5, requestId: 35,
    dayOfWeek: 'Thursday', timeStart: '09:00', timeEnd: '10:30',
    isActive: true, confirmedAt: '2025-05-09 08:30:00',
    sectionId: 2, sectionName: 'BSCS 4-A', semester: '2025-2026 1st Sem',
    yearLevel: 4, expectedStudents: 25,
    courseCode: 'CS 4101', courseTitle: 'Software Engineering', units: 3.0, deptCode: 'DCS',
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
  },
  {
    scheduleId: 6, requestId: 41,
    dayOfWeek: 'Monday', timeStart: '13:00', timeEnd: '14:30',
    isActive: true, confirmedAt: '2025-05-12 09:00:00',
    sectionId: 3, sectionName: 'BSCS 3-B', semester: '2025-2026 1st Sem',
    yearLevel: 3, expectedStudents: 35,
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, deptCode: 'DCS',
    roomNumber: 'GE-305', building: 'Main Building', roomCapacity: 50, roomType: 'Lecture',
  },
  {
    scheduleId: 7, requestId: 41,
    dayOfWeek: 'Wednesday', timeStart: '13:00', timeEnd: '14:30',
    isActive: true, confirmedAt: '2025-05-12 09:00:00',
    sectionId: 3, sectionName: 'BSCS 3-B', semester: '2025-2026 1st Sem',
    yearLevel: 3, expectedStudents: 35,
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, deptCode: 'DCS',
    roomNumber: 'GE-305', building: 'Main Building', roomCapacity: 50, roomType: 'Lecture',
  },
];

// ─────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────
const DAY_ORDER: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
};

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Group by courseCode + sectionId — collapses MWF into one "subject"
function groupBySubject(rows: ConfirmedClass[]) {
  const map = new Map<string, { data: ConfirmedClass; days: DayOfWeek[] }>();
  rows.forEach(r => {
    const key = `${r.courseCode}-${r.sectionId}`;
    if (!map.has(key)) map.set(key, { data: r, days: [] });
    const g = map.get(key)!;
    if (!g.days.includes(r.dayOfWeek)) g.days.push(r.dayOfWeek);
  });
  return Array.from(map.values()).map(g => ({
    ...g.data,
    days: g.days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
  }));
}

// Deterministic color per courseCode
const PALETTES = [
  { bg: '#e8f5ee', border: '#22a050', text: '#1a7a3c' },
  { bg: '#eef2ff', border: '#6366f1', text: '#3730a3' },
  { bg: '#fff8e6', border: '#f0a500', text: '#92620a' },
  { bg: '#fdecea', border: '#ef4444', text: '#991b1b' },
  { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1' },
];
function pal(code: string) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 99991;
  return PALETTES[h % PALETTES.length];
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
const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoRoom     = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />;
const IcoUsers    = () => <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M9 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoBook     = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M4 19.5V21" />;
const IcoGrid     = () => <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />;
const IcoList     = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IcoCalendar = () => <Ico d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />;
const IcoPrint    = () => <Ico d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" d2="M6 14h12v8H6z" />;
const IcoArrow    = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={13} />;
const IcoUnlock   = () => <Ico d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1" />;
const IcoStar     = () => <Ico d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const IcoInfo     = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoBldg     = () => <Ico d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM2 22h20M12 7h.01M12 11h.01M12 15h.01" />;

// ─────────────────────────────────────────────────────────────
// Summary bar
// ─────────────────────────────────────────────────────────────
function SummaryBar({ grouped }: { grouped: ReturnType<typeof groupBySubject> }) {
  const totalUnits    = [...new Map(grouped.map(r => [r.courseCode + r.sectionId, r])).values()]
                          .reduce((s, r) => s + r.units, 0);
  const classDays     = [...new Set(SCHEDULE.map(r => r.dayOfWeek))].length;
  const totalSections = grouped.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Active Sections',   value: totalSections, color: '#1a7a3c', bg: '#e8f5ee', icon: <IcoBook /> },
        { label: 'Total Load Units',  value: `${totalUnits.toFixed(1)}u`, color: '#3730a3', bg: '#eef2ff', icon: <IcoStar /> },
        { label: 'Class Days / Week', value: `${classDays} days`, color: '#92620a', bg: '#fff8e6', icon: <IcoCalendar /> },
        { label: 'Total Time Blocks', value: SCHEDULE.length, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)', icon: <IcoClock /> },
      ].map(s => (
        <div key={s.label} className="card flex items-center gap-3"
          style={{ padding: '12px 16px', borderLeft: `3px solid ${s.color}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: s.bg, color: s.color }}>
            {s.icon}
          </div>
          <div>
            <p className="text-[20px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Subject card (list view — grouped)
// ─────────────────────────────────────────────────────────────
function SubjectCard({ row }: { row: ReturnType<typeof groupBySubject>[number] }) {
  const p = pal(row.courseCode + row.sectionId);
  const fillPct = Math.round((row.expectedStudents / row.roomCapacity) * 100);
  return (
    <div className="card overflow-hidden hover:-translate-y-px transition-transform duration-150">
      <div className="h-1" style={{ background: p.border }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: p.bg, color: p.text }}>
                {row.courseCode}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                {row.sectionName}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                Yr {row.yearLevel}
              </span>
            </div>
            <h3 className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
              {row.courseTitle}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[14px] font-bold" style={{ color: p.text }}>{row.units.toFixed(1)}u</p>
            <Link href={`/requests/${row.requestId}`}
              className="text-[10.5px] font-medium flex items-center gap-0.5 justify-end mt-0.5"
              style={{ color: 'var(--color-primary-light)' }}>
              #{row.requestId} <IcoArrow />
            </Link>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoClock /> {fmt12(row.timeStart)} – {fmt12(row.timeEnd)}
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoRoom /> {row.roomNumber} · {row.roomType}
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoBldg /> {row.building}
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoUsers /> {row.expectedStudents} / {row.roomCapacity} students
          </div>
        </div>

        {/* Enrollment bar */}
        <div className="mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(fillPct, 100)}%`,
                background: fillPct >= 100 ? '#d93025' : fillPct >= 80 ? '#f0a500' : '#22a050',
              }} />
          </div>
          <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {fillPct}% full · Confirmed {fmtDate(row.confirmedAt)}
          </p>
        </div>

        {/* Day pills */}
        <div className="flex gap-1.5 flex-wrap">
          {DAY_ORDER.filter(d => row.days.includes(d)).map(d => (
            <span key={d} className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: p.bg, color: p.text }}>
              {DAY_SHORT[d]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Weekly timetable
// ─────────────────────────────────────────────────────────────
function WeekTimetable({ rows }: { rows: ConfirmedClass[] }) {
  const START_H  = 7;
  const END_H    = 19;
  const TOTAL_M  = (END_H - START_H) * 60;
  const GRID_H   = 660;
  const HEADER_H = 44;

  const hours: string[] = [];
  for (let h = START_H; h <= END_H; h++) hours.push(`${h}:00`);

  const classDays = DAY_ORDER.filter(d => rows.some(r => r.dayOfWeek === d));
  const daySlots: Record<DayOfWeek, ConfirmedClass[]> = {} as any;
  DAY_ORDER.forEach(d => { daySlots[d] = []; });
  rows.forEach(r => daySlots[r.dayOfWeek].push(r));

  function top(t: string)    { return ((toMins(t) - START_H * 60) / TOTAL_M) * GRID_H; }
  function height(s: string, e: string) { return ((toMins(e) - toMins(s)) / TOTAL_M) * GRID_H; }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${60 + classDays.length * 140}px` }}>
        {/* Day headers */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-border)', height: HEADER_H }}>
          <div style={{ width: 60, flexShrink: 0 }} />
          {classDays.map(day => (
            <div key={day} className="flex-1 flex items-center justify-center"
              style={{ borderLeft: '1px solid var(--color-border)' }}>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative flex" style={{ height: GRID_H }}>
          {/* Hour labels */}
          <div style={{ width: 60, flexShrink: 0, position: 'relative' }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute right-2 text-[10px]"
                style={{
                  top: `${(i / (hours.length - 1)) * 100}%`,
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}>
                {fmt12(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {classDays.map(day => (
            <div key={day} className="flex-1 relative"
              style={{ borderLeft: '1px solid var(--color-border)' }}>
              {/* Hour grid lines */}
              {hours.map((h, i) => (
                <div key={h} className="absolute w-full"
                  style={{
                    top: `${(i / (hours.length - 1)) * 100}%`,
                    borderTop: '1px dashed var(--color-border)',
                    opacity: 0.5,
                  }} />
              ))}

              {/* Class blocks */}
              {daySlots[day].map(r => {
                const p   = pal(r.courseCode + r.sectionId);
                const t   = top(r.timeStart);
                const h   = height(r.timeStart, r.timeEnd);
                const slim = h < 56;
                return (
                  <Link
                    key={r.scheduleId}
                    href={`/requests/${r.requestId}`}
                    className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden group"
                    style={{
                      top: t, height: h,
                      background:  p.bg,
                      borderLeft:  `3px solid ${p.border}`,
                      boxShadow:   '0 1px 4px rgba(0,0,0,.08)',
                      textDecoration: 'none',
                    }}>
                    <p className="font-bold leading-tight truncate group-hover:underline"
                      style={{ fontSize: slim ? '10px' : '11.5px', color: p.text }}>
                      {r.courseCode}
                    </p>
                    {!slim && (
                      <>
                        <p className="truncate leading-tight mt-0.5"
                          style={{ fontSize: '10px', color: p.text, opacity: 0.85 }}>
                          {r.sectionName}
                        </p>
                        <p className="leading-none mt-0.5"
                          style={{ fontSize: '10px', color: p.text, opacity: 0.7 }}>
                          {r.roomNumber}
                        </p>
                        <p className="leading-none mt-0.5"
                          style={{ fontSize: '9.5px', color: p.text, opacity: 0.6 }}>
                          {fmt12(r.timeStart)}
                        </p>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Per-day list
// ─────────────────────────────────────────────────────────────
function DayList({ rows, day }: { rows: ConfirmedClass[]; day: DayOfWeek }) {
  const dayRows = rows
    .filter(r => r.dayOfWeek === day)
    .sort((a, b) => toMins(a.timeStart) - toMins(b.timeStart));

  if (dayRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-xl border border-dashed"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface-2)' }}>
          <IcoClock />
        </div>
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          No classes on {day}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {dayRows.map(r => {
        const p        = pal(r.courseCode + r.sectionId);
        const fillPct  = Math.round((r.expectedStudents / r.roomCapacity) * 100);
        const barColor = fillPct >= 100 ? '#d93025' : fillPct >= 80 ? '#f0a500' : '#22a050';

        return (
          <div key={r.scheduleId}
            className="card flex items-stretch overflow-hidden hover:-translate-y-px transition-transform duration-150">
            {/* Time sidebar */}
            <div className="flex flex-col items-center justify-center px-4 py-4 shrink-0"
              style={{ background: p.bg, minWidth: '80px' }}>
              <p className="text-[11px] font-bold" style={{ color: p.text }}>{fmt12(r.timeStart)}</p>
              <div className="w-px h-3 my-1" style={{ background: p.border, opacity: 0.5 }} />
              <p className="text-[11px]" style={{ color: p.text, opacity: 0.75 }}>{fmt12(r.timeEnd)}</p>
            </div>
            {/* Accent */}
            <div className="w-1 shrink-0" style={{ background: p.border }} />
            {/* Content */}
            <div className="flex-1 px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                      style={{ background: p.bg, color: p.text }}>
                      {r.courseCode}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                      {r.sectionName} · Yr {r.yearLevel}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    {r.courseTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-bold" style={{ color: p.text }}>
                    {r.units.toFixed(1)}u
                  </span>
                  <Link href={`/requests/${r.requestId}`}
                    className="btn btn-sm flex items-center gap-1"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', padding: '4px 8px', fontSize: '11px' }}>
                    <IcoUnlock /> Release
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mb-2">
                <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoRoom />{r.roomNumber}
                </div>
                <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoBldg />{r.building}
                </div>
                <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoUsers />{r.expectedStudents}/{r.roomCapacity}
                </div>
              </div>

              {/* Fill bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(fillPct, 100)}%`, background: barColor }} />
                </div>
                <span className="text-[10.5px] font-semibold" style={{ color: barColor }}>
                  {fillPct}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function InstructorSchedulePage() {
  const [view,      setView]      = useState<ViewMode>('list');
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [search,    setSearch]    = useState('');

  const grouped = useMemo(() => groupBySubject(SCHEDULE), []);
  const classDays = useMemo(
    () => DAY_ORDER.filter(d => SCHEDULE.some(r => r.dayOfWeek === d)),
    [],
  );

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped.filter(r =>
      r.courseCode.toLowerCase().includes(q) ||
      r.courseTitle.toLowerCase().includes(q) ||
      r.sectionName.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q),
    );
  }, [grouped, search]);

  const initials = SESSION.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AppShell role="instructor" userName={SESSION.name} pageTitle="My Schedule">
      <div className="animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              My Schedule
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {SESSION.semester} · {SESSION.dept}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="btn btn-ghost flex items-center gap-1.5 text-[12.5px]"
              style={{ padding: '7px 14px' }}>
              <IcoPrint /> Print
            </button>
            <Link href="/requests/create"
              className="btn btn-primary flex items-center gap-2 text-[13px]"
              style={{ padding: '9px 18px' }}>
              + New Request
            </Link>
          </div>
        </div>

        {/* ── Instructor chip ── */}
        <div className="card flex items-center gap-4 mb-5"
          style={{ padding: '14px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
            style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
              {SESSION.name}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {SESSION.employeeId} · {SESSION.dept}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 hidden sm:inline-block"
            style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
            {SESSION.semester}
          </span>
        </div>

        {/* ── Summary bar ── */}
        <SummaryBar grouped={grouped} />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative" style={{ minWidth: '180px', flex: 1, maxWidth: '260px' }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}>
              <IcoBook />
            </span>
            <input
              type="search"
              placeholder="Search course, section, room…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '13px', height: '36px' }}
            />
          </div>

          {/* View switcher */}
          <div className="flex rounded-lg p-0.5 gap-0.5 ml-auto"
            style={{ background: 'var(--color-surface-2)' }}>
            {([
              { key: 'list' as ViewMode, icon: <IcoList />,     label: 'Subjects' },
              { key: 'week' as ViewMode, icon: <IcoGrid />,     label: 'Timetable' },
              { key: 'day'  as ViewMode, icon: <IcoCalendar />, label: 'By Day' },
            ]).map(v => (
              <button key={v.key}
                onClick={() => setView(v.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150"
                style={view === v.key
                  ? { background: 'var(--color-surface)', color: 'var(--color-primary)', boxShadow: 'var(--shadow-xs)' }
                  : { background: 'transparent', color: 'var(--color-text-muted)' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}

        {/* LIST: grouped by subject */}
        {view === 'list' && (
          filteredGrouped.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)' }}>
                <IcoBook />
              </div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                No classes found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGrouped.map(r => (
                <SubjectCard key={`${r.courseCode}-${r.sectionId}`} row={r} />
              ))}
            </div>
          )
        )}

        {/* TIMETABLE: pixel-positioned weekly grid */}
        {view === 'week' && (
          <div className="card">
            <div className="card-body pb-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                  Weekly Timetable
                </h2>
                <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                  Click a class block to view request details
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <WeekTimetable rows={SCHEDULE} />
            </div>
          </div>
        )}

        {/* DAY: per-day picker */}
        {view === 'day' && (
          <div>
            {/* Day tabs */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {classDays.map(d => (
                <button key={d}
                  onClick={() => setActiveDay(d)}
                  className="text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                  style={activeDay === d
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                  {d}
                  <span className="ml-1.5 text-[10.5px] opacity-70">
                    ({SCHEDULE.filter(r => r.dayOfWeek === d).length})
                  </span>
                </button>
              ))}
            </div>
            <DayList rows={SCHEDULE} day={activeDay} />
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
          <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }}><IcoInfo /></span>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
            This schedule shows all <strong>active confirmed bookings</strong> from{' '}
            <code style={{ fontSize: '11px', background: 'rgba(34,160,80,.1)', padding: '1px 5px', borderRadius: '4px' }}>
              Confirmed_Schedule
            </code>{' '}
            where <code style={{ fontSize: '11px', background: 'rgba(34,160,80,.1)', padding: '1px 5px', borderRadius: '4px' }}>
              is_active = TRUE
            </code>.
            To release a booking, click <strong>Release</strong> on any class — this links to the
            approved request detail page where the release action is performed.
          </p>
        </div>

      </div>
    </AppShell>
  );
}