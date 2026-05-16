'use client';

/**
 * /instructor/rooms
 *
 * Tables consumed (per Pages.pdf):
 *   Rooms             — room_number, building, capacity, is_available, type_id
 *   Room_Types        — name (Lecture, Laboratory, Seminar, AVR, Gymnasium)
 *   Confirmed_Schedule — used to derive real-time availability per slot
 *                        (room is busy if an active booking overlaps the
 *                         queried day + time window)
 *
 * Access: Instructor (read + navigate to request form)
 * This page is browse-only. No booking is made here.
 * Clicking "Request This Room" links to /requests/create?roomId=X
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types  (mirror DB columns exactly)
// ─────────────────────────────────────────────────────────────
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// Rooms JOIN Room_Types
interface Room {
  id:          number;           // Rooms.id
  roomNumber:  string;           // Rooms.room_number  e.g. CS-101
  building:    string;           // Rooms.building
  capacity:    number;           // Rooms.capacity
  typeName:    string;           // Room_Types.name
  typeId:      number;           // Rooms.type_id
  isAvailable: boolean;          // Rooms.is_available (Admin toggle)
  createdAt:   string;
}

// A booked slot from Confirmed_Schedule
interface BookedSlot {
  roomId:    number;
  dayOfWeek: DayOfWeek;
  timeStart: string;   // HH:MM
  timeEnd:   string;
  isActive:  boolean;
  section:   string;   // display label e.g. "BSCS 3-A"
  course:    string;   // e.g. "CS 3101"
  instructor:string;
}

// ─────────────────────────────────────────────────────────────
// Mock data — mirrors DB join
// ─────────────────────────────────────────────────────────────
const ROOMS: Room[] = [
  { id: 1,  roomNumber: 'CS-101',   building: 'New Academic Building', capacity: 45, typeName: 'Lecture',    typeId: 1, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 2,  roomNumber: 'CS-202',   building: 'New Academic Building', capacity: 40, typeName: 'Lecture',    typeId: 1, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 3,  roomNumber: 'CS-204',   building: 'New Academic Building', capacity: 40, typeName: 'Lecture',    typeId: 1, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 4,  roomNumber: 'ICT-Lab1', building: 'ICT Building',          capacity: 30, typeName: 'Laboratory', typeId: 2, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 5,  roomNumber: 'ICT-Lab2', building: 'ICT Building',          capacity: 30, typeName: 'Laboratory', typeId: 2, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 6,  roomNumber: 'ICT-Lab3', building: 'ICT Building',          capacity: 25, typeName: 'Laboratory', typeId: 2, isAvailable: false, createdAt: '2025-01-10' }, // under renovation
  { id: 7,  roomNumber: 'GE-305',   building: 'Main Building',         capacity: 50, typeName: 'Lecture',    typeId: 1, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 8,  roomNumber: 'GE-201',   building: 'Main Building',         capacity: 50, typeName: 'Lecture',    typeId: 1, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 9,  roomNumber: 'SEM-1',    building: 'Admin Building',        capacity: 20, typeName: 'Seminar',    typeId: 3, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 10, roomNumber: 'SEM-2',    building: 'Admin Building',        capacity: 20, typeName: 'Seminar',    typeId: 3, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 11, roomNumber: 'AVR-1',    building: 'Main Building',         capacity: 120,typeName: 'AVR',        typeId: 4, isAvailable: true,  createdAt: '2025-01-10' },
  { id: 12, roomNumber: 'GYM-Main', building: 'Gymnasium',             capacity: 500,typeName: 'Gymnasium',  typeId: 5, isAvailable: true,  createdAt: '2025-01-10' },
];

// Active bookings from Confirmed_Schedule (is_active = TRUE)
const BOOKED_SLOTS: BookedSlot[] = [
  { roomId: 1,  dayOfWeek: 'Monday',    timeStart: '07:30', timeEnd: '09:00', isActive: true, section: 'BSCS 3-A', course: 'CS 3101', instructor: 'Dr. Santos'    },
  { roomId: 1,  dayOfWeek: 'Wednesday', timeStart: '07:30', timeEnd: '09:00', isActive: true, section: 'BSCS 3-A', course: 'CS 3101', instructor: 'Dr. Santos'    },
  { roomId: 1,  dayOfWeek: 'Friday',    timeStart: '07:30', timeEnd: '09:00', isActive: true, section: 'BSCS 3-A', course: 'CS 3101', instructor: 'Dr. Santos'    },
  { roomId: 1,  dayOfWeek: 'Monday',    timeStart: '09:00', timeEnd: '10:30', isActive: true, section: 'BSIT 2-A', course: 'IT 2101', instructor: 'Prof. Cruz'    },
  { roomId: 2,  dayOfWeek: 'Tuesday',   timeStart: '09:00', timeEnd: '10:30', isActive: true, section: 'BSCS 3-A', course: 'CS 3201', instructor: 'Dr. Mendoza'   },
  { roomId: 2,  dayOfWeek: 'Thursday',  timeStart: '09:00', timeEnd: '10:30', isActive: true, section: 'BSCS 3-A', course: 'CS 3201', instructor: 'Dr. Mendoza'   },
  { roomId: 3,  dayOfWeek: 'Monday',    timeStart: '13:00', timeEnd: '14:30', isActive: true, section: 'BSCS 4-A', course: 'CS 4101', instructor: 'Prof. Reyes'   },
  { roomId: 4,  dayOfWeek: 'Monday',    timeStart: '13:00', timeEnd: '14:30', isActive: true, section: 'IT 3-B',   course: 'IT 3101', instructor: 'Prof. dela Cruz'},
  { roomId: 4,  dayOfWeek: 'Wednesday', timeStart: '13:00', timeEnd: '14:30', isActive: true, section: 'IT 3-B',   course: 'IT 3101', instructor: 'Prof. dela Cruz'},
  { roomId: 7,  dayOfWeek: 'Friday',    timeStart: '10:30', timeEnd: '12:00', isActive: true, section: 'BSCS 3-A', course: 'GE 102',  instructor: 'Prof. Torres'  },
  { roomId: 8,  dayOfWeek: 'Tuesday',   timeStart: '13:00', timeEnd: '14:30', isActive: true, section: 'BSCS 2-B', course: 'CS 2101', instructor: 'Dr. Reyes'     },
];

// All distinct time slots used in the system (for the availability checker)
const TIME_SLOTS = [
  '07:30–09:00',
  '09:00–10:30',
  '10:30–12:00',
  '13:00–14:30',
  '14:30–16:00',
  '16:00–17:30',
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
};
const ROOM_TYPES = ['All', 'Lecture', 'Laboratory', 'Seminar', 'AVR', 'Gymnasium'];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function toMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** Check if a room is occupied at a given day + time slot */
function isRoomBusy(roomId: number, day: DayOfWeek, slotStart: string, slotEnd: string): BookedSlot | null {
  return BOOKED_SLOTS.find(b =>
    b.roomId === roomId &&
    b.dayOfWeek === day &&
    b.isActive &&
    toMins(b.timeStart) < toMins(slotEnd) &&
    toMins(b.timeEnd)   > toMins(slotStart),
  ) ?? null;
}

/** Returns how many slots (out of total weekday slots) are free for a room */
function freeSlotCount(roomId: number): number {
  let free = 0;
  const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  weekdays.forEach(d => {
    TIME_SLOTS.forEach(slot => {
      const [s, e] = slot.split('–');
      if (!isRoomBusy(roomId, d, s, e)) free++;
    });
  });
  return free;
}

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  Lecture:    { bg: '#e8f5ee', color: '#1a7a3c' },
  Laboratory: { bg: '#eef2ff', color: '#3730a3' },
  Seminar:    { bg: '#fff8e6', color: '#92620a' },
  AVR:        { bg: '#f0f9ff', color: '#0369a1' },
  Gymnasium:  { bg: '#fdf4ff', color: '#6b21a8' },
};

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
const IcoRoom     = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />;
const IcoUsers    = () => <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M9 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoClock    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoCheck    = () => <Ico d="M20 6L9 17l-5-5" />;
const IcoX        = () => <Ico d="M18 6L6 18M6 6l12 12" />;
const IcoPlus     = () => <Ico d="M12 5v14M5 12h14" />;
const IcoGrid     = () => <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />;
const IcoList     = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IcoInfo     = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoCalendar = () => <Ico d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />;
const IcoAlert    = () => <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />;

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function AvailabilityDot({ busy }: { busy: boolean }) {
  return (
    <span className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: busy ? '#d93025' : '#22a050' }} />
  );
}

/** Room card — grid view */
function RoomCard({
  room, onSelect, selected,
}: {
  room: Room;
  onSelect: (r: Room) => void;
  selected: boolean;
}) {
  const ts = TYPE_STYLE[room.typeName] ?? { bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' };
  const freeCount = freeSlotCount(room.id);
  const totalSlots = 5 * TIME_SLOTS.length;
  const pctFree = Math.round((freeCount / totalSlots) * 100);
  const barColor = pctFree > 60 ? '#22a050' : pctFree > 30 ? '#f0a500' : '#d93025';

  return (
    <div
      onClick={() => room.isAvailable && onSelect(room)}
      className="card overflow-hidden transition-all duration-150"
      style={{
        cursor: room.isAvailable ? 'pointer' : 'not-allowed',
        opacity: room.isAvailable ? 1 : 0.55,
        outline: selected ? '2px solid var(--color-primary-light)' : 'none',
        outlineOffset: '2px',
        boxShadow: selected ? 'var(--shadow-green)' : 'var(--shadow-sm)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ background: ts.color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-[15px] font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
              {room.roomNumber}
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {room.building}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
            style={{ background: ts.bg, color: ts.color }}>
            {room.typeName}
          </span>
        </div>

        {/* Capacity row */}
        <div className="flex items-center gap-1.5 text-[12.5px] mb-3"
          style={{ color: 'var(--color-text-secondary)' }}>
          <IcoUsers />
          <span><strong style={{ color: 'var(--color-text)' }}>{room.capacity}</strong> seats max</span>
        </div>

        {/* Availability bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Weekly availability
            </span>
            <span className="text-[11px] font-semibold" style={{ color: barColor }}>
              {pctFree}% free
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pctFree}%`, background: barColor }} />
          </div>
        </div>

        {/* Status + action */}
        <div className="flex items-center justify-between">
          {room.isAvailable ? (
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#1a7a3c' }}>
              <AvailabilityDot busy={false} />
              Available
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#d93025' }}>
              <IcoAlert />
              Unavailable
            </div>
          )}
          {room.isAvailable && (
            <Link
              href={`/requests/create?roomId=${room.id}`}
              onClick={e => e.stopPropagation()}
              className="btn btn-sm flex items-center gap-1"
              style={{
                background: 'var(--color-primary-muted)',
                color: 'var(--color-primary)',
                fontSize: '11.5px',
                padding: '5px 10px',
              }}>
              <IcoPlus /> Request
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Availability grid — shown in the detail panel for selected room */
function AvailabilityGrid({ room }: { room: Room }) {
  const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Time Slot
            </th>
            {weekdays.map(d => (
              <th key={d} className="text-center py-2 px-2 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                {DAY_SHORT[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map(slot => {
            const [s, e] = slot.split('–');
            return (
              <tr key={slot} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="py-2 pr-3 font-medium whitespace-nowrap"
                  style={{ color: 'var(--color-text-secondary)', fontSize: '11.5px' }}>
                  {fmt12(s)}–{fmt12(e)}
                </td>
                {weekdays.map(d => {
                  const booking = isRoomBusy(room.id, d, s, e);
                  return (
                    <td key={d} className="py-1.5 px-2 text-center">
                      {booking ? (
                        <div className="rounded-md px-1.5 py-1 inline-flex flex-col items-center"
                          style={{ background: '#fdecea', minWidth: '56px' }}>
                          <span className="text-[9.5px] font-bold leading-tight" style={{ color: '#d93025' }}>
                            {booking.course}
                          </span>
                          <span className="text-[9px] leading-tight" style={{ color: '#d93025', opacity: 0.75 }}>
                            {booking.section}
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-md px-1.5 py-1 inline-flex items-center justify-center"
                          style={{ background: '#e8f5ee', minWidth: '56px' }}>
                          <span className="text-[9.5px] font-semibold" style={{ color: '#1a7a3c' }}>Free</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Room detail panel — slides in on card click */
function RoomDetailPanel({
  room, onClose,
}: {
  room: Room;
  onClose: () => void;
}) {
  const ts = TYPE_STYLE[room.typeName] ?? { bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' };
  const freeCount  = freeSlotCount(room.id);
  const totalSlots = 5 * TIME_SLOTS.length;

  return (
    <div className="card animate-slide-right" style={{ boxShadow: 'var(--shadow-md)' }}>
      {/* Panel header */}
      <div className="px-5 py-4 flex items-start justify-between gap-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-[17px] font-bold" style={{ color: 'var(--color-text)' }}>
              {room.roomNumber}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: ts.bg, color: ts.color }}>
              {room.typeName}
            </span>
            {!room.isAvailable && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#fdecea', color: '#d93025' }}>
                Unavailable
              </span>
            )}
          </div>
          <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
            {room.building}
          </p>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}>
          <IcoX />
        </button>
      </div>

      <div className="px-5 py-4">
        {/* Meta chips */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { icon: <IcoUsers />, label: `${room.capacity} seats max`          },
            { icon: <IcoCheck />, label: `${freeCount} / ${totalSlots} slots free` },
            { icon: <IcoCalendar />, label: `Added ${room.createdAt}`           },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
              {m.icon} {m.label}
            </div>
          ))}
        </div>

        {/* Availability grid */}
        <div className="mb-5">
          <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            Weekly Availability
          </h3>
          <AvailabilityGrid room={room} />
        </div>

        {/* Action */}
        {room.isAvailable ? (
          <Link
            href={`/requests/create?roomId=${room.id}`}
            className="btn btn-primary btn-full flex items-center gap-2 text-[13px]">
            <IcoPlus /> Request This Room
          </Link>
        ) : (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
            style={{ background: 'var(--color-error-light)', borderColor: 'rgba(217,48,37,.2)', color: 'var(--color-error)' }}>
            <IcoAlert />
            <p className="text-[12.5px] leading-snug">
              This room is currently marked as <strong>unavailable</strong> by the Administrator
              and cannot be requested.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function InstructorRoomsPage() {
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('All');
  const [dayFilter,   setDayFilter]   = useState<DayOfWeek | 'All'>('All');
  const [slotFilter,  setSlotFilter]  = useState('All');
  const [showUnavail, setShowUnavail] = useState(false);
  const [view,        setView]        = useState<'grid' | 'list'>('grid');
  const [selected,    setSelected]    = useState<Room | null>(null);

  // Derived: filter rooms
  const filtered = useMemo(() => {
    let list = ROOMS;

    // Hide unavailable unless toggled
    if (!showUnavail) list = list.filter(r => r.isAvailable);

    // Type filter
    if (typeFilter !== 'All') list = list.filter(r => r.typeName === typeFilter);

    // Day + slot availability filter
    if (dayFilter !== 'All' && slotFilter !== 'All') {
      const [s, e] = slotFilter.split('–');
      list = list.filter(r => !isRoomBusy(r.id, dayFilter as DayOfWeek, s, e));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.building.toLowerCase().includes(q) ||
        r.typeName.toLowerCase().includes(q),
      );
    }

    return list;
  }, [search, typeFilter, dayFilter, slotFilter, showUnavail]);

  // Stats
  const totalAvail  = ROOMS.filter(r => r.isAvailable).length;
  const totalUnavail = ROOMS.filter(r => !r.isAvailable).length;

  return (
    <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="Browse Rooms">
      <div className="animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              Browse Rooms
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Find an available room and submit a request for your class.
            </p>
          </div>
          <Link href="/requests/create"
            className="btn btn-primary flex items-center gap-2 text-[13px] shrink-0"
            style={{ padding: '9px 18px' }}>
            <IcoPlus /> New Request
          </Link>
        </div>

        {/* ── Summary chips ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Rooms',      value: ROOMS.length,      color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)'  },
            { label: 'Available',        value: totalAvail,         color: '#1a7a3c',  bg: '#e8f5ee'  },
            { label: 'Unavailable',      value: totalUnavail,       color: '#d93025',  bg: '#fdecea'  },
            { label: 'Showing',          value: filtered.length,    color: 'var(--color-primary)',     bg: 'var(--color-primary-muted)' },
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
        <div className="card card-body mb-5" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-2 mb-3">
            <IcoFilter />
            <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }}>
                <IcoSearch />
              </span>
              <input
                type="search"
                placeholder="Room number, building…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '13px', height: '38px' }}
              />
            </div>

            {/* Room type */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}>
              {ROOM_TYPES.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Room Types' : t}</option>
              ))}
            </select>

            {/* Day filter */}
            <select
              value={dayFilter}
              onChange={e => setDayFilter(e.target.value as DayOfWeek | 'All')}
              style={{ fontSize: '13px', height: '38px' }}>
              <option value="All">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Time slot filter */}
            <select
              value={slotFilter}
              onChange={e => setSlotFilter(e.target.value)}
              disabled={dayFilter === 'All'}
              style={{ fontSize: '13px', height: '38px' }}>
              <option value="All">
                {dayFilter === 'All' ? 'Select a day first' : 'All Time Slots'}
              </option>
              {TIME_SLOTS.map(s => (
                <option key={s} value={s}>
                  {fmt12(s.split('–')[0])} – {fmt12(s.split('–')[1])}
                </option>
              ))}
            </select>
          </div>

          {/* Show unavailable toggle + view switcher */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUnavail}
                onChange={e => setShowUnavail(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--color-primary-light)' }}
              />
              <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
                Show unavailable rooms
              </span>
            </label>

            <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--color-surface-2)' }}>
              {([{ k: 'grid', i: <IcoGrid /> }, { k: 'list', i: <IcoList /> }] as const).map(v => (
                <button key={v.k}
                  onClick={() => setView(v.k)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150"
                  style={view === v.k
                    ? { background: 'var(--color-surface)', color: 'var(--color-primary)', boxShadow: 'var(--shadow-xs)' }
                    : { background: 'transparent', color: 'var(--color-text-muted)' }}>
                  {v.i} {v.k === 'grid' ? 'Grid' : 'List'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content: rooms + optional detail panel ── */}
        <div className={`gap-5 ${selected ? 'lg:grid lg:grid-cols-3' : ''}`}
          style={{ display: selected ? undefined : 'block' }}>

          {/* Room list / grid */}
          <div className={selected ? 'lg:col-span-2' : ''}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 card">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface-2)' }}>
                  <IcoRoom />
                </div>
                <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No rooms match your filters
                </p>
                <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
                  Try adjusting the room type or time slot.
                </p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={selected?.id === room.id}
                    onSelect={r => setSelected(prev => prev?.id === r.id ? null : r)}
                  />
                ))}
              </div>
            ) : (
              /* List view */
              <div className="card overflow-hidden">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Building</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Availability</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(room => {
                      const ts2   = TYPE_STYLE[room.typeName] ?? { bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' };
                      const free  = freeSlotCount(room.id);
                      const total = 5 * TIME_SLOTS.length;
                      const pct   = Math.round((free / total) * 100);
                      const bar   = pct > 60 ? '#22a050' : pct > 30 ? '#f0a500' : '#d93025';
                      return (
                        <tr key={room.id}
                          style={{ opacity: room.isAvailable ? 1 : 0.5 }}>
                          <td>
                            <button
                              onClick={() => room.isAvailable && setSelected(prev => prev?.id === room.id ? null : room)}
                              className="text-left bg-transparent border-0 p-0">
                              <p className="text-[13px] font-semibold" style={{ color: 'var(--color-primary-light)' }}>
                                {room.roomNumber}
                              </p>
                            </button>
                          </td>
                          <td className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>{room.building}</td>
                          <td>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                              style={{ background: ts2.bg, color: ts2.color }}>
                              {room.typeName}
                            </span>
                          </td>
                          <td className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>
                            {room.capacity}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-surface-2)', minWidth: '60px' }}>
                                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: bar }} />
                              </div>
                              <span className="text-[11px] font-semibold shrink-0" style={{ color: bar }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td>
                            {room.isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ background: '#e8f5ee', color: '#1a7a3c' }}>
                                <AvailabilityDot busy={false} /> Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ background: '#fdecea', color: '#d93025' }}>
                                <AvailabilityDot busy={true} /> Unavailable
                              </span>
                            )}
                          </td>
                          <td>
                            {room.isAvailable && (
                              <Link href={`/requests/create?roomId=${room.id}`}
                                className="btn btn-sm flex items-center gap-1"
                                style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)', padding: '5px 10px', fontSize: '11.5px' }}>
                                <IcoPlus /> Request
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="mt-4 lg:mt-0">
              <RoomDetailPanel room={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
          <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }}><IcoInfo /></span>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
            Room availability shown is derived from <strong>Confirmed_Schedule</strong> entries.
            A slot shown as <strong>Free</strong> means no approved booking exists for that
            day and time — your request will still go through Admin review before being confirmed.
          </p>
        </div>

      </div>
    </AppShell>
  );
}