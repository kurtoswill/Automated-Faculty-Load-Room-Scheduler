<?php

namespace App\Http\Controllers\API\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ConfirmedSchedule;
use App\Models\RoomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $userId = Auth::id();

        $pendingRequests = RoomRequest::where('instructor_id', $userId)
            ->where('status', 'Pending')
            ->count();

        $approvedRequests = RoomRequest::where('instructor_id', $userId)
            ->where('status', 'Approved')
            ->count();

        $confirmedSchedules = ConfirmedSchedule::where('instructor_id', $userId)
            ->where('is_active', true)
            ->count();

        $loadSummary = DB::table('vw_faculty_load_summary')
            ->where('instructor_id', $userId)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard overview fetched.',
            'data' => [
                'pending_requests' => $pendingRequests,
                'approved_requests' => $approvedRequests,
                'confirmed_schedules' => $confirmedSchedules,
                'load_summary' => $loadSummary ? [
                    'total_units' => $loadSummary->current_units ?? 0,
                    'max_units' => $loadSummary->max_units ?? 0,
                    'remaining_units' => $loadSummary->remaining_units ?? 0,
                    'utilization_percent' => $loadSummary->utilization_percent ?? 0,
                    'courses' => [],
                ] : [
                    'total_units' => 0,
                    'max_units' => 0,
                    'remaining_units' => 0,
                    'utilization_percent' => 0,
                    'courses' => [],
                ],
            ],
        ]);
    }
}
