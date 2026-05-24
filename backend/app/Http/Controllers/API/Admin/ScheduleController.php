<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\ConfirmedSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        $schedule = DB::table('vw_master_schedule')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Master schedule fetched.',
            'data' => ScheduleResource::collection($schedule),
            'meta' => [
                'total' => $schedule->total(),
                'page' => $schedule->currentPage(),
                'per_page' => $schedule->perPage(),
            ],
        ]);
    }

    public function release(int $id): JsonResponse
    {
        $booking = ConfirmedSchedule::find($id);

        if (! $booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
                'data' => null,
            ], 404);
        }

        try {
            DB::transaction(function () use ($booking) {
                $booking->update(['is_active' => false]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Booking released successfully.',
                'data' => null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to release booking.',
                'errors' => ['schedule' => ['Unable to release booking.']],
                'data' => null,
            ], 500);
        }
    }
}
