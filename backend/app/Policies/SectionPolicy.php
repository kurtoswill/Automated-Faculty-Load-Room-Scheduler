<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\User;

class SectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'Admin';
    }

    public function view(User $user, Section $section): bool
    {
        return $user->role === 'Admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'Admin';
    }

    public function update(User $user, Section $section): bool
    {
        return $user->role === 'Admin';
    }

    public function delete(User $user, Section $section): bool
    {
        return $user->role === 'Admin';
    }
}
