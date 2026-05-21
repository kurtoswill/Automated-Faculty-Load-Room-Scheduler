'use client';

/**
 * /requests           — instructor's full request history list
 * /requests/[id]      — single request detail with cancel / release actions
 *
 * Tables consumed (per Pages.pdf):
 *   Room_Requests  — status, day_of_week, time_start, time_end, admin_remarks,
 *                    submitted_at, reviewed_at, reviewed_by
 *   Sections       — section_name, year_level, expected_students, course_id,
 *                    day_of_week, time_start, time_end
 *   Courses        — course_code, course_title, units
 *   Rooms          — room_number, building, capacity
 *
 * Access: Instructor
 * Actions available:
 *   Pending  → Cancel (instructor withdraws; slot released)
 *   Approved → Release (instructor cancels class; slot freed, is_active → false)
 */

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Navbar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Released';
type DayOfWeek     = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// Joined: Room_Requests + Sections + Courses + Rooms
interface RequestRow {
  id:               number;   // Room_Requests.id
  // Sections + Courses
  courseCode:       string;
  courseTitle:      string;
  units:            number;
  sectionName:      string;
  yearLevel:        number;
  expectedStudents: number;
  // Room_Requests scheduling
  dayOfWeek:        DayOfWeek;
  timeStart:        string;
  timeEnd:          string;
  // Rooms
  roomNumber:       string;
  building:         string;
  roomCapacity:     number;
  roomType:         string;
  // Room_Requests status
  status:           RequestStatus;
  adminRemarks:     string | null;
  submittedAt:      string;
  reviewedAt:       string | null;
  reviewedBy:       string | null;  // Admin name
}

// ─────────────────────────────────────────────────────────────
// Mock data — mirrors DB join
// ─────────────────────────────────────────────────────────────
const REQUESTS: RequestRow[] = [
  {
    id: 41, courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    sectionName: 'BSCS 3-A', yearLevel: 3, expectedStudents: 38,
    dayOfWeek: 'Monday', timeStart: '07:30', timeEnd: '09:00',
    roomNumber: 'CS-204', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
    status: 'Pending', adminRemarks: null,
    submittedAt: '2025-05-15 08:30:00', reviewedAt: null, reviewedBy: null,
  },
  {
    id: 38, courseCode: 'CS 4101', courseTitle: 'Software Engineering', units: 3.0,
    sectionName: 'BSCS 4-A', yearLevel: 4, expectedStudents: 25,
    dayOfWeek: 'Tuesday', timeStart: '13:00', timeEnd: '14:30',
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
    status: 'Approved', adminRemarks: null,
    submittedAt: '2025-05-10 09:00:00', reviewedAt: '2025-05-11 10:15:00', reviewedBy: 'Admin Cruz',
  },
  {
    id: 35, courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    sectionName: 'BSCS 3-A', yearLevel: 3, expectedStudents: 38,
    dayOfWeek: 'Wednesday', timeStart: '07:30', timeEnd: '09:00',
    roomNumber: 'ICT-Lab1', building: 'ICT Building', roomCapacity: 30, roomType: 'Laboratory',
    status: 'Approved', adminRemarks: null,
    submittedAt: '2025-05-08 14:00:00', reviewedAt: '2025-05-09 08:30:00', reviewedBy: 'Admin Cruz',
  },
  {
    id: 32, courseCode: 'CS 4101', courseTitle: 'Software Engineering', units: 3.0,
    sectionName: 'BSCS 4-A', yearLevel: 4, expectedStudents: 25,
    dayOfWeek: 'Thursday', timeStart: '13:00', timeEnd: '14:30',
    roomNumber: 'GE-305', building: 'Main Building', roomCapacity: 50, roomType: 'Lecture',
    status: 'Rejected',
    adminRemarks: 'Room already has a confirmed booking for that slot. Please request a different room.',
    submittedAt: '2025-05-05 10:00:00', reviewedAt: '2025-05-06 09:00:00', reviewedBy: 'Admin Cruz',
  },
  {
    id: 29, courseCode: 'CS 3101', courseTitle: 'Data Structures and Algorithms', units: 3.0,
    sectionName: 'BSCS 3-A', yearLevel: 3, expectedStudents: 38,
    dayOfWeek: 'Friday', timeStart: '07:30', timeEnd: '09:00',
    roomNumber: 'CS-101', building: 'New Academic Building', roomCapacity: 45, roomType: 'Lecture',
    status: 'Cancelled', adminRemarks: null,
    submittedAt: '2025-04-28 11:00:00', reviewedAt: null, reviewedBy: null,
  },
  {
    id: 24, courseCode: 'CS 4101', courseTitle: 'Software Engineering', units: 3.0,
    sectionName: 'BSCS 4-A', yearLevel: 4, expectedStudents: 25,
    dayOfWeek: 'Monday', timeStart: '10:30', timeEnd: '12:00',
    roomNumber: 'CS-202', building: 'New Academic Building', roomCapacity: 40, roomType: 'Lecture',
    status: 'Released', adminRemarks: null,
    submittedAt: '2025-04-20 08:00:00', reviewedAt: '2025-04-21 10:00:00', reviewedBy: 'Admin Cruz',
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtDateTime(ts: string) {
  return new Date(ts).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLE: Record<RequestStatus, { bg: string; color: string; dot: string; label: string }> = {
  Pending:   { bg: '#fff8e6', color: '#92620a', dot: '#f0a500', label: 'Pending'   },
  Approved:  { bg: '#e8f5ee', color: '#1a7a3c', dot: '#22a050', label: 'Approved'  },
  Rejected:  { bg: '#fdecea', color: '#d93025', dot: '#d93025', label: 'Rejected'  },
  Cancelled: { bg: 'var(--color-surface-2)', color: 'var(--color-text-muted)', dot: '#9ba3b2', label: 'Cancelled' },
  Released:  { bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9', label: 'Released'  },
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
const IcoPlus    = () => <Ico d="M12 5v14M5 12h14" />;
const IcoSearch  = () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const IcoRoom    = () => <Ico d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />;
const IcoBook    = () => <Ico d="M4 19.5A2.5 2.5 0 016.5 17H20V5H6.5A2.5 2.5 0 004 7.5V19.5zM6.5 4.5H20" />;
const IcoClock   = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" />;
const IcoCalendar= () => <Ico d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />;
const IcoAlert   = () => <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />;
const IcoInfo    = () => <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" />;
const IcoArrow   = () => <Ico d="M5 12h14M12 5l7 7-7 7" size={14} />;
const IcoBack    = () => <Ico d="M19 12H5M12 19l-7-7 7-7" />;
const IcoX       = () => <Ico d="M18 6L6 18M6 6l12 12" />;
const IcoUnlock  = () => <Ico d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1" />;
const IcoUsers   = () => <Ico d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M9 11a4 4 0 100-8 4 4 0 000 8z" />;
const IcoCheck   = () => <Ico d="M20 6L9 17l-5-5" />;

// ─────────────────────────────────────────────────────────────
// Shared: Status Badge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm Modal (Cancel / Release)
// ─────────────────────────────────────────────────────────────
function ConfirmModal({
  action, onConfirm, onCancel, loading,
}: {
  action: 'cancel' | 'release';
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isCancelling = action === 'cancel';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,.45)' }}>
      <div className="card w-full max-w-md animate-fade-in" style={{ boxShadow: 'var(--shadow-xl)' }}>
        <div className="card-body">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isCancelling ? 'var(--color-surface-2)' : '#fdecea' }}>
              {isCancelling ? <IcoX /> : <IcoUnlock />}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-text)' }}>
                {isCancelling ? 'Cancel Request' : 'Release Booking'}
              </h3>
              <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {isCancelling
                  ? 'This pending request will be withdrawn. The room slot will be freed immediately.'
                  : 'This approved booking will be released. The room slot returns to available for other instructors.'}
              </p>
            </div>
          </div>

          {!isCancelling && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mb-4"
              style={{ background: '#fdecea', color: 'var(--color-error)' }}>
              <IcoAlert />
              <p className="text-[12px] leading-snug">
                Releasing an approved booking cannot be undone. This action will be recorded in the Audit Log.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} disabled={loading} className="btn btn-ghost">
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn flex items-center gap-2"
              style={{
                background: isCancelling ? 'var(--color-surface-2)' : 'var(--color-error)',
                color:      isCancelling ? 'var(--color-text)'       : '#fff',
                opacity: loading ? 0.8 : 1,
              }}>
              {loading ? 'Processing…' : isCancelling ? 'Yes, Cancel Request' : 'Yes, Release Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page: /requests (list)
// ─────────────────────────────────────────────────────────────
export function RequestsListPage() {
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState<RequestStatus | 'All'>('All');
  const [requests,   setRequests]   = useState<RequestRow[]>(REQUESTS);
  const [modal,      setModal]      = useState<{ id: number; action: 'cancel' | 'release' } | null>(null);
  const [acting,     setActing]     = useState(false);

  const allStatuses: (RequestStatus | 'All')[] = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Released'];

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.courseCode.toLowerCase().includes(q) ||
      r.courseTitle.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q) ||
      r.sectionName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    Pending:  requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  async function handleAction() {
    if (!modal) return;
    setActing(true);
    await new Promise(r => setTimeout(r, 900));
    setRequests(prev => prev.map(r =>
      r.id === modal.id
        ? { ...r, status: modal.action === 'cancel' ? 'Cancelled' : 'Released' }
        : r,
    ));
    setActing(false);
    setModal(null);
  }

  return (
    <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="My Room Requests">
      {modal && (
        <ConfirmModal
          action={modal.action}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
          loading={acting}
        />
      )}
      <div className="animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
              My Room Requests
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Track the status of your submitted requests.
            </p>
          </div>
          <Link href="/requests/create"
            className="btn btn-primary flex items-center gap-2 text-[13px] shrink-0"
            style={{ padding: '9px 18px' }}>
            <IcoPlus /> New Request
          </Link>
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Pending',  count: counts.Pending,  color: '#92620a', bg: '#fff8e6' },
            { label: 'Approved', count: counts.Approved, color: '#1a7a3c', bg: '#e8f5ee' },
            { label: 'Rejected', count: counts.Rejected, color: '#d93025', bg: '#fdecea' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3"
              style={{ padding: '12px 16px', borderLeft: `3px solid ${s.color}` }}>
              <div>
                <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative" style={{ minWidth: '200px', flex: 1, maxWidth: '280px' }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}>
              <IcoSearch />
            </span>
            <input
              type="search" placeholder="Search course, room…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '13px', height: '36px' }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {allStatuses.map(s => (
              <button key={s}
                onClick={() => setStatus(s)}
                className="text-[11.5px] font-semibold px-3 py-1 rounded-full transition-all"
                style={statusFilter === s
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 gap-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-surface-2)' }}>
              <IcoRoom />
            </div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No requests found
            </p>
            <p className="text-[12.5px]" style={{ color: 'var(--color-text-muted)' }}>
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course / Section</th>
                    <th>Room</th>
                    <th>Day & Time</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <span className="text-[11.5px] font-mono"
                          style={{ color: 'var(--color-text-muted)' }}>
                          #{r.id}
                        </span>
                      </td>
                      <td>
                        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
                          {r.courseCode}
                        </p>
                        <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                          {r.sectionName} · {r.courseTitle.split(' ').slice(0, 3).join(' ')}…
                        </p>
                      </td>
                      <td>
                        <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-text)' }}>
                          {r.roomNumber}
                        </p>
                        <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                          {r.building}
                        </p>
                      </td>
                      <td>
                        <p className="text-[12.5px]" style={{ color: 'var(--color-text)' }}>
                          {r.dayOfWeek}
                        </p>
                        <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
                          {fmt12(r.timeStart)} – {fmt12(r.timeEnd)}
                        </p>
                      </td>
                      <td className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                        {fmtDate(r.submittedAt)}
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Link href={`/requests/${r.id}`}
                            className="btn btn-sm flex items-center gap-1"
                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', padding: '5px 10px', fontSize: '11.5px' }}>
                            View <IcoArrow />
                          </Link>
                          {r.status === 'Pending' && (
                            <button
                              onClick={() => setModal({ id: r.id, action: 'cancel' })}
                              className="btn btn-sm flex items-center gap-1"
                              style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '5px 10px', fontSize: '11.5px' }}>
                              <IcoX /> Cancel
                            </button>
                          )}
                          {r.status === 'Approved' && (
                            <button
                              onClick={() => setModal({ id: r.id, action: 'release' })}
                              className="btn btn-sm flex items-center gap-1"
                              style={{ background: '#f0f9ff', color: '#0369a1', padding: '5px 10px', fontSize: '11.5px' }}>
                              <IcoUnlock /> Release
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Page: /requests/[id] (detail)
// ─────────────────────────────────────────────────────────────
export function RequestDetailPage({ id }: { id: number }) {
  const request = REQUESTS.find(r => r.id === id);
  const [status,   setStatus]  = useState<RequestStatus>(request?.status ?? 'Pending');
  const [modal,    setModal]   = useState<'cancel' | 'release' | null>(null);
  const [acting,   setActing]  = useState(false);

  if (!request) {
    return (
      <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle="Request Not Found">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-[16px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Request not found
          </p>
          <Link href="/requests" className="btn btn-primary">Back to Requests</Link>
        </div>
      </AppShell>
    );
  }

  const s = STATUS_STYLE[status];

  async function handleAction(action: 'cancel' | 'release') {
    setActing(true);
    await new Promise(r => setTimeout(r, 900));
    setStatus(action === 'cancel' ? 'Cancelled' : 'Released');
    setActing(false);
    setModal(null);
  }

  const timeline: { label: string; time: string | null; done: boolean; color: string }[] = [
    { label: 'Request Submitted',    time: request.submittedAt,   done: true,             color: '#1a7a3c' },
    { label: status === 'Approved'
        ? 'Approved by Admin'
        : status === 'Rejected'
        ? 'Rejected by Admin'
        : status === 'Cancelled'
        ? 'Cancelled by Instructor'
        : status === 'Released'
        ? 'Released by Instructor'
        : 'Awaiting Admin Review',
      time: request.reviewedAt,
      done: status !== 'Pending',
      color: status === 'Approved' ? '#1a7a3c'
           : status === 'Rejected' ? '#d93025'
           : status === 'Cancelled' || status === 'Released' ? '#0369a1'
           : '#9ba3b2',
    },
  ];

  return (
    <AppShell role="instructor" userName="Dr. Maria Santos" pageTitle={`Request #${id}`}>
      {modal && (
        <ConfirmModal
          action={modal}
          onConfirm={() => handleAction(modal)}
          onCancel={() => setModal(null)}
          loading={acting}
        />
      )}
      <div className="max-w-2xl mx-auto animate-fade-in">

        {/* Back + header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/requests"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)' }}>
            <IcoBack />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-bold" style={{ color: 'var(--color-text)' }}>
                Request #{id}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              Submitted {fmtDateTime(request.submittedAt)}
            </p>
          </div>
          {status === 'Pending' && (
            <button
              onClick={() => setModal('cancel')}
              className="btn btn-sm flex items-center gap-1.5"
              style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '7px 14px' }}>
              <IcoX /> Cancel Request
            </button>
          )}
          {status === 'Approved' && (
            <button
              onClick={() => setModal('release')}
              className="btn btn-sm flex items-center gap-1.5"
              style={{ background: '#f0f9ff', color: '#0369a1', padding: '7px 14px' }}>
              <IcoUnlock /> Release Booking
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">

          {/* Rejection remark banner */}
          {status === 'Rejected' && request.adminRemarks && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border"
              style={{ background: 'var(--color-error-light)', borderColor: 'rgba(217,48,37,.2)', color: 'var(--color-error)' }}>
              <span className="shrink-0 mt-0.5"><IcoAlert /></span>
              <div>
                <p className="text-[13px] font-semibold">Rejection Reason</p>
                <p className="text-[12.5px] mt-0.5 leading-snug">{request.adminRemarks}</p>
              </div>
            </div>
          )}

          {/* Section details */}
          <div className="card">
            <div className="px-5 py-4 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--color-border)' }}>
              <IcoBook />
              <h2 className="text-[13.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
                Section Details
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: 'Course Code',  value: request.courseCode },
                  { label: 'Course Title', value: request.courseTitle },
                  { label: 'Section',      value: request.sectionName },
                  { label: 'Year Level',   value: `Year ${request.yearLevel}` },
                  { label: 'Units',        value: `${request.units.toFixed(1)} units` },
                  { label: 'Expected',     value: `${request.expectedStudents} students` },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}>
                      {f.label}
                    </p>
                    <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule + Room */}
          <div className="card">
            <div className="px-5 py-4 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--color-border)' }}>
              <IcoRoom />
              <h2 className="text-[13.5px] font-semibold" style={{ color: 'var(--color-text)' }}>
                Room & Schedule
              </h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: 'Room Number',  value: request.roomNumber },
                { label: 'Building',     value: request.building },
                { label: 'Room Type',    value: request.roomType },
                { label: 'Capacity',     value: `${request.roomCapacity} seats` },
                { label: 'Day',          value: request.dayOfWeek },
                { label: 'Time',         value: `${fmt12(request.timeStart)} – ${fmt12(request.timeEnd)}` },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {f.label}
                  </p>
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity check visual */}
          <div className="card card-body">
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Capacity Check
            </h3>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-surface-2)' }}>
                <div className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((request.expectedStudents / request.roomCapacity) * 100, 100)}%`,
                    background: request.expectedStudents > request.roomCapacity ? 'var(--color-error)' : '#22a050',
                  }} />
              </div>
              <span className="text-[12px] font-semibold shrink-0"
                style={{ color: request.expectedStudents > request.roomCapacity ? 'var(--color-error)' : '#22a050' }}>
                {request.expectedStudents} / {request.roomCapacity}
              </span>
            </div>
            <p className="text-[11.5px]" style={{ color: 'var(--color-text-muted)' }}>
              {request.expectedStudents <= request.roomCapacity
                ? `${request.roomCapacity - request.expectedStudents} seats to spare.`
                : `Exceeds capacity by ${request.expectedStudents - request.roomCapacity}.`
              }
            </p>
          </div>

          {/* Timeline */}
          <div className="card card-body">
            <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Request Timeline
            </h3>
            <div className="flex flex-col gap-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ background: t.done ? t.color : 'var(--color-border)' }} />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: 'var(--color-border)', minHeight: '24px' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: t.done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {t.label}
                    </p>
                    {t.time ? (
                      <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {fmtDateTime(t.time)}
                        {request.reviewedBy && i === 1 && ` · by ${request.reviewedBy}`}
                      </p>
                    ) : (
                      <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {t.done ? '' : 'Awaiting action…'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info note for pending */}
          {status === 'Pending' && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
              style={{ background: 'var(--color-primary-muted)', borderColor: 'rgba(34,160,80,.2)' }}>
              <span style={{ color: 'var(--color-primary)', marginTop: '1px' }}><IcoInfo /></span>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-primary)' }}>
                Your request is in the Admin review queue. The slot is temporarily held while pending.
                You will receive a notification once a decision is made.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Default export — acts as both list and detail demo
// To use in Next.js:
//   /requests        → export RequestsListPage as default
//   /requests/[id]   → export RequestDetailPage as default, pass params.id
// ─────────────────────────────────────────────────────────────
export default function RequestsDemo() {
  const [view, setView] = useState<'list' | number>('list');
  return view === 'list'
    ? <RequestsListPage />
    : <RequestDetailPage id={view as number} />;
}