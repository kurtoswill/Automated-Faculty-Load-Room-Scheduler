<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totals = [
            'users' => DB::table('users')->count(),
            'active_users' => DB::table('users')->where('is_active', true)->count(),
            'pending_requests' => DB::table('room_requests')->where('status', 'Pending')->count(),
            'approved_requests' => DB::table('room_requests')->where('status', 'Approved')->count(),
            'confirmed_bookings' => DB::table('confirmed_schedule')->where('is_active', true)->count(),
            'notifications' => DB::table('notifications')->where('is_read', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard stats fetched.',
            'data' => $totals,
        ]);
    }
}
