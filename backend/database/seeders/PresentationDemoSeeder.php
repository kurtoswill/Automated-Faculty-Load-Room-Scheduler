<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class PresentationDemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $deptId = DB::table('departments')->where('code', 'DIT')->value('id');
        $hasBuildingsTable = Schema::hasTable('buildings');
        $hasBuildingIdColumn = Schema::hasColumn('rooms', 'building_id');
        $ditBuildingId = $hasBuildingsTable
            ? DB::table('buildings')->where('name', 'DIT')->value('id')
            : null;
        $lectureTypeId = DB::table('room_types')->where('name', 'Lecture')->value('id');
        $labTypeId = DB::table('room_types')->where('name', 'Laboratory')->value('id');

        if (!$deptId || !$lectureTypeId || !$labTypeId) {
            return;
        }

        // Remove old demo users that should no longer exist
        DB::table('users')->whereIn('email', [
            'admin01@cvsu.edu.ph',
            'student01@cvsu.edu.ph',
            'instructor@cvsu.edu.ph',
        ])->delete();

        // Users
        DB::table('users')->updateOrInsert(
            ['email' => 'admin1@cvsu.edu.ph'],
            [
                'employee_id' => 'ADMIN-002',
                'student_id' => null,
                'password_hash' => Hash::make('password1234'),
                'first_name' => 'Jose',
                'last_name' => 'Rizal',
                'dept_id' => $deptId,
                'role' => 'Admin',
                'is_irregular' => 0,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'student1@cvsu.edu.ph'],
            [
                'employee_id' => null,
                'student_id' => 'STUDENT-001',
                'password_hash' => Hash::make('password1234'),
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'dept_id' => $deptId,
                'role' => 'Student',
                'is_irregular' => 0,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'instructor1@cvsu.edu.ph'],
            [
                'employee_id' => 'EMP-1003',
                'student_id' => null,
                'password_hash' => Hash::make('password1234'),
                'first_name' => 'Maria',
                'last_name' => 'Clara',
                'dept_id' => $deptId,
                'role' => 'Instructor',
                'is_irregular' => 0,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $adminId = DB::table('users')->where('email', 'admin1@cvsu.edu.ph')->value('id');
        $studentId = DB::table('users')->where('email', 'student1@cvsu.edu.ph')->value('id');
        $instructorId = DB::table('users')->where('email', 'instructor1@cvsu.edu.ph')->value('id');

        // Courses
        DB::table('courses')->updateOrInsert(
            ['course_code' => 'DCIT55'],
            [
                'course_title' => 'Advanced Database Management System',
                'units' => 3.0,
                'dept_id' => $deptId,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('courses')->updateOrInsert(
            ['course_code' => 'COSC70'],
            [
                'course_title' => 'Software Engineering 1',
                'units' => 3.0,
                'dept_id' => $deptId,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $course1Id = DB::table('courses')->where('course_code', 'DCIT55')->value('id');
        $course2Id = DB::table('courses')->where('course_code', 'COSC70')->value('id');

        // Rooms
        $room1 = [
            'building' => 'DIT',
            'capacity' => 40,
            'type_id' => $lectureTypeId,
            'is_available' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        if ($hasBuildingIdColumn) {
            $room1['building_id'] = $hasBuildingsTable ? $ditBuildingId : null;
        }
        DB::table('rooms')->updateOrInsert(['room_number' => 'CS-201'], $room1);

        $room2 = [
            'building' => 'DIT',
            'capacity' => 40,
            'type_id' => $labTypeId,
            'is_available' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        if ($hasBuildingIdColumn) {
            $room2['building_id'] = $hasBuildingsTable ? $ditBuildingId : null;
        }
        DB::table('rooms')->updateOrInsert(['room_number' => 'CL-204'], $room2);

        // Sections
        DB::table('sections')->updateOrInsert(
            ['section_name' => 'BSCS 2-2'],
            [
                'course_id' => $course1Id,
                'instructor_id' => $instructorId,
                'semester' => '1st Semester',
                'year_level' => 2,
                'expected_students' => 40,
                'day_of_week' => 'Monday',
                'time_start' => '08:00:00',
                'time_end' => '11:00:00',
                'status' => 'Confirmed',
                'created_at' => $now,
            ]
        );

        DB::table('sections')->updateOrInsert(
            ['section_name' => 'BSCS 2-6'],
            [
                'course_id' => $course2Id,
                'instructor_id' => $instructorId,
                'semester' => '1st Semester',
                'year_level' => 2,
                'expected_students' => 40,
                'day_of_week' => 'Wednesday',
                'time_start' => '13:00:00',
                'time_end' => '16:00:00',
                'status' => 'Confirmed',
                'created_at' => $now,
            ]
        );

        $section1Id = DB::table('sections')->where('section_name', 'BSCS 2-2')->value('id');
        $section2Id = DB::table('sections')->where('section_name', 'BSCS 2-6')->value('id');

        // Student assignments
        DB::table('student_section')->updateOrInsert(
            ['student_id' => $studentId, 'section_id' => $section1Id],
            ['assigned_by' => $adminId, 'assigned_at' => $now]
        );
        DB::table('student_section')->updateOrInsert(
            ['student_id' => $studentId, 'section_id' => $section2Id],
            ['assigned_by' => $adminId, 'assigned_at' => $now]
        );

        // Faculty load limit
        DB::table('faculty_load_limits')->updateOrInsert(
            ['instructor_id' => $instructorId],
            [
                'max_units' => 24,
                'max_classes' => 8,
                'updated_by' => $adminId,
                'updated_at' => $now,
            ]
        );

        // Room requests (presentation flow)
        $room1Id = DB::table('rooms')->where('room_number', 'CS-201')->value('id');
        $room2Id = DB::table('rooms')->where('room_number', 'CL-204')->value('id');

        $pendingRequestId = null;
        if ($section1Id && $room1Id && $instructorId) {
            DB::table('room_requests')->updateOrInsert(
                [
                    'section_id' => $section1Id,
                    'room_id' => $room1Id,
                    'instructor_id' => $instructorId,
                    'day_of_week' => 'Monday',
                    'time_start' => '08:00:00',
                    'time_end' => '11:00:00',
                ],
                [
                    'status' => 'Pending',
                    'admin_remarks' => null,
                    'submitted_at' => $now,
                    'reviewed_at' => null,
                    'reviewed_by' => null,
                ]
            );
            $pendingRequestId = DB::table('room_requests')
                ->where('section_id', $section1Id)
                ->where('room_id', $room1Id)
                ->where('instructor_id', $instructorId)
                ->value('id');
        }

        $approvedRequestId = null;
        if ($section2Id && $room2Id && $instructorId && $adminId) {
            DB::table('room_requests')->updateOrInsert(
                [
                    'section_id' => $section2Id,
                    'room_id' => $room2Id,
                    'instructor_id' => $instructorId,
                    'day_of_week' => 'Wednesday',
                    'time_start' => '13:00:00',
                    'time_end' => '16:00:00',
                ],
                [
                    'status' => 'Approved',
                    'admin_remarks' => 'Approved for demo schedule flow.',
                    'submitted_at' => $now,
                    'reviewed_at' => $now,
                    'reviewed_by' => $adminId,
                ]
            );
            $approvedRequestId = DB::table('room_requests')
                ->where('section_id', $section2Id)
                ->where('room_id', $room2Id)
                ->where('instructor_id', $instructorId)
                ->value('id');
        }

        // Confirmed schedule linked to approved request
        if ($approvedRequestId && $section2Id && $room2Id && $instructorId) {
            DB::table('confirmed_schedule')->updateOrInsert(
                ['request_id' => $approvedRequestId],
                [
                    'section_id' => $section2Id,
                    'room_id' => $room2Id,
                    'instructor_id' => $instructorId,
                    'day_of_week' => 'Wednesday',
                    'time_start' => '13:00:00',
                    'time_end' => '16:00:00',
                    'is_active' => 1,
                    'confirmed_at' => $now,
                ]
            );
        }

        // Notifications for demo visibility
        if ($pendingRequestId && $instructorId) {
            DB::table('notifications')->updateOrInsert(
                [
                    'user_id' => $instructorId,
                    'type' => 'Request_Submitted',
                    'reference_table' => 'room_requests',
                    'reference_id' => $pendingRequestId,
                ],
                [
                    'message' => 'Your room request is pending review.',
                    'is_read' => 0,
                    'created_at' => $now,
                ]
            );
        }

        if ($approvedRequestId && $instructorId) {
            DB::table('notifications')->updateOrInsert(
                [
                    'user_id' => $instructorId,
                    'type' => 'Request_Approved',
                    'reference_table' => 'room_requests',
                    'reference_id' => $approvedRequestId,
                ],
                [
                    'message' => 'Your room request was approved.',
                    'is_read' => 0,
                    'created_at' => $now,
                ]
            );
        }

        if ($approvedRequestId && $studentId) {
            DB::table('notifications')->updateOrInsert(
                [
                    'user_id' => $studentId,
                    'type' => 'Request_Approved',
                    'reference_table' => 'room_requests',
                    'reference_id' => $approvedRequestId,
                ],
                [
                    'message' => 'A class schedule has been confirmed for your section.',
                    'is_read' => 0,
                    'created_at' => $now,
                ]
            );
        }
    }
}
