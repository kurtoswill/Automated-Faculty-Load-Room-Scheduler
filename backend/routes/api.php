<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\Admin\UserController as AdminUserController;
use App\Http\Controllers\API\Admin\DepartmentController;
use App\Http\Controllers\API\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\API\Admin\RoomRequestController;
use App\Http\Controllers\API\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\API\Admin\FacultyLoadController;
use App\Http\Controllers\API\Admin\CourseController;
use App\Http\Controllers\API\Admin\SectionController;
use App\Http\Controllers\API\Admin\SectionStudentController;
use App\Http\Controllers\API\Admin\ReportController;
use App\Http\Controllers\API\Admin\AuditLogController;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Instructor\RoomController as InstructorRoomController;
use App\Http\Controllers\API\Instructor\RequestController as InstructorRequestController;
use App\Http\Controllers\API\Instructor\ScheduleController as InstructorScheduleController;
use App\Http\Controllers\API\Instructor\FacultyLoadController as InstructorFacultyLoadController;
use App\Http\Controllers\API\Instructor\DashboardController as InstructorDashboardController;
use App\Http\Controllers\API\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\API\Student\ScheduleController as StudentScheduleController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::patch('change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
});

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::apiResource('users', AdminUserController::class)->except(['destroy']);
        Route::patch('users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

        Route::apiResource('departments', DepartmentController::class)->except(['show']);
        Route::delete('departments/{id}', [DepartmentController::class, 'destroy']);

        Route::apiResource('rooms', AdminRoomController::class)->except(['destroy']);
        Route::patch('rooms/{id}/toggle-availability', [AdminRoomController::class, 'toggleAvailability']);
        Route::delete('rooms/{id}', [AdminRoomController::class, 'destroy']);
        Route::get('room-types', [AdminRoomController::class, 'types']);

        Route::get('requests', [RoomRequestController::class, 'index']);
        Route::get('requests/{id}', [RoomRequestController::class, 'show']);
        Route::patch('requests/{id}/approve', [RoomRequestController::class, 'approve']);
        Route::patch('requests/{id}/reject', [RoomRequestController::class, 'reject']);

        Route::get('schedule', [AdminScheduleController::class, 'index']);
        Route::patch('schedule/{id}/release', [AdminScheduleController::class, 'release']);

        Route::get('faculty-load', [FacultyLoadController::class, 'index']);
        Route::get('faculty-load/{instructor_id}', [FacultyLoadController::class, 'show']);
        Route::post('faculty-load', [FacultyLoadController::class, 'store']);
        Route::patch('faculty-load/{id}', [FacultyLoadController::class, 'update']);

        Route::apiResource('courses', CourseController::class)->only(['index','store']);
        Route::apiResource('sections', SectionController::class)->except(['create','edit']);
        Route::get('sections/{id}/students', [SectionStudentController::class, 'index']);
        Route::post('sections/{id}/students', [SectionStudentController::class, 'store']);
        Route::delete('sections/{id}/students/{student_id}', [SectionStudentController::class, 'destroy']);

        Route::get('reports/master-schedule', [ReportController::class, 'masterSchedule']);
        Route::get('reports/faculty-load', [ReportController::class, 'facultyLoad']);

        Route::get('audit-log', [AuditLogController::class, 'index']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });

    Route::middleware('role:Instructor')->prefix('instructor')->group(function () {
        Route::get('dashboard', [InstructorDashboardController::class, 'index']);
        Route::get('rooms', [InstructorRoomController::class, 'index']);
        Route::get('rooms/{id}', [InstructorRoomController::class, 'show']);

        Route::get('requests', [InstructorRequestController::class, 'index']);
        Route::get('requests/{id}', [InstructorRequestController::class, 'show']);
        Route::post('requests', [InstructorRequestController::class, 'store']);
        Route::patch('requests/{id}/cancel', [InstructorRequestController::class, 'cancel']);

        Route::get('schedule', [InstructorScheduleController::class, 'index']);
        Route::get('faculty-load', [InstructorFacultyLoadController::class, 'index']);
    });

    Route::middleware('role:Student')->prefix('student')->group(function () {
        Route::get('dashboard', [StudentDashboardController::class, 'index']);
        Route::get('schedule', [StudentScheduleController::class, 'index']);
    });
});
