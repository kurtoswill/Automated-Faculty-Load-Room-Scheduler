<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Records room booking requests submitted by Instructors[cite: 104].
 * - AUTOMATION: Validates room/instructor availability and faculty load[cite: 105].
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_requests', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 107].
            $table->foreignId('section_id')->constrained('sections');
            $table->foreignId('room_id')->constrained('rooms');
            $table->foreignId('instructor_id')->constrained('users');
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('time_start');
            $table->time('time_end');
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Released'])->default('Pending');
            $table->text('admin_remarks')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_requests');
    }
};
