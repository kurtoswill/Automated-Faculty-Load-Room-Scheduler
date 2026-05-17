<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\FacultyLoadLimit;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $dcs = Department::firstWhere('code', 'DCS');
        $dit = Department::firstWhere('code', 'DIT');
        $dme = Department::firstWhere('code', 'DME');

        $instructorA = User::updateOrCreate([
            'email' => 'jane.doe@cvsu.edu.ph',
        ], [
            'employee_id' => 'EMP-1001',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'password_hash' => Hash::make('Instructor@123'),
            'dept_id' => $dcs->id,
            'role' => 'Instructor',
            'is_irregular' => false,
            'is_active' => true,
        ]);

        $instructorB = User::updateOrCreate([
            'email' => 'john.smith@cvsu.edu.ph',
        ], [
            'employee_id' => 'EMP-1002',
            'first_name' => 'John',
            'last_name' => 'Smith',
            'password_hash' => Hash::make('Instructor@123'),
            'dept_id' => $dit->id,
            'role' => 'Instructor',
            'is_irregular' => false,
            'is_active' => true,
        ]);

        FacultyLoadLimit::updateOrCreate([
            'instructor_id' => $instructorA->id,
        ], [
            'max_units' => 21.0,
            'max_classes' => 5,
            'updated_by' => User::firstWhere('role', 'Admin')->id,
        ]);

        FacultyLoadLimit::updateOrCreate([
            'instructor_id' => $instructorB->id,
        ], [
            'max_units' => 18.0,
            'max_classes' => 4,
            'updated_by' => User::firstWhere('role', 'Admin')->id,
        ]);

        $lecture = RoomType::firstWhere('name', 'Lecture');
        $lab = RoomType::firstWhere('name', 'Laboratory');

        Room::updateOrCreate(['room_number' => 'CS-101'], [
            'building' => 'Main Campus Building',
            'capacity' => 40,
            'type_id' => $lecture->id,
            'is_available' => true,
        ]);

        Room::updateOrCreate(['room_number' => 'CS-102'], [
            'building' => 'Main Campus Building',
            'capacity' => 30,
            'type_id' => $lecture->id,
            'is_available' => true,
        ]);

        Room::updateOrCreate(['room_number' => 'LAB-201'], [
            'building' => 'Science Complex',
            'capacity' => 25,
            'type_id' => $lab->id,
            'is_available' => true,
        ]);

        Course::updateOrCreate(['course_code' => 'CS101'], [
            'course_title' => 'Programming Fundamentals',
            'units' => 3.0,
            'dept_id' => $dcs->id,
        ]);

        Course::updateOrCreate(['course_code' => 'IT201'], [
            'course_title' => 'Network Systems',
            'units' => 3.0,
            'dept_id' => $dit->id,
        ]);

        $course = Course::firstWhere('course_code', 'CS101');

        Section::updateOrCreate([
            'course_id' => $course->id,
            'section_name' => 'CS101-A',
        ], [
            'instructor_id' => $instructorA->id,
            'semester' => '2026-1',
            'year_level' => 2,
            'expected_students' => 35,
            'day_of_week' => 'Monday',
            'time_start' => '08:00:00',
            'time_end' => '10:00:00',
            'status' => 'Draft',
        ]);
    }
}
