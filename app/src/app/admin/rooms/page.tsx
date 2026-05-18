"use client";

import AppShell from "@/components/Navbar";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomType {
  id: number;
  name: string;
}

interface Room {
  id: number;
  room_number: string;
  building: string;
  capacity: number;
  type_id: number;
  type_name: string;
  is_available: boolean;
  created_at: string;
  /** placeholder: how many active bookings this room has today */
  active_bookings: number;
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: Replace with API fetch — GET /api/rooms?include=type&include=booking_count

const ROOM_TYPES: RoomType[] = [
  { id: 1, name: "Lecture" },
  { id: 2, name: "Laboratory" },
  { id: 3, name: "Seminar" },
  { id: 4, name: "AVR" },
  { id: 5, name: "Gymnasium" },
];

const ROOMS: Room[] = [
  {
    id: 1,
    room_number: "CS-101",
    building: "New Academic Building",
    capacity: 50,
    type_id: 1,
    type_name: "Lecture",
    is_available: true,
    created_at: "2025-06-01",
    active_bookings: 3,
  },
  {
    id: 2,
    room_number: "CS-102",
    building: "New Academic Building",
    capacity: 50,
    type_id: 1,
    type_name: "Lecture",
    is_available: true,
    created_at: "2025-06-01",
    active_bookings: 1,
  },
  {
    id: 3,
    room_number: "CS-103",
    building: "New Academic Building",
    capacity: 40,
    type_id: 1,
    type_name: "Lecture",
    is_available: false,
    created_at: "2025-06-01",
    active_bookings: 0,
  },
  {
    id: 4,
    room_number: "Lab-1",
    building: "Science Complex",
    capacity: 35,
    type_id: 2,
    type_name: "Laboratory",
    is_available: true,
    created_at: "2025-06-02",
    active_bookings: 2,
  },
  {
    id: 5,
    room_number: "Lab-2",
    building: "Science Complex",
    capacity: 35,
    type_id: 2,
    type_name: "Laboratory",
    is_available: true,
    created_at: "2025-06-02",
    active_bookings: 4,
  },
  {
    id: 6,
    room_number: "Lab-3",
    building: "Science Complex",
    capacity: 30,
    type_id: 2,
    type_name: "Laboratory",
    is_available: false,
    created_at: "2025-06-02",
    active_bookings: 0,
  },
  {
    id: 7,
    room_number: "AVR-1",
    building: "Main Building",
    capacity: 80,
    type_id: 4,
    type_name: "AVR",
    is_available: true,
    created_at: "2025-06-03",
    active_bookings: 1,
  },
  {
    id: 8,
    room_number: "AVR-2",
    building: "Main Building",
    capacity: 60,
    type_id: 4,
    type_name: "AVR",
    is_available: true,
    created_at: "2025-06-03",
    active_bookings: 0,
  },
  {
    id: 9,
    room_number: "SEM-1",
    building: "Faculty Center",
    capacity: 25,
    type_id: 3,
    type_name: "Seminar",
    is_available: true,
    created_at: "2025-06-04",
    active_bookings: 2,
  },
  {
    id: 10,
    room_number: "GYM-1",
    building: "Sports Complex",
    capacity: 200,
    type_id: 5,
    type_name: "Gymnasium",
    is_available: true,
    created_at: "2025-06-05",
    active_bookings: 0,
  },
];

// ─── Capacity Badge ───────────────────────────────────────────────────────────
function capacityColor(cap: number): string {
  if (cap >= 100) return "badge-blue";
  if (cap >= 50) return "badge-green";
  if (cap >= 30) return "badge-yellow";
  return "badge-gray";
}

// ─── Type icon ────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Lecture: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
      />
    </svg>
  ),
  Laboratory: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
      />
    </svg>
  ),
  Seminar: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>
  ),
  AVR: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
      />
    </svg>
  ),
  Gymnasium: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  ),
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function AdminRoomsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [availFilter, setAvailFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const filtered = ROOMS.filter((r) => {
    const matchSearch =
      r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type_name === typeFilter;
    const matchAvail =
      availFilter === "all" ||
      (availFilter === "available" && r.is_available) ||
      (availFilter === "unavailable" && !r.is_available);
    return matchSearch && matchType && matchAvail;
  });

  const stats = {
    total: ROOMS.length,
    available: ROOMS.filter((r) => r.is_available).length,
    unavailable: ROOMS.filter((r) => !r.is_available).length,
  };

  return (
    <AppShell role="admin" userName="Admin Cruz" pageTitle="Room Management">
      <div className="animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1
              className="text-[20px] font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Room Management
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Manage campus rooms, availability, and capacity settings.
            </p>
          </div>
          <a href="/admin/rooms/create" className="btn btn-primary">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Room
          </a>
        </div>

        {/* ── Stat Row ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Rooms", value: stats.total, badge: "badge-gray" },
            {
              label: "Available",
              value: stats.available,
              badge: "badge-green",
            },
            {
              label: "Under Maintenance",
              value: stats.unavailable,
              badge: "badge-red",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card card-body flex items-center justify-between animate-fade-in"
            >
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {s.label}
              </span>
              <span
                className={`badge ${s.badge} text-base font-semibold px-3 py-1`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div
          className="card mb-4 animate-fade-in"
          style={{ animationDelay: "40ms" }}
        >
          <div className="card-body flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-50">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-text-muted)" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search by room number or building…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "auto", minWidth: 150 }}
            >
              <option value="all">All Types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Availability filter */}
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              style={{ width: "auto", minWidth: 160 }}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Under Maintenance</option>
            </select>

            {/* Result count */}
            <span
              className="text-xs ml-auto"
              style={{ color: "var(--color-text-muted)" }}
            >
              {filtered.length} of {ROOMS.length} rooms
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="card animate-fade-in"
          style={{ animationDelay: "80ms" }}
        >
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Building</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Active Bookings</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      No rooms match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((room) => (
                    <tr key={room.id}>
                      <td>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          {room.room_number}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {room.building}
                        </span>
                      </td>
                      <td>
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {TYPE_ICONS[room.type_name]}
                          {room.type_name}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${capacityColor(room.capacity)}`}
                        >
                          {room.capacity} pax
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-sm tabular-nums font-medium"
                          style={{
                            color:
                              room.active_bookings > 0
                                ? "var(--color-primary)"
                                : "var(--color-text-muted)",
                          }}
                        >
                          {room.active_bookings}
                        </span>
                      </td>
                      <td>
                        {room.is_available ? (
                          <span className="badge badge-green">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Available
                          </span>
                        ) : (
                          <span className="badge badge-red">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            Maintenance
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/admin/rooms/${room.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 10px" }}
                            title="View / Edit"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                            Edit
                          </a>
                          <button
                            onClick={() => setShowDeleteModal(room.id)}
                            className="btn btn-sm"
                            style={{
                              padding: "6px 10px",
                              backgroundColor: "var(--color-error-light)",
                              color: "var(--color-error)",
                              border: "none",
                              borderRadius: "var(--radius-sm)",
                            }}
                            title="Mark as Unavailable"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder */}
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Showing {filtered.length} results
            </span>
            <div className="flex items-center gap-1.5">
              <button
                className="btn btn-ghost btn-sm"
                disabled
                style={{ opacity: 0.4 }}
              >
                Previous
              </button>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: "var(--color-primary-muted)",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                }}
              >
                1
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled
                style={{ opacity: 0.4 }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ── Disable Confirmation Modal ── */}
        {showDeleteModal !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setShowDeleteModal(null)}
          >
            <div
              className="card card-body animate-fade-in"
              style={{ width: 420, maxWidth: "90vw" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--color-error-light)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--color-error)"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">
                    Disable Room #{showDeleteModal}?
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Setting this room as unavailable will prevent new requests
                    from being submitted. Existing confirmed schedules are not
                    affected.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    // TODO: PATCH /api/rooms/:id  { is_available: false }
                    setShowDeleteModal(null);
                  }}
                >
                  Confirm Disable
                </button>
              </div>
            </div>
          </div>
        )}

        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Dalisay v1.0 · 2025
        </p>
      </div>
    </AppShell>
  );
}
