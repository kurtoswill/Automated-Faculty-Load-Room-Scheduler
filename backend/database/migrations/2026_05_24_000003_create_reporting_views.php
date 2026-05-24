<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS vw_master_schedule');
        DB::statement('DROP VIEW IF EXISTS vw_faculty_load_summary');

        DB::statement(<<<'SQL'
            CREATE VIEW vw_master_schedule AS
            SELECT
                cs.id,
                cs.request_id,
                cs.section_id,
                cs.room_id,
                cs.instructor_id,
                cs.day_of_week,
                cs.time_start,
                cs.time_end,
                cs.is_active,
                r.room_number,
                r.building,
                r.capacity,
                rt.name AS room_type,
                s.section_name,
                s.year_level,
                s.expected_students,
                c.course_code,
                c.course_title,
                u.first_name AS instructor_first_name,
                u.last_name AS instructor_last_name
            FROM confirmed_schedule cs
            INNER JOIN rooms r ON r.id = cs.room_id
            LEFT JOIN room_types rt ON rt.id = r.type_id
            INNER JOIN sections s ON s.id = cs.section_id
            INNER JOIN courses c ON c.id = s.course_id
            INNER JOIN users u ON u.id = cs.instructor_id
        SQL);

        DB::statement(<<<'SQL'
            CREATE VIEW vw_faculty_load_summary AS
            SELECT
                u.id AS instructor_id,
                CONCAT(u.first_name, ' ', u.last_name) AS instructor_full_name,
                u.employee_id,
                u.first_name,
                u.last_name,
                u.dept_id,
                d.code AS dept_code,
                d.name AS dept_name,
                COALESCE(fll.max_units, 0) AS max_units,
                COALESCE(fll.max_classes, 0) AS max_classes,
                COALESCE(SUM(c.units), 0) AS current_units,
                COUNT(cs.id) AS current_classes,
                COALESCE(fll.max_units, 0) - COALESCE(SUM(c.units), 0) AS remaining_units,
                COALESCE(fll.max_classes, 0) - COUNT(cs.id) AS remaining_classes,
                CASE
                    WHEN COALESCE(fll.max_units, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(SUM(c.units), 0) / fll.max_units) * 100, 2)
                END AS utilization_percent
            FROM users u
            LEFT JOIN departments d ON d.id = u.dept_id
            LEFT JOIN faculty_load_limits fll ON fll.instructor_id = u.id
            LEFT JOIN confirmed_schedule cs
                ON cs.instructor_id = u.id
                AND cs.is_active = 1
            LEFT JOIN sections s ON s.id = cs.section_id
            LEFT JOIN courses c ON c.id = s.course_id
            WHERE u.role = 'Instructor'
            GROUP BY
                u.id,
                u.employee_id,
                u.first_name,
                u.last_name,
                u.dept_id,
                d.code,
                d.name,
                fll.max_units,
                fll.max_classes
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS vw_master_schedule');
        DB::statement('DROP VIEW IF EXISTS vw_faculty_load_summary');
    }
};
