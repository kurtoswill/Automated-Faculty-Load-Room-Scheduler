<?php

namespace App\Http\Controllers\API\Instructor;

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
            ->where('instructor_id', Auth::id())
            ->where('is_active', true)
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Instructor schedule fetched.',
            'data' => ScheduleResource::collection($schedules),
            'meta' => [
                'total' => $schedules->total(),
                'page' => $schedules->currentPage(),
                'per_page' => $schedules->perPage(),
            ],
        ]);
    }
}
