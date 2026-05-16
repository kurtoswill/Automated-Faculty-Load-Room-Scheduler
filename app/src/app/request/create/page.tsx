'use client';

/**
 * /requests/create
 *
 * Tables consumed (per Pages.pdf):
 *   Room_Requests  — INSERT new request
 *   Sections       — instructor's sections (source of subject data)
 *   Courses        — course_code, course_title, units (via Sections.course_id)
 *   Rooms          — room picker: room_number, building, capacity, type, is_available
 *
 * Access: Instructor only
 * System auto-blocks submission if:
 *   1. Instructor already has a confirmed class at that day/time (Confirmed_Schedule check)
 *   2. Expected students > room capacity
 *   3. Load limit would be exceeded (Faculty_Load_Limits check)
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
type Step      = 1 | 2 | 3;

interface Section {
  id:          number;
  courseCode:  string;
  courseTitle: string;
  units:       number;
  sectionName: string;
  semester:    string;
  yearLevel:   number;
  expectedStudents: number;
  dayOfWeek:   DayOfWeek;
  timeStart:   string;
  timeEnd:     string;
}

interface Room {
  id:         number;
  roomNumber: string;
  building:   string;
  capacity:   number;
  typeName:   string;
  isAvailable:boolean;
}

interface ConflictResult {
  hasRoomConflict:       boolean;
  hasInstructorConflict: boolean;
  exceedsCapacity:       boolean;
  exceedsLoadLimit:      boolean;
  message:               string;
}

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const MY_SECTIONS: Section[] = [
  { id: 1,  courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem', yearLevel: 3, expectedStudents: 38, dayOfWeek: 'Monday',    timeStart: '07:30', timeEnd: '09:00' },
  { id: 2,  courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem', yearLevel: 3, expectedStudents: 38, dayOfWeek: 'Wednesday',  timeStart: '07:30', timeEnd: '09:00' },
  { id: 3,  courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0, sectionName: 'BSCS 3-A', semester: '2025-2026 1st Sem', yearLevel: 3, expectedStudents: 38, dayOfWeek: 'Friday',     timeStart: '07:30', timeEnd: '09:00' },
  { id: 4,  courseCode: 'CS 4101', courseTitle: 'Software Engineering',            units: 3.0, sectionName: 'BSCS 4-A', semester: '2025-2026 1st Sem', yearLevel: 4, expectedStudents: 25, dayOfWeek: 'Tuesday',   timeStart: '13:00', timeEnd: '14:30' },
  { id: 5,  courseCode: 'CS 4101', courseTitle: 'Software Engineering',            units: 3.0, sectionName: 'BSCS 4-A', semester: '2025-2026 1st Sem', yearLevel: 4, expectedStudents: 25, dayOfWeek: 'Thursday',  timeStart: '13:00', timeEnd: '14:30' },
];

const ROOMS: Room[] = [
  { id: 1,  roomNumber: 'CS-101',   building: 'New Academic Building', capacity: 45, typeName: 'Lecture',    isAvailable: true  },
  { id: 2,  roomNumber: 'CS-202',   building: 'New Academic Building', capacity: 40, typeName: 'Lecture',    isAvailable: true  },
  { id: 3,  roomNumber: 'CS-204',   building: 'New Academic Building', capacity: 40, typeName: 'Lecture',    isAvailable: true  },
  { id: 4,  roomNumber: 'ICT-Lab1', building: 'ICT Building',          capacity: 30, typeName: 'Laboratory', isAvailable: true  },
  { id: 5,  roomNumber: 'ICT-Lab2', building: 'ICT Building',          capacity: 30, typeName: 'Laboratory', isAvailable: true  },
  { id: 6,  roomNumber: 'ICT-Lab3', building: 'ICT Building',          capacity: 25, typeName: 'Laboratory', isAvailable: false },
  { id: 7,  roomNumber: 'GE-305',   building: 'Main Building',         capacity: 50, typeName: 'Lecture',    isAvailable: true  },
  { id: 8,  roomNumber: 'SEM-1',    building: 'Admin Building',        capacity: 20, typeName: 'Seminar',    isAvailable: true  },
];

// Simulated conflict check (would be a server action / API call in production)
function checkConflicts(section: Section, room: Room): ConflictResult {
  // Simulate: CS-202 is busy Monday 07:30–09:00
  const roomBusy = room.id === 2 && section.dayOfWeek === 'Monday' &&
    section.timeStart === '07:30';
  const exceedsCap = section.expectedStudents > room.capacity;
  // Simulate: instructor already has a class Thursday 13:00
  const instrConflict = section.dayOfWeek === 'Thursday' &&
    section.timeStart === '13:00' && section.courseCode === 'CS 3101';

  if (roomBusy)     return { hasRoomConflict: true,  hasInstructorConflict: false, exceedsCapacity: false, exceedsLoadLimit: false, message: `${room.roomNumber} already has an approved booking on ${section.dayOfWeek} at that time.` };
  if (instrConflict) return { hasRoomConflict: false, hasInstructorConflict: true,  exceedsCapacity: false, exceedsLoadLimit: false, message: 'You already have a confirmed class at that day and time slot.' };
  if (exceedsCap)    return { hasRoomConflict: false, hasInstructorConflict: false, exceedsCapacity: true,  exceedsLoadLimit: false, message: `Expected ${section.expectedStudents} students exceeds room capacity of ${room.capacity}.` };
  return            { hasRoomConflict: false, hasInstructorConflict: false, exceedsCapacity: false, exceedsLoadLimit: false, message: '' };
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
const IcoCheck   = () => <Ico d="M20 6L9 17l-5-5" />;
const IcoAlert   = () => <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />;
const IcoInfo    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoRoom    = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />;
const IcoUsers   = () => <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M9 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoBook    = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M4 19.5V21" />;
const IcoClock   = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoArrow   = () => <Ico d="M5 12h14M12 5l7 7-7 7" />;
const IcoBack    = () => <Ico d="M19 12H5M12 19l-7-7 7-7" />;
const IcoSend    = () => <Ico d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />;

function fmt12(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ─────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1 as Step, label: 'Select Section' },
    { n: 2 as Step, label: 'Choose Room'    },
    { n: 3 as Step, label: 'Review & Submit' },
  ];
  return (
    <div className="step-indicator mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className={`step-dot ${current === s.n ? 'active' : current > s.n ? 'completed' : ''}`}>
            {current > s.n ? <IcoCheck /> : s.n}
          </div>
          {!s.label.endsWith('Submit') && (
            <div className={`step-line ${current > s.n ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1 — Select Section
// ─────────────────────────────────────────────────────────────
function Step1({
  sections, selected, onSelect, onNext,
}: {
  sections: Section[];
  selected: Section | null;
  onSelect: (s: Section) => void;
  onNext: () => void;
}) {
  // Group by course
  const grouped = sections.reduce<Record<string, Section[]>>((acc, s) => {
    const key = `${s.courseCode}|${s.sectionName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Select a Section
        </h2>
        <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
          Choose which of your assigned sections needs a room this semester.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(grouped).map(([key, rows]) => {
          const rep  = rows[0];
          const days = rows.map(r => r.dayOfWeek.slice(0, 3)).join(' / ');
          const isSelected = selected && rows.some(r => r.id === selected.id);
          return (
            <button
              key={key}
              onClick={() => onSelect(rep)}
              className="text-left rounded-xl border p-4 transition-all duration-150"
              style={{
                borderColor:  isSelected ? 'var(--color-primary-light)' : 'var(--color-border)',
                background:   isSelected ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                outline:      isSelected ? '2px solid var(--color-primary-light)' : 'none',
                outlineOffset: '2px',
              }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md mr-2"
                    style={{ background: '#eef2ff', color: '#3730a3' }}>
                    {rep.courseCode}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                    {rep.sectionName}
                  </span>
                </div>
                <span className="text-[12px] font-bold shrink-0"
                  style={{ color: 'var(--color-primary)' }}>
                  {rep.units.toFixed(1)}u
                </span>
              </div>
              <p className="text-[13.5px] font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {rep.courseTitle}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoClock /> {fmt12(rep.timeStart)} – {fmt12(rep.timeEnd)}
                </span>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoBook /> {days} · Year {rep.yearLevel}
                </span>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <IcoUsers /> {rep.expectedStudents} students
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={onNext}
          disabled={!selected}
          className="btn btn-primary flex items-center gap-2"
          style={{ opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed' }}>
          Choose Room <IcoArrow />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 2 — Choose Room
// ─────────────────────────────────────────────────────────────
function Step2({
  rooms, section, selectedRoom, onSelect, onNext, onBack,
}: {
  rooms: Room[];
  section: Section;
  selectedRoom: Room | null;
  onSelect: (r: Room) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [typeFilter, setTypeFilter] = useState('All');
  const types = ['All', ...new Set(rooms.map(r => r.typeName))];
  const available = rooms.filter(r =>
    r.isAvailable &&
    (typeFilter === 'All' || r.typeName === typeFilter),
  );

  const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    Lecture:    { bg: '#e8f5ee', color: '#1a7a3c' },
    Laboratory: { bg: '#eef2ff', color: '#3730a3' },
    Seminar:    { bg: '#fff8e6', color: '#92620a' },
    AVR:        { bg: '#f0f9ff', color: '#0369a1' },
    Gymnasium:  { bg: '#fdf4ff', color: '#6b21a8' },
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Choose a Room
        </h2>
        <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
          Requesting for <strong>{section.courseCode} — {section.sectionName}</strong> ·{' '}
          {section.expectedStudents} students · {fmt12(section.timeStart)}–{fmt12(section.timeEnd)}
        </p>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <button key={t}
            onClick={() => setTypeFilter(t)}
            className="text-[11.5px] font-semibold px-3 py-1 rounded-full transition-all"
            style={typeFilter === t
              ? { background: 'var(--color-primary)', color: '#fff' }
              : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {available.map(room => {
          const tc = TYPE_COLORS[room.typeName] ?? { bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' };
          const tooSmall  = room.capacity < section.expectedStudents;
          const isSelected = selectedRoom?.id === room.id;
          const conflict  = isSelected ? checkConflicts(section, room) : null;

          return (
            <button
              key={room.id}
              onClick={() => !tooSmall && onSelect(room)}
              disabled={tooSmall}
              className="text-left rounded-xl border p-4 transition-all duration-150"
              style={{
                borderColor:  isSelected ? 'var(--color-primary-light)' : tooSmall ? 'var(--color-border)' : 'var(--color-border)',
                background:   isSelected ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                opacity:      tooSmall ? 0.5 : 1,
                cursor:       tooSmall ? 'not-allowed' : 'pointer',
                outline:      isSelected ? '2px solid var(--color-primary-light)' : 'none',
                outlineOffset: '2px',
              }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>
                    {room.roomNumber}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                    {room.building}
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: tc.bg, color: tc.color }}>
                  {room.typeName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12.5px]"
                style={{ color: tooSmall ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                <IcoUsers />
                <span>
                  {room.capacity} seats
                  {tooSmall && ` — needs ${section.expectedStudents}, too small`}
                </span>
              </div>
              {/* Live conflict warning when selected */}
              {isSelected && conflict && conflict.message && (
                <div className="flex items-start gap-2 mt-2.5 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                  <IcoAlert />
                  <p className="text-[11.5px] leading-snug">{conflict.message}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-2">
        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2">
          <IcoBack /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedRoom || !!checkConflicts(section, selectedRoom).message}
          className="btn btn-primary flex items-center gap-2"
          style={{
            opacity: (!selectedRoom || !!checkConflicts(section, selectedRoom!).message) ? 0.5 : 1,
            cursor:  (!selectedRoom || !!checkConflicts(section, selectedRoom!).message) ? 'not-allowed' : 'pointer',
          }}>
          Review & Submit <IcoArrow />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 3 — Review & Submit
// ─────────────────────────────────────────────────────────────
function Step3({
  section, room, onBack, onSubmit, submitting,
}: {
  section: Section;
  room: Room;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const rows = [
    { label: 'Course Code',    value: section.courseCode },
    { label: 'Course Title',   value: section.courseTitle },
    { label: 'Section',        value: section.sectionName },
    { label: 'Year Level',     value: `Year ${section.yearLevel}` },
    { label: 'Day',            value: section.dayOfWeek },
    { label: 'Time',           value: `${fmt12(section.timeStart)} – ${fmt12(section.timeEnd)}` },
    { label: 'Expected Students', value: `${section.expectedStudents} / ${room.capacity} capacity` },
    { label: 'Room Requested', value: room.roomNumber },
    { label: 'Building',       value: room.building },
    { label: 'Room Type',      value: room.typeName },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Review & Submit
        </h2>
        <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
          Confirm the details below. Once submitted, your request will enter the Admin review queue.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {rows.map((r, i) => (
          <div key={r.label}
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
            <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {r.label}
            </span>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
        style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
        <span style={{ color: 'var(--color-primary)', marginTop: '1px' }}><IcoInfo /></span>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
          Your request will be set to <strong>Pending</strong> and will temporarily hold the slot.
          Admin will review all four conditions before approving. You will be notified of the decision.
        </p>
      </div>

      <div className="flex justify-between mt-2">
        <button onClick={onBack} disabled={submitting} className="btn btn-ghost flex items-center gap-2">
          <IcoBack /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="btn btn-primary flex items-center gap-2"
          style={{ opacity: submitting ? 0.8 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Submitting…' : <><IcoSend /> Submit Request</>}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page: /requests/create
// ─────────────────────────────────────────────────────────────
export function CreateRequestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const prefilledRoomId = params.get('roomId') ? parseInt(params.get('roomId')!) : null;

  const [step,        setStep]        = useState<Step>(1);
  const [section,     setSection]     = useState<Section | null>(null);
  const [room,        setRoom]        = useState<Room | null>(
    prefilledRoomId ? ROOMS.find(r => r.id === prefilledRoomId) ?? null : null,
  );
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  // Auto-advance to step 2 if room pre-filled from /rooms page
  useEffect(() => {
    if (prefilledRoomId && room && step === 1) {
      // Don't skip section — still need to pick section first
    }
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    // TODO: POST to /api/requests with { sectionId, roomId, dayOfWeek, timeStart, timeEnd }
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted && section && room) {
    return (
      <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="Room Request Submitted">
        <div className="max-w-lg mx-auto animate-fade-in">
          <div className="card card-body flex flex-col items-center text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#e8f5ee' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22a050" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                Request Submitted
              </h2>
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Your room request for <strong>{section.courseCode} — {section.sectionName}</strong> in{' '}
                <strong>{room.roomNumber}</strong> is now <span style={{ color: '#f0a500', fontWeight: 600 }}>Pending</span> review.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/requests" className="btn btn-primary">View My Requests</Link>
              <Link href="/requests/create" className="btn btn-outline" onClick={() => { setSubmitted(false); setStep(1); setSection(null); setRoom(null); }}>
                Submit Another
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="Submit Room Request">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/requests" className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)' }}>
            <IcoBack />
          </Link>
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              Submit Room Request
            </h1>
            <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
              3-step wizard — select section → choose room → review
            </p>
          </div>
        </div>

        <div className="card card-body">
          <StepBar current={step} />
          {step === 1 && (
            <Step1
              sections={MY_SECTIONS}
              selected={section}
              onSelect={setSection}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && section && (
            <Step2
              rooms={ROOMS}
              section={section}
              selectedRoom={room}
              onSelect={setRoom}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && section && room && (
            <Step3
              section={section}
              room={room}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}