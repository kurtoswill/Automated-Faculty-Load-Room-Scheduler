'use client';

/**
 * /student/schedule
 *
 * Tables consumed (per Pages.pdf):
 * Student_Section  — links this student to their sections
 * Confirmed_Schedule — the live, approved schedule rows
 * Sections         — section metadata (name, day, time, year_level, status)
 * Courses          — course_code, course_title, units
 * Rooms            — room_number, building, capacity
 * Users            — instructor first_name + last_name
 *
 * Access:  Student (Regular & Irregular — read-only for both)
 * Student_Section assignments are Admin-managed; student cannot edit.
 */

import { useState, useMemo } from 'react';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types  (mirror DB columns exactly)
// ─────────────────────────────────────────────────────────────
type DayOfWeek    = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
type SectionStatus = 'Draft' | 'Pending' | 'Confirmed' | 'Cancelled';
type ViewMode     = 'list' | 'week';
type FilterDay    = 'All' | DayOfWeek;

// Joined row from Student_Section → Confirmed_Schedule → Sections → Courses → Rooms → Users
interface ScheduleRow {
  // Student_Section
  studentSectionId:  number;
  assignedAt:        string;
  // Sections
  sectionId:         number;
  sectionName:       string;   // e.g. BSCS 3-A
  semester:          string;   // e.g. 2025-2026 1st Sem
  yearLevel:         number;
  dayOfWeek:         DayOfWeek;
  timeStart:         string;   // HH:MM
  timeEnd:           string;
  sectionStatus:     SectionStatus;
  // Courses
  courseCode:        string;   // e.g. CS 3101
  courseTitle:       string;   // e.g. Web Systems and Technologies
  units:             number;   // e.g. 3.0
  // Rooms  (from Confirmed_Schedule → Rooms)
  roomNumber:        string;   // e.g. CS-101
  building:          string;
  roomCapacity:      number;
  // Users (instructor)
  instructorFirst:   string;
  instructorLast:    string;
  instructorDept:    string;
  // Confirmed_Schedule
  confirmedAt:       string;
  isActive:          boolean;
}

// ─────────────────────────────────────────────────────────────
// Session config — replace with real auth in production
// ─────────────────────────────────────────────────────────────
const SESSION = {
  name:       'Carlo Reyes',
  studentId:  '2021-00123',
  course:     'BS Computer Science',
  yearLevel:  3,
  isIrregular: true, // Used only to display the "Irregular" badge on the ID
  semester:   '2025-2026 1st Sem',
};

// ─────────────────────────────────────────────────────────────
// Mock data — mirrors the DB join described above
// ─────────────────────────────────────────────────────────────
const SCHEDULE_DATA: ScheduleRow[] = [
  {
    studentSectionId: 101, assignedAt: '2025-06-10 08:00:00',
    sectionId: 1, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Monday', timeStart: '07:30', timeEnd: '09:00',
    sectionStatus: 'Confirmed',
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40,
    instructorFirst: 'Maria', instructorLast: 'Santos', instructorDept: 'DCS',
    confirmedAt: '2025-06-08 10:00:00', isActive: true,
  },
  {
    studentSectionId: 102, assignedAt: '2025-06-10 08:00:00',
    sectionId: 2, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Wednesday', timeStart: '07:30', timeEnd: '09:00',
    sectionStatus: 'Confirmed',
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40,
    instructorFirst: 'Maria', instructorLast: 'Santos', instructorDept: 'DCS',
    confirmedAt: '2025-06-08 10:00:00', isActive: true,
  },
  {
    studentSectionId: 103, assignedAt: '2025-06-10 08:00:00',
    sectionId: 3, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Friday', timeStart: '07:30', timeEnd: '09:00',
    sectionStatus: 'Confirmed',
    courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40,
    instructorFirst: 'Maria', instructorLast: 'Santos', instructorDept: 'DCS',
    confirmedAt: '2025-06-08 10:00:00', isActive: true,
  },
  {
    studentSectionId: 104, assignedAt: '2025-06-10 08:00:00',
    sectionId: 4, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Tuesday', timeStart: '09:00', timeEnd: '10:30',
    sectionStatus: 'Confirmed',
    courseCode: 'CS 3201', courseTitle: 'Algorithm Analysis and Design', units: 3.0,
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40,
    instructorFirst: 'Luz', instructorLast: 'Mendoza', instructorDept: 'DCS',
    confirmedAt: '2025-06-08 10:30:00', isActive: true,
  },
  {
    studentSectionId: 105, assignedAt: '2025-06-10 08:00:00',
    sectionId: 5, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Thursday', timeStart: '09:00', timeEnd: '10:30',
    sectionStatus: 'Confirmed',
    courseCode: 'CS 3201', courseTitle: 'Algorithm Analysis and Design', units: 3.0,
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40,
    instructorFirst: 'Luz', instructorLast: 'Mendoza', instructorDept: 'DCS',
    confirmedAt: '2025-06-08 10:30:00', isActive: true,
  },
  {
    studentSectionId: 106, assignedAt: '2025-06-10 08:00:00',
    sectionId: 6, sectionName: 'IT 3-B', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Monday', timeStart: '13:00', timeEnd: '14:30',
    sectionStatus: 'Confirmed',
    courseCode: 'IT 3101', courseTitle: 'Web Systems and Technologies', units: 3.0,
    roomNumber: 'ICT-Lab1', building: 'ICT Building', roomCapacity: 30,
    instructorFirst: 'Juan', instructorLast: 'dela Cruz', instructorDept: 'DIT',
    confirmedAt: '2025-06-08 11:00:00', isActive: true,
  },
  {
    studentSectionId: 107, assignedAt: '2025-06-10 08:00:00',
    sectionId: 7, sectionName: 'IT 3-B', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Wednesday', timeStart: '13:00', timeEnd: '14:30',
    sectionStatus: 'Confirmed',
    courseCode: 'IT 3101', courseTitle: 'Web Systems and Technologies', units: 3.0,
    roomNumber: 'ICT-Lab1', building: 'ICT Building', roomCapacity: 30,
    instructorFirst: 'Juan', instructorLast: 'dela Cruz', instructorDept: 'DIT',
    confirmedAt: '2025-06-08 11:00:00', isActive: true,
  },
  {
    studentSectionId: 108, assignedAt: '2025-06-10 08:00:00',
    sectionId: 8, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem',
    yearLevel: 3, dayOfWeek: 'Friday', timeStart: '10:30', timeEnd: '12:00',
    sectionStatus: 'Confirmed',
    courseCode: 'GE 102', courseTitle: 'Technical Communication', units: 3.0,
    roomNumber: 'GE-305', building: 'Main Building', roomCapacity: 50,
    instructorFirst: 'Ben', instructorLast: 'Torres', instructorDept: 'DGE',
    confirmedAt: '2025-06-08 12:00:00', isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const DAY_ORDER: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
};

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Group rows by courseCode so MWF entries collapse into one subject card */
function groupByCourse(rows: ScheduleRow[]) {
  const map = new Map<string, { rows: ScheduleRow[]; days: DayOfWeek[] }>();
  rows.forEach(r => {
    const key = `${r.courseCode}-${r.sectionId}`;
    if (!map.has(key)) map.set(key, { rows: [], days: [] });
    const g = map.get(key)!;
    g.rows.push(r);
    if (!g.days.includes(r.dayOfWeek)) g.days.push(r.dayOfWeek);
  });
  return Array.from(map.values()).map(g => ({
    ...g.rows[0],
    days: g.days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
  }));
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, d2, size = 15 }: { d: string; d2?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoRoom     = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />;
const IcoUser     = () => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" d2="M12 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoBook     = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M4 19.5V21" />;
const IcoGrid     = () => <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />;
const IcoList     = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IcoFilter   = () => <Ico d="M22 3H2l8 9.46V19l4 2V12.46L22 3z" />;
const IcoBldg     = () => <Ico d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM2 22h20M12 7h.01M12 11h.01M12 15h.01" />;
const IcoStar     = () => <Ico d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const IcoInfo     = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoPrint    = () => <Ico d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" d2="M6 14h12v8H6z" />;

// ─────────────────────────────────────────────────────────────
// Subject color palette — deterministic by courseCode
// ─────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: '#e8f5ee', border: '#22a050', text: '#1a7a3c', dot: '#22a050' },
  { bg: '#eef2ff', border: '#6366f1', text: '#3730a3', dot: '#6366f1' },
  { bg: '#fff8e6', border: '#f0a500', text: '#92620a', dot: '#f0a500' },
  { bg: '#fdecea', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1', dot: '#0ea5e9' },
  { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
];
function palette(courseCode: string) {
  let h = 0;
  for (let i = 0; i < courseCode.length; i++) h = (h * 31 + courseCode.charCodeAt(i)) % 999983;
  return PALETTES[h % PALETTES.length];
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** Summary banner — totals bar at the top */
function SummaryBar({ grouped }: { grouped: ReturnType<typeof groupByCourse> }) {
  const totalUnits    = grouped.reduce((s, r) => s + r.units, 0);
  const totalSubjects = grouped.length;
  const daysWithClass = [...new Set(SCHEDULE_DATA.map(r => r.dayOfWeek))].length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Enrolled Subjects', value: totalSubjects, icon: <IcoBook />,  bg: '#e8f5ee', color: '#1a7a3c' },
        { label: 'Total Units',       value: `${totalUnits.toFixed(1)} u`, icon: <IcoStar />, bg: '#eef2ff', color: '#3730a3' },
        { label: 'Class Days / Week', value: `${daysWithClass} days`, icon: <IcoGrid />, bg: '#fff8e6', color: '#92620a' },
        { label: 'Semester',          value: SESSION.semester.split(' ').slice(-2).join(' '), icon: <IcoInfo />, bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' },
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

/** Single subject card used in list view */
function SubjectCard({ row }: { row: ReturnType<typeof groupByCourse>[number] }) {
  const p = palette(row.courseCode);
  return (
    <div className="card overflow-hidden hover:-translate-y-px transition-transform duration-150">
      {/* Color accent top bar */}
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
            </div>
            <h3 className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
              {row.courseTitle}
            </h3>
          </div>
          <span className="text-[12px] font-bold shrink-0 px-2.5 py-1 rounded-lg"
            style={{ background: p.bg, color: p.text }}>
            {row.units.toFixed(1)}u
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoUser />
            <span>{row.instructorFirst} {row.instructorLast}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoRoom />
            <span>{row.roomNumber} · {row.building}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoClock />
            <span>{fmt12(row.timeStart)} – {fmt12(row.timeEnd)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            <IcoBook />
            <span>{row.sectionName}</span>
          </div>
        </div>

        {/* Day pills */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {DAY_ORDER.filter(d => row.days.includes(d)).map(day => (
            <span key={day}
              className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: p.bg, color: p.text }}>
              {DAY_SHORT[day]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Weekly timetable grid */
function WeekGrid({ rows }: { rows: ScheduleRow[] }) {
  const START_HOUR = 7;
  const END_HOUR   = 19;
  const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;
  const GRID_H     = 640; // px
  const HEADER_H   = 40;

  const hours: string[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) hours.push(`${h}:00`);

  // Build per-day slots
  const daySlots: Record<DayOfWeek, ScheduleRow[]> = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
  };
  rows.forEach(r => { if (daySlots[r.dayOfWeek]) daySlots[r.dayOfWeek].push(r); });

  function top(t: string)    { return ((toMinutes(t) - START_HOUR * 60) / TOTAL_MINS) * GRID_H; }
  function height(s: string, e: string) { return ((toMinutes(e) - toMinutes(s)) / TOTAL_MINS) * GRID_H; }

  const activeDays = DAY_ORDER.filter(d => daySlots[d].length > 0 || d !== 'Saturday');

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface-2)' }}>
          <IcoGrid />
        </div>
        <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          No classes match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: '640px' }}>
        {/* Day headers */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-border)', height: HEADER_H }}>
          {/* Time gutter */}
          <div style={{ width: '56px', flexShrink: 0 }} />
          {activeDays.map(day => (
            <div key={day} className="flex-1 flex items-center justify-center"
              style={{ borderLeft: '1px solid var(--color-border)' }}>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {DAY_SHORT[day]}
              </span>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative flex" style={{ height: GRID_H }}>
          {/* Hour lines + labels */}
          <div style={{ width: '56px', flexShrink: 0, position: 'relative' }}>
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
          {activeDays.map(day => (
            <div key={day} className="flex-1 relative"
              style={{ borderLeft: '1px solid var(--color-border)' }}>
              {/* Hour lines */}
              {hours.map((h, i) => (
                <div key={h} className="absolute w-full"
                  style={{
                    top: `${(i / (hours.length - 1)) * 100}%`,
                    borderTop: '1px dashed var(--color-border)',
                    opacity: 0.6,
                  }} />
              ))}

              {/* Class blocks */}
              {daySlots[day].map(r => {
                const p    = palette(r.courseCode);
                const t    = top(r.timeStart);
                const h    = height(r.timeStart, r.timeEnd);
                const slim = h < 52;
                return (
                  <div key={r.studentSectionId}
                    className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden"
                    style={{
                      top: t, height: h,
                      background: p.bg,
                      borderLeft: `3px solid ${p.border}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                    }}>
                    <p className="font-bold leading-tight truncate"
                      style={{ fontSize: slim ? '9.5px' : '11px', color: p.text }}>
                      {r.courseCode}
                    </p>
                    {!slim && (
                      <>
                        <p className="truncate leading-tight mt-0.5"
                          style={{ fontSize: '10px', color: p.text, opacity: 0.8 }}>
                          {r.roomNumber}
                        </p>
                        <p className="leading-none mt-0.5"
                          style={{ fontSize: '9.5px', color: p.text, opacity: 0.7 }}>
                          {fmt12(r.timeStart)}
                        </p>
                      </>
                    )}
                  </div>
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
// Page
// ─────────────────────────────────────────────────────────────
export default function StudentSchedulePage() {
  const [view,      setView]      = useState<ViewMode>('list');
  const [filterDay, setFilterDay] = useState<FilterDay>('All');
  const [search,    setSearch]    = useState('');

  // Derive distinct days that have classes
  const classDays = useMemo(
    () => DAY_ORDER.filter(d => SCHEDULE_DATA.some(r => r.dayOfWeek === d)),
    [],
  );

  // Grouped subjects (collapse MWF same subject into one card)
  const grouped = useMemo(() => groupByCourse(SCHEDULE_DATA), []);

  // Filtered for list view
  const filteredGrouped = useMemo(() => {
    let g = grouped;
    if (filterDay !== 'All') g = g.filter(r => r.days.includes(filterDay as DayOfWeek));
    if (search.trim()) {
      const q = search.toLowerCase();
      g = g.filter(r =>
        r.courseCode.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        `${r.instructorFirst} ${r.instructorLast}`.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q)
      );
    }
    return g;
  }, [grouped, filterDay, search]);

  // Filtered raw rows specifically for the Timetable view
  const filteredRawRows = useMemo(() => {
    let r = SCHEDULE_DATA;
    if (filterDay !== 'All') r = r.filter(x => x.dayOfWeek === filterDay);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x => 
        x.courseCode.toLowerCase().includes(q) ||
        x.courseTitle.toLowerCase().includes(q) ||
        `${x.instructorFirst} ${x.instructorLast}`.toLowerCase().includes(q) ||
        x.roomNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [filterDay, search]);

  const initials = SESSION.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppShell role="student" userName={SESSION.name} pageTitle="My Schedule">
      <div className="animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              Class Schedule
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {SESSION.semester} · {SESSION.course} · Year {SESSION.yearLevel}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="btn btn-ghost text-[12.5px] flex items-center gap-1.5"
              style={{ padding: '7px 14px' }}>
              <IcoPrint /> Print
            </button>
          </div>
        </div>

        {/* ── Student ID card ── */}
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
              {SESSION.studentId} · {SESSION.course} · Year {SESSION.yearLevel}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={SESSION.isIrregular
                ? { background: '#fff8e6', color: '#92620a' }
                : { background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
              {SESSION.isIrregular ? 'Irregular' : 'Regular'}
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full hidden sm:inline-block"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
              {SESSION.semester}
            </span>
          </div>
        </div>

        {/* ── Summary bar ── */}
        <SummaryBar grouped={grouped} />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">

          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: '180px', maxWidth: '280px' }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}>
              <IcoFilter />
            </span>
            <input
              type="search"
              placeholder="Search subject, instructor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border outline-none transition-all"
              style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', fontSize: '13px', height: '36px', borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Day filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {(['All', ...classDays] as FilterDay[]).map(d => (
              <button key={d}
                onClick={() => setFilterDay(d)}
                className="text-[11.5px] font-semibold px-3 py-1 rounded-full transition-all duration-150"
                style={filterDay === d
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                {d === 'All' ? 'All Days' : DAY_SHORT[d as DayOfWeek]}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg p-0.5 gap-0.5 ml-auto"
            style={{ background: 'var(--color-surface-2)' }}>
            {([
              { key: 'list', icon: <IcoList />, label: 'List' },
              { key: 'week', icon: <IcoGrid />, label: 'Week' },
            ] as const).map(v => (
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
        {view === 'list' ? (
          <>
            {filteredGrouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 card">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface-2)' }}>
                  <IcoBook />
                </div>
                <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No classes found
                </p>
                <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
                  Try adjusting your search or day filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGrouped.map((row, idx) => (
                  <SubjectCard key={`${row.courseCode}-${idx}`} row={row} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="card p-0 overflow-hidden">
            <WeekGrid rows={filteredRawRows} />
          </div>
        )}

      </div>
    </AppShell>
  );
}