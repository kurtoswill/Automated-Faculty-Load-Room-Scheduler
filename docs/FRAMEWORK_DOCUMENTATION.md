# Framework Documentation

Use this section directly in your documentation file.

## 1. Next.js (Frontend Framework)
- Used for the web interface of Admin, Instructor, and Student portals.
- Implements page routing using App Router (`app/src/app/...`).
- Handles UI rendering, forms, client-side state, and API integration.
- Role-based page access is guarded in `app/src/proxy.ts`.

## 2. React + TypeScript
- React is used for reusable components and interactive pages.
- TypeScript is used for strict typing of API responses, forms, and state.
- Improves maintainability and reduces runtime errors.

## 3. Laravel (Backend Framework)
- Used to build REST API endpoints under `/api/v1`.
- Handles authentication, validation, role checks, and business logic.
- Uses Controllers, Form Requests, Resources, Middleware, and Services.

## 4. Laravel Sanctum (API Authentication)
- Provides token-based authentication for frontend-to-backend API access.
- On login, backend issues a personal access token.
- Protected routes use `auth:sanctum` middleware.

## 5. MariaDB / MySQL via XAMPP (Database)
- Local database server is **XAMPP MariaDB (MySQL-compatible)**.
- Stores users, rooms, schedules, requests, notifications, and audit logs.
- Schema is managed through Laravel migrations and seeders.

## 6. Eloquent ORM + Query Builder
- Eloquent models are used for table relationships and CRUD operations.
- Query Builder is used for reports, filtering, and aggregate queries.
- Resources provide clean JSON output to the frontend.

## 7. Tailwind CSS
- Used for utility-first styling in frontend pages and components.
- Supports consistent spacing, typography, layout, and responsive UI.

## 8. Deployment Setup (Current Project Direction)
- Frontend: Vercel (Next.js app).
- Backend/API: Railway (Laravel app).
- Database in production: Railway MySQL/MariaDB-compatible service.
