'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type StudentType = 'regular' | 'irregular';

interface ScheduleClass {
  id: string;
  subject: string;
  code: string;
  instructor: string;
  room: string;
  building: string;
  day: string;
  time: string;
  type: 'Lecture' | 'Lab';
  isToday: boolean;
}

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const STUDENT_TYPE: StudentType = 'irregular';
const STUDENT_NAME = 'Carlo Reyes';
const STUDENT_ID = '2021-00123';
const STUDENT_COURSE = 'BSCS — 3rd Year';

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const MY_SCHEDULE: ScheduleClass[] = [
  { id: 'S1', subject: 'Data Structures', code: 'CMSC 101', instructor: 'Dr. Maria Santos', room: 'Room 204', building: 'Main', day: 'Mon/Wed/Fri', time: '07:30–09:00', type: 'Lecture', isToday: true },
  { id: 'S2', subject: 'Algorithm Analysis', code: 'CS 401', instructor: 'Dr. Luz Mendoza', room: 'Room 202', building: 'Main', day: 'Tue/Thu', time: '09:00–10:30', type: 'Lecture', isToday: true },
  { id: 'S3', subject: 'Web Development', code: 'IT 301', instructor: 'Prof. Juan dela Cruz', room: 'Lab 1', building: 'ICT', day: 'Mon/Wed', time: '13:00–14:30', type: 'Lab', isToday: false },
  { id: 'S4', subject: 'Technical Writing', code: 'ENGL 102', instructor: 'Prof. Ben Torres', room: 'Room 305', building: 'Main', day: 'Fri', time: '10:30–12:00', type: 'Lecture', isToday: false },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const Ico = ({ d, size = 15 }: { d: string; size?: number }) => (
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

const IcoArrow = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={13} />;
const IcoClock = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" size={14} />;
const IcoRoom = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9" size={14} />;
const IcoUser = () => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8" size={14} />;
const IcoBook = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4h16v13M4 19.5V21" size={14} />;
const IcoCalendar = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={15} />;
const IcoID = () => <Ico d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" size={15} />;
const IcoFlask = () => <Ico d="M9 3h6M10 3v5l-3.5 7A3 3 0 009.5 21h5a3 3 0 002.96-6L14 8V3" size={13} />;

// ─────────────────────────────────────────────────────────────
// Schedule Card
// ─────────────────────────────────────────────────────────────
function TodayCard({ cls }: { cls: ScheduleClass }) {
  const isLab = cls.type === 'Lab';

  return (
    <div
      className="card p-4 flex flex-col gap-2.5 hover:-translate-y-px transition-transform duration-150"
      style={{
        borderLeft: `3px solid ${isLab ? '#6366f1' : 'var(--color-primary-light)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
            {cls.subject}
          </p>
          <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
            {cls.code}
          </p>
        </div>

        <span
          className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={
            isLab
              ? { background: '#eef2ff', color: '#3730a3' }
              : { background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }
          }
        >
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
// Weekly Grid
// ─────────────────────────────────────────────────────────────
function WeekGrid() {
  const today = 'Mon';

  const dayMap: Record<string, ScheduleClass[]> = {};
  DAYS.forEach(d => (dayMap[d] = []));

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
            <div className="flex justify-center">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={
                  isToday
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-text-muted)' }
                }
              >
                {day}
              </span>
            </div>

            {classes.length === 0 ? (
              <div
                className="h-14 rounded-lg border border-dashed flex items-center justify-center"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Free
                </span>
              </div>
            ) : (
              classes.map(c => (
                <div
                  key={c.id}
                  className="rounded-lg p-2 flex flex-col gap-0.5"
                  style={{
                    background: c.type === 'Lab' ? '#eef2ff' : 'var(--color-primary-muted)',
                    borderLeft: `2px solid ${
                      c.type === 'Lab' ? '#6366f1' : 'var(--color-primary-light)'
                    }`,
                  }}
                >
                  <p
                    className="text-[10.5px] font-semibold"
                    style={{ color: c.type === 'Lab' ? '#3730a3' : 'var(--color-primary)' }}
                  >
                    {c.code}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {c.time.split('–')[0]}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {c.room}
                  </p>
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
// Student ID Chip
// ─────────────────────────────────────────────────────────────
function IDChip() {
  const initials = STUDENT_NAME.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="card flex items-center gap-4"
      style={{ padding: '14px 20px', boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold"
        style={{
          background: 'var(--color-primary-muted)',
          color: 'var(--color-primary)',
        }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>
          {STUDENT_NAME}
        </p>
        <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {STUDENT_ID} · {STUDENT_COURSE}
        </p>
      </div>

      <span
        className="text-[11px] font-semibold px-3 py-1 rounded-full"
        style={{
          background:
            STUDENT_TYPE === 'irregular'
              ? '#fff8e6'
              : 'var(--color-primary-muted)',
          color: STUDENT_TYPE === 'irregular' ? '#92620a' : 'var(--color-primary)',
        }}
      >
        {STUDENT_TYPE === 'irregular' ? 'Irregular' : 'Regular'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [scheduleTab, setScheduleTab] = useState<'today' | 'week'>('today');

  const todayClasses = MY_SCHEDULE.filter(c => c.isToday);

  return (
    <AppShell role="student" userName={STUDENT_NAME} pageTitle="Dashboard">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
            Good morning, Carlo 👋
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Thursday · You have {todayClasses.length}{' '}
            {todayClasses.length === 1 ? 'class' : 'classes'} today.
          </p>
        </div>
      </div>

      {/* ID */}
      <div className="mb-5">
        <IDChip />
      </div>

      {/* KPI */}
      <div className="grid gap-4 mb-6 grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">
          <p className="text-[26px] font-bold" style={{ color: 'var(--color-primary)' }}>
            {todayClasses.length}
          </p>
          <p className="text-[12px]">Classes Today</p>
        </div>

        <div className="card p-4">
          <p className="text-[26px] font-bold" style={{ color: '#3730a3' }}>
            {MY_SCHEDULE.length}
          </p>
          <p className="text-[12px]">Total Subjects</p>
        </div>

        <div className="card p-4">
          <p className="text-[12px] font-medium">Student ID</p>
          <p className="text-[16px] font-bold">{STUDENT_ID}</p>
        </div>
      </div>

      {/* Schedule */}
      <div className="card mb-5">
        <div className="card-body pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold">My Schedule</h2>
            <p className="text-[11.5px] text-[var(--color-text-muted)]">
              {scheduleTab === 'today' ? 'Today' : 'This Week'}
            </p>
          </div>

          <div className="flex rounded-lg p-0.5" style={{ background: 'var(--color-surface-2)' }}>
            {(['today', 'week'] as const).map(t => (
              <button
                key={t}
                onClick={() => setScheduleTab(t)}
                className="px-4 py-1.5 text-[12px] font-semibold rounded-md"
                style={
                  scheduleTab === t
                    ? {
                        background: 'var(--color-surface)',
                        color: 'var(--color-primary)',
                      }
                    : { color: 'var(--color-text-muted)' }
                }
              >
                {t === 'today' ? 'Today' : 'Week'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          {scheduleTab === 'today' ? (
            todayClasses.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayClasses.map(cls => (
                  <TodayCard key={cls.id} cls={cls} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-[12px] text-[var(--color-text-muted)]">
                No classes today
              </div>
            )
          ) : (
            <WeekGrid />
          )}
        </div>
      </div>

      {/* Full table */}
      <div className="card">
        <div className="card-body pb-2">
          <h2 className="text-[14px] font-semibold">All Enrolled Subjects</h2>
          <p className="text-[11.5px] text-[var(--color-text-muted)]">
            This semester schedule
          </p>
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
                    <p className="text-[12.5px] font-medium">{cls.subject}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {cls.code}
                    </p>
                  </td>
                  <td className="text-[12.5px]">{cls.instructor}</td>
                  <td>
                    <p className="text-[12.5px]">{cls.room}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {cls.building} Bldg
                    </p>
                  </td>
                  <td>
                    <p className="text-[12.5px]">{cls.day}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {cls.time}
                    </p>
                  </td>
                  <td>
                    <span className="text-[11px] px-2 py-0.5 rounded-full">
                      {cls.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}