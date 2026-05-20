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
                    'total_load' => $loadSummary->total_load,
                    'credit_hours' => $loadSummary->credit_hours,
                    'load_utilization' => $loadSummary->load_utilization,
                ] : null,
            ],
        ]);
    }
}
