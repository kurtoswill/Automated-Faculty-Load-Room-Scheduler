<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_user_and_token(): void
    {
        $department = Department::create([
            'name' => 'Computer Studies',
            'code' => 'DCS',
        ]);

        User::create([
            'employee_id' => 'EMP-001',
            'email' => 'admin@example.test',
            'password_hash' => Hash::make('Password123'),
            'first_name' => 'Ada',
            'last_name' => 'Admin',
            'dept_id' => $department->id,
            'role' => 'Admin',
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/login', [
            'email' => 'admin@example.test',
            'password' => 'Password123',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'Admin')
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_role_middleware_accepts_database_role_case(): void
    {
        $department = Department::create([
            'name' => 'Computer Studies',
            'code' => 'DCS',
        ]);

        $admin = User::create([
            'employee_id' => 'EMP-002',
            'email' => 'admin2@example.test',
            'password_hash' => Hash::make('Password123'),
            'first_name' => 'Grace',
            'last_name' => 'Admin',
            'dept_id' => $department->id,
            'role' => 'Admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_deactivated_user_is_blocked_from_protected_routes(): void
    {
        $department = Department::create([
            'name' => 'Computer Studies',
            'code' => 'DCS',
        ]);

        $admin = User::create([
            'employee_id' => 'EMP-003',
            'email' => 'inactive@example.test',
            'password_hash' => Hash::make('Password123'),
            'first_name' => 'Inactive',
            'last_name' => 'Admin',
            'dept_id' => $department->id,
            'role' => 'Admin',
            'is_active' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/auth/me')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }
}
