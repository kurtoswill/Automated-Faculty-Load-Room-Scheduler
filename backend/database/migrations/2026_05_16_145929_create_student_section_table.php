<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Read-only link between Students and their assigned Sections[cite: 91].
 * - CONSTRAINT: UNIQUE(student_id, section_id) prevents double assignment[cite: 99].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_section', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 94].
            $table->foreignId('student_id')->constrained('users');
            $table->foreignId('section_id')->constrained('sections');
            $table->foreignId('assigned_by')->constrained('users'); // Admin actor[cite: 97].
            $table->timestamp('assigned_at')->useCurrent();

            $table->unique(['student_id', 'section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_section');
    }
};
