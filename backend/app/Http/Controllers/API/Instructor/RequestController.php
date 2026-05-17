<?php

namespace App\Http\Controllers\API\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestReviewRequest;
use App\Http\Requests\SubmitRoomRequest;
use App\Http\Resources\RoomRequestResource;
use App\Models\RoomRequest;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requests = RoomRequest::with(['section.course', 'room.type', 'instructor'])
            ->where('instructor_id', $request->user()->id)
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Your room requests fetched.',
            'data' => RoomRequestResource::collection($requests),
            'meta' => [
                'total' => $requests->total(),
                'page' => $requests->currentPage(),
                'per_page' => $requests->perPage(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $request = RoomRequest::with(['section.course', 'room.type', 'instructor'])
            ->where('instructor_id', Auth::id())
            ->find($id);

        if (! $request) {
            return response()->json([
                'success' => false,
                'message' => 'Room request not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Room request fetched.',
            'data' => new RoomRequestResource($request),
        ]);
    }

    public function store(SubmitRoomRequest $request): JsonResponse
    {
        try {
            $result = DB::select('CALL sp_submit_room_request(?, ?, ?, ?, ?, ?)', [
                $request->section_id,
                $request->room_id,
                Auth::id(),
                $request->day_of_week,
                $request->time_start,
                $request->time_end,
            ]);

            $response = $result[0] ?? null;

            if (! $response || ($response->status ?? null) !== 'SUCCESS') {
                return response()->json([
                    'success' => false,
                    'message' => $response->message ?? 'Request submission failed.',
                    'errors' => ['request' => [$response->message ?? 'Unable to submit request.']],
                    'data' => null,
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => $response->message,
                'data' => null,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit room request.',
                'errors' => ['exception' => [$e->getMessage()]],
                'data' => null,
            ], 500);
        }
    }

    public function cancel(RequestReviewRequest $request, int $id, AuditService $auditService, NotificationService $notificationService): JsonResponse
    {
        $roomRequest = RoomRequest::where('id', $id)->where('instructor_id', Auth::id())->first();

        if (! $roomRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Room request not found.',
                'data' => null,
            ], 404);
        }

        try {
            DB::transaction(function () use ($request, $roomRequest, $auditService, $notificationService) {
                $roomRequest->update([
                    'status' => 'Cancelled',
                    'admin_remarks' => $request->remarks,
                    'reviewed_at' => now(),
                    'reviewed_by' => Auth::id(),
                ]);

                $notificationService->notify(
                    $roomRequest->instructor_id,
                    'Request_Cancelled',
                    'room_requests',
                    $roomRequest->id,
                    'Your room request has been cancelled.'
                );

                $auditService->log(
                    Auth::id(),
                    'CANCEL_REQUEST',
                    'room_requests',
                    $roomRequest->id,
                    'Cancelled request id: ' . $roomRequest->id
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'Room request cancelled successfully.',
                'data' => null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel room request.',
                'errors' => ['exception' => [$e->getMessage()]],
                'data' => null,
            ], 500);
        }
    }
}
