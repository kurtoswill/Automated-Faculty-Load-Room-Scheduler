<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: The system's master schedule; entries are auto-inserted upon request approval[cite: 121, 122].
 * - AVAILABILITY: Setting is_active=FALSE releases the slot back to available[cite: 125].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('confirmed_schedule', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 127].
            $table->foreignId('request_id')->unique()->constrained('room_requests'); // UNIQUE ensures 1 request = 1 slot[cite: 128].
            $table->foreignId('section_id')->constrained('sections');
            $table->foreignId('room_id')->constrained('rooms');
            $table->foreignId('instructor_id')->constrained('users');
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('time_start');
            $table->time('time_end');
            $table->boolean('is_active')->default(true);
            $table->timestamp('confirmed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('confirmed_schedule');
    }
};
