# APPENDICES: Core Code Sets

This file contains screenshot-ready code sets for the Appendices section.
All snippets are based on your actual project files, with only safe shortening for readability.

---

## A1. Frontend Login Flow (Next.js)
**File:** `app/src/app/page.tsx`  
**What this is for:** Main authentication page used by Student, Instructor, and Admin.  
**How it works:** Validates institutional email, calls backend `/login`, stores token/cookies, and redirects by role.

```tsx
type Role = "student" | "instructor" | "admin";
type BackendRole = "Admin" | "Instructor" | "Student";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: { role: BackendRole | string };
  } | null;
  errors?: Record<string, string[]>;
}

const ROLE_ROUTE: Record<BackendRole, string> = {
  Admin: "/admin/dashboard",
  Instructor: "/instructor/dashboard",
  Student: "/student/dashboard",
};

const SELECTED_ROLE: Record<Role, BackendRole> = {
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const response = await api.post<LoginResponse>("/login", { email, password });
  if (!response.success || !response.data) throw new Error("Invalid credentials.");

  const userRole = response.data.user.role as BackendRole;
  if (userRole !== SELECTED_ROLE[role]) {
    throw new Error(`This account is registered as ${userRole}.`);
  }

  persistSession(response.data.token, userRole, remember);
  router.replace(ROLE_ROUTE[userRole]);
}
```

---

## A2. Shared API Client
**File:** `app/src/lib/api.ts`  
**What this is for:** Single HTTP helper used by all frontend pages.  
**How it works:** Adds base URL + Bearer token, parses JSON response, throws normalized errors.

```ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
```

---

## A3. Frontend Route Protection (Role-Based)
**File:** `app/src/proxy.ts`  
**What this is for:** Guards page access by token and role before rendering protected routes.  
**How it works:** Reads `token` and `role` cookies and redirects users to allowed role dashboards.

```ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/instructor") || pathname.startsWith("/student"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "Admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/instructor") && role !== "Instructor") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/student") && role !== "Student") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
```

---

## A4. Laravel API Route Groups
**File:** `backend/routes/api.php`  
**What this is for:** Defines public, authenticated, and role-based endpoints.  
**How it works:** Uses Sanctum auth + `active` middleware + `role:*` middleware to enforce access control.

```php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password/{token}', [AuthController::class, 'resetPassword']);

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index']);
        Route::get('/users', [AdminUser::class, 'index']);
        Route::post('/users', [AdminUser::class, 'store']);
        Route::patch('/users/{id}', [AdminUser::class, 'update']);
        Route::get('/rooms', [AdminRoom::class, 'index']);
        Route::post('/requests/{id}/approve', [AdminRequest::class, 'approve']);
    });

    Route::middleware('role:instructor')->group(function () {
        Route::prefix('instructor')->group(function () {
            Route::get('/dashboard', [InstructorDashboard::class, 'index']);
            Route::get('/schedule', [InstructorSchedule::class, 'index']);
        });
        Route::get('/requests', [InstructorRequest::class, 'index']);
        Route::post('/requests', [InstructorRequest::class, 'store']);
    });

    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentDashboard::class, 'index']);
        Route::get('/schedule', [StudentSchedule::class, 'index']);
    });
});
```

---

## A5. Authentication Controller (Sanctum Token Issuance)
**File:** `backend/app/Http/Controllers/API/AuthController.php`  
**What this is for:** Handles login/logout/me/change-password/reset flows.  
**How it works:** Verifies `password_hash`, issues Sanctum token, returns normalized JSON response.

```php
public function login(LoginRequest $request): JsonResponse
{
    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password_hash)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials.',
            'data' => null,
        ], 401);
    }

    if (! $user->is_active) {
        return response()->json([
            'success' => false,
            'message' => 'Account is deactivated.',
            'data' => null,
        ], 403);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful.',
        'data' => [
            'token' => $token,
            'user' => new UserResource($user->load('department')),
        ],
    ]);
}
```

---

## A6. Role Middleware
**File:** `backend/app/Http/Middleware/RoleMiddleware.php`  
**What this is for:** Restricts API routes to correct user role.  
**How it works:** Compares authenticated user role to route role argument (`admin`, `instructor`, `student`).

```php
public function handle(Request $request, Closure $next, string $role): Response
{
    $user = $request->user();

    if (! $user) {
        return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
    }

    if (strtolower($user->role) !== strtolower($role)) {
        return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
    }

    return $next($request);
}
```

---

## A7. Active User Middleware
**File:** `backend/app/Http/Middleware/EnsureActiveUser.php`  
**What this is for:** Blocks deactivated accounts from using protected APIs.  
**How it works:** Checks `users.is_active` after Sanctum auth.

```php
public function handle(Request $request, Closure $next): Response
{
    $user = $request->user();

    if ($user && ! $user->is_active) {
        return response()->json([
            'success' => false,
            'message' => 'Your account is deactivated.',
            'data' => null,
        ], 403);
    }

    return $next($request);
}
```

---

## A8. Student Schedule API Query
**File:** `backend/app/Http/Controllers/API/Student/ScheduleController.php`  
**What this is for:** Returns the logged-in student’s confirmed schedule only.  
**How it works:** Uses `whereHas` against `student_section` and loads room/section/course/instructor relationships.

```php
$schedules = ConfirmedSchedule::with(['room.type', 'section.course', 'instructor.department'])
    ->whereHas('section.studentSections', function ($query) {
        $query->where('student_id', Auth::id());
    })
    ->where('is_active', true)
    ->paginate(15);

return response()->json([
    'success' => true,
    'message' => 'Student schedule fetched.',
    'data' => ScheduleResource::collection($schedules),
]);
```

---

## A9. Unified Schedule Resource (Fixes N/A / Join Mismatch)
**File:** `backend/app/Http/Resources/ScheduleResource.php`  
**What this is for:** Standard response shape for admin/instructor/student schedule consumers.  
**How it works:** Supports both Eloquent relation objects and reporting-view rows (flat fields).

```php
return [
    'id' => $this->id ?? null,
    'request_id' => $this->request_id ?? null,
    'day_of_week' => $this->day_of_week ?? null,
    'time_start' => $this->time_start ?? null,
    'time_end' => $this->time_end ?? null,
    'is_active' => (bool) ($this->is_active ?? false),
    'confirmed_at' => $this->confirmed_at ?? null,

    'room_number' => $this->room_number ?? $this->room?->room_number,
    'building' => $this->building ?? $this->room?->building,
    'room_type' => $this->room_type ?? $this->room?->type?->name,

    'course_code' => $this->course_code ?? $this->section?->course?->course_code,
    'course_title' => $this->course_title ?? $this->section?->course?->course_title,
    'section_name' => $this->section_name ?? $this->section?->section_name,
    'semester' => $this->semester ?? $this->section?->semester,
];
```

---

## A10. Room Request Resource Compatibility Fields
**File:** `backend/app/Http/Resources/RoomRequestResource.php`  
**What this is for:** Keeps old frontend fields working while using normalized request columns.  
**How it works:** Adds alias keys (`preferred_*`, `created_at`) mapped from `room_requests`.

```php
return [
    'id' => $this->id,
    'status' => $this->status,
    'day_of_week' => $this->day_of_week,
    'time_start' => $this->time_start,
    'time_end' => $this->time_end,
    'submitted_at' => $this->submitted_at,

    // compatibility aliases
    'preferred_day_of_week' => $this->day_of_week,
    'preferred_start_time' => $this->time_start,
    'preferred_end_time' => $this->time_end,
    'created_at' => $this->submitted_at,
];
```

---

## A11. Room Approval Fallback Logic (Admin)
**File:** `backend/app/Http/Controllers/API/Admin/RoomRequestController.php`  
**What this is for:** Prevents approval failure when stored procedure is unavailable or errors.  
**How it works:** Transactionally updates request + inserts/updates `confirmed_schedule` as fallback path.

```php
DB::transaction(function () use ($requestModel, $remarks) {
    $requestModel->update([
        'status' => 'Approved',
        'admin_remarks' => $remarks,
        'reviewed_at' => now(),
        'reviewed_by' => Auth::id(),
    ]);

    ConfirmedSchedule::updateOrCreate(
        ['request_id' => $requestModel->id],
        [
            'section_id' => $requestModel->section_id,
            'room_id' => $requestModel->room_id,
            'instructor_id' => $requestModel->instructor_id,
            'day_of_week' => $requestModel->day_of_week,
            'time_start' => $requestModel->time_start,
            'time_end' => $requestModel->time_end,
            'is_active' => true,
            'confirmed_at' => now(),
        ]
    );
});
```

---

## A12. Core Schema Migrations
**Files:** `backend/database/migrations/*`  
**What this is for:** Defines normalized schema for users, sections, room requests, schedules, notifications, and reporting views.  
**How it works:** Uses Laravel migrations with foreign keys and enum/domain constraints.

```php
// users
$table->id();
$table->string('employee_id', 20)->nullable()->unique();
$table->string('student_id', 20)->nullable()->unique();
$table->string('email', 100)->unique();
$table->text('password_hash');
$table->foreignId('dept_id')->constrained('departments');
$table->enum('role', ['Admin', 'Instructor', 'Student']);
$table->boolean('is_active')->default(true);

// room_requests
$table->foreignId('section_id')->constrained('sections');
$table->foreignId('room_id')->constrained('rooms');
$table->foreignId('instructor_id')->constrained('users');
$table->enum('status', ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Released'])->default('Pending');

// confirmed_schedule
$table->foreignId('request_id')->unique()->constrained('room_requests');
$table->boolean('is_active')->default(true);
```

---
