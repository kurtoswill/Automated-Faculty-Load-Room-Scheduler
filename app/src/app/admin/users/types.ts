// ─── Dalisay Shared Types ─────────────────────────────────────────────────────
// Mirror of DB schema — used across /admin/users pages.
// Update here when the API contract changes.

export type Role = "Admin" | "Instructor" | "Student";

export type UserStatus = "active" | "inactive";

export interface Department {
    id: number;
    name: string; // e.g. "Department of Computer Science"
    code: string; // e.g. "DCS"
}

export interface User {
    id: number;
    employee_id: string | null;  // Admins & Instructors only
    student_id: string | null;   // Students only
    email: string;
    first_name: string;
    last_name: string;
    dept_id: number;
    role: Role;
    is_irregular: boolean;       // Students only; Admin-managed
    is_active: boolean;
    created_at: string;          // ISO 8601
}

// Payload sent to POST /api/admin/users
export interface CreateUserPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;            // plain — hashed server-side
    role: Role;
    dept_id: number;
    employee_id?: string | null;
    student_id?: string | null;
    is_irregular?: boolean;
}

// Payload sent to PATCH /api/admin/users/[id]
export interface UpdateUserPayload {
    first_name: string;
    last_name: string;
    email: string;
    dept_id: number;
    employee_id?: string | null;
    student_id?: string | null;
    is_irregular?: boolean;
}