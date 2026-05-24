<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomRequest as RoomStoreRequest;
use App\Http\Resources\RoomResource;
use App\Http\Resources\RoomTypeResource;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = Room::with('type')->paginate(15);

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

    public function store(RoomStoreRequest $request): JsonResponse
    {
        try {
            $room = DB::transaction(function () use ($request) {
                return Room::create($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Room created successfully.',
                'data' => new RoomResource($room->load('type')),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create room.',
                'errors' => ['room' => ['Unable to create room.']],
                'data' => null,
            ], 500);
        }
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

    public function update(RoomStoreRequest $request, int $id): JsonResponse
    {
        $room = Room::find($id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
                'data' => null,
            ], 404);
        }

        $room->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully.',
            'data' => new RoomResource($room->load('type')),
        ]);
    }

    public function toggleAvailability(int $id): JsonResponse
    {
        $room = Room::find($id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
                'data' => null,
            ], 404);
        }

        $room->update(['is_available' => ! $room->is_available]);

        return response()->json([
            'success' => true,
            'message' => 'Room availability toggled.',
            'data' => new RoomResource($room->load('type')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $room = Room::find($id);

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
                'data' => null,
            ], 404);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully.',
            'data' => null,
        ]);
    }

    public function types(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Room types fetched.',
            'data' => RoomTypeResource::collection(RoomType::all()),
        ]);
    }

    public function buildings(): JsonResponse
    {
        $buildings = DB::table('buildings')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Buildings fetched.',
            'data' => $buildings,
        ]);
    }
}
