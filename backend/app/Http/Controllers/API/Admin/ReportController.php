<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function masterSchedule(): JsonResponse
    {
        $report = DB::table('vw_master_schedule')->get();

        return response()->json([
            'success' => true,
            'message' => 'Master schedule report fetched.',
            'data' => $report,
        ]);
    }

    public function facultyLoad(): JsonResponse
    {
        $report = DB::table('vw_faculty_load_summary')->get();

        return response()->json([
            'success' => true,
            'message' => 'Faculty load report fetched.',
            'data' => $report,
        ]);
    }
}
