<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: The academic catalog containing all available subjects[cite: 61, 62].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 64].
            $table->string('course_code', 20)->unique(); // e.g., CS 3101[cite: 65].
            $table->string('course_title', 150); // e.g., Web Systems[cite: 65, 66].
            $table->decimal('units', 3, 1); // Credit units[cite: 67].
            $table->foreignId('dept_id')->constrained('departments');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
