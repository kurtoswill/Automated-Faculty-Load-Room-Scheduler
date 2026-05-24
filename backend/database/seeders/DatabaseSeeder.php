<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
            RoomTypeSeeder::class,
            BuildingsSeeder::class,
        ]);

        // 1. Create a dummy department first so the foreign key (dept_id) exists
        $department = Department::updateOrCreate(
            ['code' => 'DCS'],
            ['name' => 'Department of Computer Studies']
        );

        // 2. Admin Account
        User::updateOrCreate(
            ['email' => 'admin01@cvsu.edu.ph'],
            [
                'employee_id' => 'ADMIN-002',
                'student_id' => null,
                'first_name' => 'Admin',
                'last_name' => 'One',
                'password_hash' => Hash::make('admin1234'),
                'dept_id' => $department->id, // Uses the real ID from the database
                'role' => 'Admin',
                'is_active' => true,
            ]
        );

        // 3. Student Account
        User::updateOrCreate(
            ['email' => 'student01@cvsu.edu.ph'],
            [
                'employee_id' => null,
                'student_id' => 'STUDENT-001',
                'first_name' => 'Student',
                'last_name' => 'One',
                'password_hash' => Hash::make('student1234'),
                'dept_id' => $department->id,
                'role' => 'Student',
                'is_active' => true,
            ]
        );

        // 4. Instructor Account
        User::updateOrCreate(
            ['email' => 'instructor@cvsu.edu.ph'],
            [
                'employee_id' => 'EMP-1003',
                'student_id' => null,
                'first_name' => 'Instructor',
                'last_name' => 'One',
                'password_hash' => Hash::make('instructor1234'),
                'dept_id' => $department->id,
                'role' => 'Instructor',
                'is_active' => true,
            ]
        );
    }
}
