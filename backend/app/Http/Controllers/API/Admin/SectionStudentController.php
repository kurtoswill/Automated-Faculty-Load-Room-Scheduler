<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignStudentRequest;
use App\Http\Resources\UserResource;
use App\Models\Section;
use App\Models\StudentSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SectionStudentController extends Controller
{
    public function index(int $id): JsonResponse
    {
        $section = Section::find($id);

        if (! $section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found.',
                'data' => null,
            ], 404);
        }

        $students = $section->studentSections()->with('student')->get()->map(fn ($assignment) => $assignment->student);

        return response()->json([
            'success' => true,
            'message' => 'Assigned students fetched.',
            'data' => UserResource::collection($students),
        ]);
    }

    public function store(AssignStudentRequest $request, int $id): JsonResponse
    {
        $section = Section::find($id);

        if (! $section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found.',
                'data' => null,
            ], 404);
        }

        try {
            DB::transaction(function () use ($request, $section) {
                StudentSection::create([
                    'student_id' => $request->student_id,
                    'section_id' => $section->id,
                    'assigned_by' => Auth::id(),
                ]);
            });

            $student = $section->studentSections()->with('student')->where('student_id', $request->student_id)->first()?->student;

            return response()->json([
                'success' => true,
                'message' => 'Student assigned to section successfully.',
                'data' => new UserResource($student),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign student to section.',
                'errors' => ['exception' => [$e->getMessage()]],
                'data' => null,
            ], 500);
        }
    }

    public function destroy(int $id, int $student_id): JsonResponse
    {
        $assignment = StudentSection::where('section_id', $id)->where('student_id', $student_id)->first();

        if (! $assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Student assignment not found.',
                'data' => null,
            ], 404);
        }

        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student removed from section.',
            'data' => null,
        ]);
    }
}
