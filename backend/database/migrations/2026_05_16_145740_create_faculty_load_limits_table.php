<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Enforces maximum teaching load (units/classes) per Instructor[cite: 47, 50].
 * - VALIDATION: Read during request approval to prevent over-scheduling[cite: 51].
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('faculty_load_limits', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 52].
            $table->foreignId('instructor_id')->unique()->constrained('users'); // One record per Instructor[cite: 53].
            $table->decimal('max_units', 4, 1); // e.g., 21.0[cite: 54].
            $table->integer('max_classes'); // Max class sections per week[cite: 55].
            $table->foreignId('updated_by')->constrained('users'); // Admin actor[cite: 56].
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_load_limits');
    }
};
