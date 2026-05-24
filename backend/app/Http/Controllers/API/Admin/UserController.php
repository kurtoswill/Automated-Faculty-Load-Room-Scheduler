<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('department')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Users fetched.',
            'data' => UserResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'page' => $users->currentPage(),
                'per_page' => $users->perPage(),
            ],
        ]);
    }

    public function store(UserRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request) {
                return User::create([
                    'employee_id' => $request->employee_id,
                    'student_id' => $request->student_id,
                    'email' => $request->email,
                    'password_hash' => Hash::make($request->password),
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'dept_id' => $request->dept_id,
                    'role' => $request->role,
                    'is_irregular' => $request->boolean('is_irregular', false),
                    'is_active' => $request->boolean('is_active', true),
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'data' => new UserResource($user->load('department')),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user.',
                'errors' => ['user' => ['Unable to create user.']],
                'data' => null,
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with('department')->find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User details fetched.',
            'data' => new UserResource($user),
        ]);
    }

    public function update(UserRequest $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        try {
            DB::transaction(function () use ($request, $user) {
                $user->update(array_filter([
                    'employee_id' => $request->employee_id,
                    'student_id' => $request->student_id,
                    'email' => $request->email,
                    'password_hash' => $request->filled('password') ? Hash::make($request->password) : null,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'dept_id' => $request->dept_id,
                    'role' => $request->role,
                    'is_irregular' => $request->boolean('is_irregular', false),
                    'is_active' => $request->boolean('is_active', true),
                ], fn ($value) => ! is_null($value)));
            });

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'data' => new UserResource($user->refresh()->load('department')),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user.',
                'errors' => ['user' => ['Unable to update user.']],
                'data' => null,
            ], 500);
        }
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'User status toggled successfully.',
            'data' => new UserResource($user),
        ]);
    }

    public function deactivate(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully.',
            'data' => new UserResource($user->refresh()->load('department')),
        ]);
    }

    public function reactivate(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        $user->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'User reactivated successfully.',
            'data' => new UserResource($user->refresh()->load('department')),
        ]);
    }

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'data' => null,
            ], 404);
        }

        $user->update(['password_hash' => Hash::make($validated['password'])]);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User password reset successfully.',
            'data' => null,
        ]);
    }
}
