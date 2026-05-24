<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestReviewRequest;
use App\Http\Resources\RoomRequestResource;
use App\Models\RoomRequest;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RoomRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RoomRequest::with(['section.course', 'room.type', 'instructor']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Room requests fetched.',
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
        $request = RoomRequest::with(['section.course', 'room.type', 'instructor', 'reviewer'])->find($id);

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

    public function approve(RequestReviewRequest $request, int $id): JsonResponse
    {
        try {
            $result = DB::select('CALL sp_approve_request(?, ?, ?)', [
                $id,
                $request->user()->id,
                $request->remarks,
            ]);

            $response = $result[0] ?? null;

            if (! $response || ($response->status ?? null) !== 'SUCCESS') {
                return response()->json([
                    'success' => false,
                    'message' => $response->message ?? 'Approval failed.',
                    'errors' => ['request' => [$response->message ?? 'Unable to approve request.']],
                    'data' => null,
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => $response->message,
                'data' => null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Approval failed due to server error.',
                'errors' => ['request' => ['Unable to approve request.']],
                'data' => null,
            ], 500);
        }
    }

    public function reject(RequestReviewRequest $request, int $id, AuditService $auditService, NotificationService $notificationService): JsonResponse
    {
        $roomRequest = RoomRequest::find($id);

        if (! $roomRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Room request not found.',
                'data' => null,
            ], 404);
        }

        try {
            DB::transaction(function () use ($request, $roomRequest, $notificationService, $auditService) {
                $roomRequest->update([
                    'status' => 'Rejected',
                    'admin_remarks' => $request->remarks,
                    'reviewed_at' => now(),
                    'reviewed_by' => Auth::id(),
                ]);

                $notificationService->notify(
                    $roomRequest->instructor_id,
                    'Request_Rejected',
                    'room_requests',
                    $roomRequest->id,
                    'Your room request has been rejected by the administrator.'
                );

                $auditService->log(
                    Auth::id(),
                    'REJECT_REQUEST',
                    'room_requests',
                    $roomRequest->id,
                    'Rejected request id: '.$roomRequest->id
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'Request rejected successfully.',
                'data' => null,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject request.',
                'errors' => ['request' => ['Unable to reject request.']],
                'data' => null,
            ], 500);
        }
    }
}
