<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FacultyLoadRequest;
use App\Http\Resources\FacultyLoadSummaryResource;
use App\Models\FacultyLoadLimit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FacultyLoadController extends Controller
{
    public function index(): JsonResponse
    {
        $loads = DB::table('vw_faculty_load_summary')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Faculty load summary fetched.',
            'data' => FacultyLoadSummaryResource::collection($loads),
            'meta' => [
                'total' => $loads->total(),
                'page' => $loads->currentPage(),
                'per_page' => $loads->perPage(),
            ],
        ]);
    }

    public function show(int $instructor_id): JsonResponse
    {
        $load = DB::table('vw_faculty_load_summary')->where('instructor_id', $instructor_id)->first();

        if (! $load) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty load summary not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Faculty load summary fetched.',
            'data' => new FacultyLoadSummaryResource($load),
        ]);
    }

    public function store(FacultyLoadRequest $request): JsonResponse
    {
        try {
            $limit = DB::transaction(function () use ($request) {
                return FacultyLoadLimit::updateOrCreate([
                    'instructor_id' => $request->instructor_id,
                ], [
                    ...$request->validated(),
                    'updated_by' => Auth::id(),
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Faculty load limit set successfully.',
                'data' => $limit,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set faculty load limit.',
                'errors' => ['faculty_load' => ['Unable to set faculty load limit.']],
                'data' => null,
            ], 500);
        }
    }

    public function update(FacultyLoadRequest $request, int $id): JsonResponse
    {
        $limit = FacultyLoadLimit::find($id);

        if (! $limit) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty load limit not found.',
                'data' => null,
            ], 404);
        }

        $limit->update([
            ...$request->validated(),
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Faculty load limit updated successfully.',
            'data' => $limit,
        ]);
    }
}
