<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\ConfirmedSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index(): JsonResponse
    {
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
            'meta' => [
                'total' => $schedules->total(),
                'page' => $schedules->currentPage(),
                'per_page' => $schedules->perPage(),
            ],
        ]);
    }
}
