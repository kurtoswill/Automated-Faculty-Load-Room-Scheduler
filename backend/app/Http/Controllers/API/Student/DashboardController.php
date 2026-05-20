<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $student = Auth::user();

        return response()->json([
            'success' => true,
            'message' => 'Student dashboard fetched.',
            'data' => [
                'student' => new UserResource($student),
            ],
        ]);
    }
}
