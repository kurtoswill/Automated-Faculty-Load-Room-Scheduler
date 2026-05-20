<?php

namespace App\Policies;

use App\Models\RoomRequest;
use App\Models\User;

class RoomRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Admin', 'Instructor']);
    }

    public function view(User $user, RoomRequest $request): bool
    {
        return $user->role === 'Admin' || $user->id === $request->instructor_id;
    }

    public function approve(User $user, RoomRequest $request): bool
    {
        return $user->role === 'Admin';
    }

    public function reject(User $user, RoomRequest $request): bool
    {
        return $user->role === 'Admin';
    }

    public function cancel(User $user, RoomRequest $request): bool
    {
        return $user->role === 'Instructor' && $user->id === $request->instructor_id;
    }
}
