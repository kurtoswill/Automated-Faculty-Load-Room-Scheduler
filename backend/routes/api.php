<?php

use App\Http\Controllers\API\Admin\AuditLogController as AdminAuditLog;
use App\Http\Controllers\API\Admin\CourseController as AdminCourse;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboard;
// Admin Controllers
use App\Http\Controllers\API\Admin\DepartmentController as AdminDepartment;
use App\Http\Controllers\API\Admin\FacultyLoadController as AdminFacultyLoad;
use App\Http\Controllers\API\Admin\ReportController as AdminReport;
use App\Http\Controllers\API\Admin\RoomController as AdminRoom;
use App\Http\Controllers\API\Admin\RoomRequestController as AdminRequest;
use App\Http\Controllers\API\Admin\ScheduleController as AdminSchedule;
use App\Http\Controllers\API\Admin\SectionController as AdminSection;
use App\Http\Controllers\API\Admin\SectionStudentController as AdminSectionStudent;
use App\Http\Controllers\API\Admin\UserController as AdminUser;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\Instructor\DashboardController as InstructorDashboard;
use App\Http\Controllers\API\Instructor\FacultyLoadController as InstructorFacultyLoad;
// Instructor Controllers
use App\Http\Controllers\API\Instructor\RequestController as InstructorRequest;
use App\Http\Controllers\API\Instructor\RoomController as InstructorRoom;
use App\Http\Controllers\API\Instructor\ScheduleController as InstructorSchedule;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProfileController;
// Student Controllers
use App\Http\Controllers\API\Student\DashboardController as StudentDashboard;
use App\Http\Controllers\API\Student\ScheduleController as StudentSchedule;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password/{token}', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Authentication)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'active'])->group(function () {

    // --- Global Authenticated Routes ---
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']); // Put read-all BEFORE {id} to prevent route conflicts
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // --- ADMIN ROUTES ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index']);

        // Users
        Route::get('/users', [AdminUser::class, 'index']);
        Route::post('/users', [AdminUser::class, 'store']);
        Route::get('/users/{id}', [AdminUser::class, 'show']);
        Route::patch('/users/{id}', [AdminUser::class, 'update']);
        Route::post('/users/{id}/deactivate', [AdminUser::class, 'deactivate']);
        Route::post('/users/{id}/reactivate', [AdminUser::class, 'reactivate']);
        Route::post('/users/{id}/reset-password', [AdminUser::class, 'resetPassword']);

        // Departments
        Route::get('/departments', [AdminDepartment::class, 'index']);
        Route::post('/departments', [AdminDepartment::class, 'store']);
        Route::patch('/departments/{id}', [AdminDepartment::class, 'update']);
        Route::delete('/departments/{id}', [AdminDepartment::class, 'destroy']);

        // Courses
        Route::get('/courses', [AdminCourse::class, 'index']);
        Route::post('/courses', [AdminCourse::class, 'store']);

        // Sections
        Route::get('/sections', [AdminSection::class, 'index']);
        Route::post('/sections', [AdminSection::class, 'store']);
        Route::get('/sections/{id}', [AdminSection::class, 'show']);
        Route::patch('/sections/{id}', [AdminSection::class, 'update']);
        Route::delete('/sections/{id}', [AdminSection::class, 'destroy']);
        Route::get('/sections/{id}/students', [AdminSectionStudent::class, 'index']);
        Route::post('/sections/{id}/students', [AdminSectionStudent::class, 'store']);
        Route::delete('/sections/{id}/students/{student_id}', [AdminSectionStudent::class, 'destroy']);

        // Rooms
        Route::get('/rooms', [AdminRoom::class, 'index']);
        Route::post('/rooms', [AdminRoom::class, 'store']);
        Route::get('/rooms/{id}', [AdminRoom::class, 'show']);
        Route::patch('/rooms/{id}', [AdminRoom::class, 'update']);
        Route::patch('/rooms/{id}/toggle', [AdminRoom::class, 'toggleAvailability']);
        Route::delete('/rooms/{id}', [AdminRoom::class, 'destroy']);
        Route::get('/room-types', [AdminRoom::class, 'types']);
        Route::get('/buildings', [AdminRoom::class, 'buildings']);

        // Requests
        Route::get('/requests', [AdminRequest::class, 'index']);
        Route::get('/requests/{id}', [AdminRequest::class, 'show']);
        Route::post('/requests/{id}/approve', [AdminRequest::class, 'approve']);
        Route::post('/requests/{id}/reject', [AdminRequest::class, 'reject']);

        // Academic / System
        Route::get('/schedule', [AdminSchedule::class, 'index']);
        Route::post('/schedule/{id}/release', [AdminSchedule::class, 'release']);
        Route::get('/faculty-load', [AdminFacultyLoad::class, 'index']);
        Route::post('/faculty-load', [AdminFacultyLoad::class, 'store']);
        Route::get('/faculty-load/{id}', [AdminFacultyLoad::class, 'show']);
        Route::patch('/faculty-load/{id}', [AdminFacultyLoad::class, 'update']);
        Route::get('/reports', [AdminReport::class, 'index']);
        Route::get('/reports/master-schedule', [AdminReport::class, 'masterSchedule']);
        Route::get('/reports/faculty-load', [AdminReport::class, 'facultyLoad']);
        Route::get('/audit-log', [AdminAuditLog::class, 'index']);
    });

    // --- INSTRUCTOR ROUTES ---
    Route::middleware('role:instructor')->group(function () {
        // Prefixed with /instructor
        Route::prefix('instructor')->group(function () {
            Route::get('/dashboard', [InstructorDashboard::class, 'index']);
            Route::get('/rooms', [InstructorRoom::class, 'index']);
            Route::get('/schedule', [InstructorSchedule::class, 'index']);
            Route::get('/faculty-load', [InstructorFacultyLoad::class, 'index']);
        });

        // Not prefixed with /instructor (Based on your table)
        Route::get('/requests', [InstructorRequest::class, 'index']);
        Route::post('/requests', [InstructorRequest::class, 'store']);
        Route::get('/requests/{id}', [InstructorRequest::class, 'show']);
        Route::post('/requests/{id}/cancel', [InstructorRequest::class, 'cancel']);
        Route::post('/requests/{id}/release', [InstructorRequest::class, 'release']);
    });

    // --- STUDENT ROUTES ---
    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentDashboard::class, 'index']);
        Route::get('/schedule', [StudentSchedule::class, 'index']);
    });
});
