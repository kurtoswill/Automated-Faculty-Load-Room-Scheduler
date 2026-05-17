<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Department;
use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\Section;
use App\Models\Notification;
use App\Policies\DepartmentPolicy;
use App\Policies\RoomPolicy;
use App\Policies\RoomRequestPolicy;
use App\Policies\SectionPolicy;
use App\Policies\NotificationPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Department::class => DepartmentPolicy::class,
        Room::class => RoomPolicy::class,
        RoomRequest::class => RoomRequestPolicy::class,
        Section::class => SectionPolicy::class,
        Notification::class => NotificationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('admin', fn ($user) => $user->role === 'Admin');
        Gate::define('instructor', fn ($user) => $user->role === 'Instructor');
        Gate::define('student', fn ($user) => $user->role === 'Student');
    }
}
