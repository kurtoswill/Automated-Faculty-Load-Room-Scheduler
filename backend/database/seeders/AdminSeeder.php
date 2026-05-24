<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $department = Department::firstWhere('code', 'DCS') ?? Department::first();

        User::updateOrCreate([
            'email' => 'admin@cvsu.edu.ph',
        ], [
            'employee_id' => 'ADMIN-001',
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'password_hash' => Hash::make('Admin@1234'),
            'dept_id' => $department->id,
            'role' => 'Admin',
            'is_active' => true,
        ]);
    }
}
