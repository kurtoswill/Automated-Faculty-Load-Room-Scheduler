<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::with('department')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Courses fetched.',
            'data' => CourseResource::collection($courses),
            'meta' => [
                'total' => $courses->total(),
                'page' => $courses->currentPage(),
                'per_page' => $courses->perPage(),
            ],
        ]);
    }

    public function store(CourseRequest $request): JsonResponse
    {
        try {
            $course = DB::transaction(function () use ($request) {
                return Course::create($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully.',
                'data' => new CourseResource($course),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course.',
                'errors' => ['course' => ['Unable to create course.']],
                'data' => null,
            ], 500);
        }
    }
}
