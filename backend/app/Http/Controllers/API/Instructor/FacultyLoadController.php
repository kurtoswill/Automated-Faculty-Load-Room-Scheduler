<?php

namespace App\Http\Controllers\API\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Resources\FacultyLoadResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FacultyLoadController extends Controller
{
    public function index(): JsonResponse
    {
        $summary = DB::table('vw_faculty_load_summary')
            ->where('instructor_id', Auth::id())
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Faculty load summary fetched.',
            'data' => new FacultyLoadResource((array) $summary),
        ]);
    }
}
