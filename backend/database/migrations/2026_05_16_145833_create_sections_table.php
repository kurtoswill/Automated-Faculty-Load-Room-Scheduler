<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Active class sections offered in the current semester[cite: 70].
 * - STATUS: Draft (no request), Pending (review), Confirmed (live), Cancelled (inactive)[cite: 84, 86].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 73].
            $table->foreignId('course_id')->constrained('courses');
            $table->foreignId('instructor_id')->constrained('users');
            $table->string('section_name', 20); // e.g., BSCS 3-A[cite: 76].
            $table->string('semester', 20); // e.g., 2025-2026 1st Sem[cite: 77].
            $table->integer('year_level');
            $table->integer('expected_students'); // Validated against room capacity[cite: 80].
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('time_start');
            $table->time('time_end');
            $table->enum('status', ['Draft', 'Pending', 'Confirmed', 'Cancelled'])->default('Draft');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
