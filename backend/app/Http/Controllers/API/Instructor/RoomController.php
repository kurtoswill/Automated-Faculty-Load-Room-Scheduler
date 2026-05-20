<?php

namespace App\Http\Controllers\API\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::with('type');

        if ($request->boolean('available_only', false)) {
            $query->where('is_available', true);
        }

        if ($request->filled('type_id')) {
            $query->where('type_id', $request->type_id);
        }

        if ($request->filled('day') && $request->filled('time_start') && $request->filled('time_end')) {
            $query->whereNotExists(function ($subQuery) use ($request) {
                $subQuery->select(DB::raw('1'))
                    ->from('room_requests')
                    ->whereColumn('room_requests.room_id', 'rooms.id')
                    ->where('room_requests.day_of_week', $request->day)
                    ->whereIn('room_requests.status', ['Pending', 'Approved'])
                    ->where(function ($q) use ($request) {
                        $q->whereBetween('room_requests.time_start', [$request->time_start, $request->time_end])
                            ->orWhereBetween('room_requests.time_end', [$request->time_start, $request->time_end])
                            ->orWhere(function ($query) use ($request) {
                                $query->where('room_requests.time_start', '<=', $request->time_start)
                                    ->where('room_requests.time_end', '>=', $request->time_end);
                            });
                    });
            });
        }

        $rooms = $query->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Rooms fetched.',
            'data' => RoomResource::collection($rooms),
            'meta' => [
                'total' => $rooms->total(),
                'page' => $rooms->currentPage(),
                'per_page' => $rooms->perPage(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $room = Room::with('type')->find($id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Room details fetched.',
            'data' => new RoomResource($room),
        ]);
    }
}
