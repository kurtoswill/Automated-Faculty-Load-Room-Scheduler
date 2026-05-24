<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::all();

        return response()->json([
            'success' => true,
            'message' => 'Departments fetched.',
            'data' => DepartmentResource::collection($departments),
        ]);
    }

    public function store(DepartmentRequest $request): JsonResponse
    {
        try {
            $department = DB::transaction(function () use ($request) {
                return Department::create($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully.',
                'data' => new DepartmentResource($department),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department.',
                'errors' => ['department' => ['Unable to create department.']],
                'data' => null,
            ], 500);
        }
    }

    public function update(DepartmentRequest $request, int $id): JsonResponse
    {
        $department = Department::find($id);

        if (! $department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
                'data' => null,
            ], 404);
        }

        $department->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully.',
            'data' => new DepartmentResource($department),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::find($id);

        if (! $department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
                'data' => null,
            ], 404);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully.',
            'data' => null,
        ]);
    }
}
