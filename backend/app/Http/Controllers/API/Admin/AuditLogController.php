<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->actor_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('target_table')) {
            $query->where('target_table', $request->target_table);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('performed_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('performed_at', '<=', $request->to_date);
        }

        $logs = $query->orderByDesc('performed_at')->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Audit logs fetched.',
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }
}
