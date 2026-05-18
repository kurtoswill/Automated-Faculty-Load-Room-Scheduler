"use client";

import AppShell from "@/components/Navbar";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomType {
  id: number;
  name: string;
  description: string;
}

interface FormData {
  room_number: string;
  building: string;
  capacity: string;
  type_id: string;
  is_available: boolean;
}

interface FormErrors {
  room_number?: string;
  building?: string;
  capacity?: string;
  type_id?: string;
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────
// TODO: Replace with API fetch — GET /api/room-types
const ROOM_TYPES: RoomType[] = [
  {
    id: 1,
    name: "Lecture",
    description: "Standard classroom for lectures and discussions",
  },
  {
    id: 2,
    name: "Laboratory",
    description: "Equipped lab for hands-on experiments and computing",
  },
  {
    id: 3,
    name: "Seminar",
    description: "Small group room for seminars and meetings",
  },
  {
    id: 4,
    name: "AVR",
    description: "Audio-visual room with projection and sound system",
  },
  {
    id: 5,
    name: "Gymnasium",
    description: "Large multi-purpose sports and events venue",
  },
];

const BUILDINGS = [
  "New Academic Building",
  "Science Complex",
  "Main Building",
  "Faculty Center",
  "Sports Complex",
  "Engineering Building",
  "Library Building",
];

// ─── Type Card ────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Lecture: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
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
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
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
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
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
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
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
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  ),
};

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.room_number.trim()) errors.room_number = "Room number is required.";
  if (!data.building.trim()) errors.building = "Building is required.";
  if (!data.type_id) errors.type_id = "Select a room type.";
  const cap = parseInt(data.capacity);
  if (!data.capacity || isNaN(cap) || cap < 1)
    errors.capacity = "Enter a valid capacity (minimum 1).";
  if (cap > 1000) errors.capacity = "Capacity cannot exceed 1,000.";
  return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminRoomsCreatePage() {
  const [form, setForm] = useState<FormData>({
    room_number: "",
    building: "",
    capacity: "",
    type_id: "",
    is_available: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);

    // TODO: Replace with actual API call
    // await fetch("/api/rooms", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     room_number:  form.room_number.toUpperCase(),
    //     building:     form.building,
    //     capacity:     parseInt(form.capacity),
    //     type_id:      parseInt(form.type_id),
    //     is_available: form.is_available,
    //   }),
    // });

    await new Promise((r) => setTimeout(r, 800)); // placeholder delay
    setIsLoading(false);
    setSubmitted(true);
  }

  const selectedType = ROOM_TYPES.find((t) => t.id === parseInt(form.type_id));
  const capInt = parseInt(form.capacity) || 0;

  // ── Success State ──
  if (submitted) {
    return (
      <div
        className="page-shell"
        style={{ paddingLeft: "240px", paddingTop: "60px" }}
      >
        <div
          style={{ padding: "2rem" }}
          className="flex items-center justify-center min-h-[70vh]"
        >
          <div
            className="card card-body text-center animate-fade-in"
            style={{ maxWidth: 440 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--color-primary-muted)" }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="var(--color-primary)"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1">Room Created</h2>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              <strong>{form.room_number.toUpperCase()}</strong> has been added
              to the room inventory.
            </p>
            <div className="flex gap-2 justify-center">
              <a href="/admin/rooms" className="btn btn-outline btn-sm">
                Back to Rooms
              </a>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setForm({
                    room_number: "",
                    building: "",
                    capacity: "",
                    type_id: "",
                    is_available: true,
                  });
                  setSubmitted(false);
                }}
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell role="admin" userName="Admin Cruz" pageTitle="Create Room">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <a
              href="/admin/dashboard"
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Dashboard
            </a>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              /
            </span>
            <a
              href="/admin/rooms"
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Rooms
            </a>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              /
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Create
            </span>
          </div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Add New Room
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Fill in the room details. All fields are required unless noted.
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="card card-body animate-fade-in">
          {/* Step: Basic Info */}
          <section className="mb-6">
            <h2
              className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <span
                className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              >
                1
              </span>
              Room Identification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room Number */}
              <div className="form-group">
                <label className="form-label">
                  Room Number{" "}
                  <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-101, AVR-2, Lab-3"
                  value={form.room_number}
                  onChange={(e) => handleChange("room_number", e.target.value)}
                  style={
                    errors.room_number
                      ? { borderColor: "var(--color-error)" }
                      : {}
                  }
                />
                {errors.room_number ? (
                  <span className="form-error">{errors.room_number}</span>
                ) : (
                  <span className="form-hint">
                    Use the official room identifier (e.g., CS-101)
                  </span>
                )}
              </div>

              {/* Building */}
              <div className="form-group">
                <label className="form-label">
                  Building{" "}
                  <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <select
                  value={form.building}
                  onChange={(e) => handleChange("building", e.target.value)}
                  style={
                    errors.building ? { borderColor: "var(--color-error)" } : {}
                  }
                >
                  <option value="">Select a building…</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.building && (
                  <span className="form-error">{errors.building}</span>
                )}
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label className="form-label">
                  Capacity{" "}
                  <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    min={1}
                    max={1000}
                    value={form.capacity}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                    style={
                      errors.capacity
                        ? {
                            borderColor: "var(--color-error)",
                            paddingRight: "3.5rem",
                          }
                        : { paddingRight: "3.5rem" }
                    }
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    pax
                  </span>
                </div>
                {errors.capacity ? (
                  <span className="form-error">{errors.capacity}</span>
                ) : (
                  <span className="form-hint">
                    Maximum student headcount. Enforced during request approval.
                  </span>
                )}
              </div>

              {/* Availability */}
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { label: "Available", val: true, badge: "badge-green" },
                    { label: "Maintenance", val: false, badge: "badge-red" },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => handleChange("is_available", opt.val)}
                      className="flex-1 py-2 text-xs font-medium rounded-md border-2 transition-all"
                      style={{
                        borderColor:
                          form.is_available === opt.val
                            ? "var(--color-primary-light)"
                            : "var(--color-border)",
                        backgroundColor:
                          form.is_available === opt.val
                            ? "var(--color-primary-muted)"
                            : "var(--color-surface)",
                        color:
                          form.is_available === opt.val
                            ? "var(--color-primary)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="form-hint">
                  Unavailable rooms cannot receive new requests.
                </span>
              </div>
            </div>
          </section>

          {/* Step: Room Type */}
          <section className="mb-6">
            <h2
              className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <span
                className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              >
                2
              </span>
              Room Type <span style={{ color: "var(--color-error)" }}>*</span>
              {errors.type_id && (
                <span className="form-error ml-2">{errors.type_id}</span>
              )}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {ROOM_TYPES.map((t) => {
                const isSelected = form.type_id === String(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChange("type_id", String(t.id))}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center"
                    style={{
                      borderColor: isSelected
                        ? "var(--color-primary-light)"
                        : "var(--color-border)",
                      backgroundColor: isSelected
                        ? "var(--color-primary-muted)"
                        : "var(--color-surface)",
                      color: isSelected
                        ? "var(--color-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    <span>{TYPE_ICONS[t.name]}</span>
                    <span className="text-xs font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedType && (
              <p
                className="text-xs mt-3 px-3 py-2 rounded-md animate-fade-in"
                style={{
                  backgroundColor: "var(--color-primary-muted)",
                  color: "var(--color-primary)",
                }}
              >
                <strong>{selectedType.name}:</strong> {selectedType.description}
              </p>
            )}
          </section>

          {/* Summary Preview */}
          {(form.room_number ||
            form.building ||
            form.capacity ||
            form.type_id) && (
            <section className="mb-6">
              <h2
                className="text-sm font-semibold mb-3 pb-2 border-b flex items-center gap-2"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  3
                </span>
                Preview
              </h2>
              <div
                className="rounded-lg p-4 border animate-fade-in"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-2)",
                }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Room Number
                    </p>
                    <p className="font-semibold">
                      {form.room_number.toUpperCase() || "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Building
                    </p>
                    <p className="font-medium">{form.building || "—"}</p>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Type
                    </p>
                    <p className="font-medium">{selectedType?.name || "—"}</p>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Capacity
                    </p>
                    <p className="font-medium">
                      {capInt > 0 ? `${capInt} pax` : "—"}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-3 pt-3 border-t flex items-center gap-2"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Initial Status:
                  </span>
                  {form.is_available ? (
                    <span className="badge badge-green text-xs">Available</span>
                  ) : (
                    <span className="badge badge-red text-xs">
                      Under Maintenance
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <div
            className="flex items-center justify-end gap-3 pt-2 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <a href="/admin/rooms" className="btn btn-ghost">
              Cancel
            </a>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
              style={isLoading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
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
                  Create Room
                </>
              )}
            </button>
          </div>
        </div>

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
