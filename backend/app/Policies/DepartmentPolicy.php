<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Department;

class DepartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'Admin';
    }

    public function view(User $user, Department $department): bool
    {
        return $user->role === 'Admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'Admin';
    }

    public function update(User $user, Department $department): bool
    {
        return $user->role === 'Admin';
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->role === 'Admin';
    }
}
