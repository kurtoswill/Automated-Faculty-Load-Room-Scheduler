<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectionRequest;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SectionController extends Controller
{
    public function index(): JsonResponse
    {
        $sections = Section::with(['course', 'instructor.department'])->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Sections fetched.',
            'data' => SectionResource::collection($sections),
            'meta' => [
                'total' => $sections->total(),
                'page' => $sections->currentPage(),
                'per_page' => $sections->perPage(),
            ],
        ]);
    }

    public function store(SectionRequest $request): JsonResponse
    {
        try {
            $section = DB::transaction(function () use ($request) {
                return Section::create($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Section created successfully.',
                'data' => new SectionResource($section->load(['course', 'instructor.department'])),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create section.',
                'errors' => ['exception' => [$e->getMessage()]],
                'data' => null,
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $section = Section::with(['course', 'instructor.department'])->find($id);

        if (! $section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Section fetched.',
            'data' => new SectionResource($section),
        ]);
    }

    public function update(SectionRequest $request, int $id): JsonResponse
    {
        $section = Section::find($id);

        if (! $section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found.',
                'data' => null,
            ], 404);
        }

        $section->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully.',
            'data' => new SectionResource($section->refresh()->load(['course', 'instructor.department'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $section = Section::find($id);

        if (! $section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found.',
                'data' => null,
            ], 404);
        }

        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully.',
            'data' => null,
        ]);
    }
}
