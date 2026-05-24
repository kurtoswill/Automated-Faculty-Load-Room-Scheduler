<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Stores complete profiles of every schedulable campus room[cite: 37].
 * - CAPACITY: Strictly enforced; requests exceeding this value are blocked[cite: 41].
 * - AVAILABILITY: Admin sets is_available=FALSE during renovations[cite: 43].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 38].
            $table->string('room_number', 20)->unique(); // e.g., CS-101[cite: 39].
            $table->string('building', 100); // Official building location[cite: 40].
            $table->integer('capacity'); // Max student headcount[cite: 41].
            $table->foreignId('type_id')->constrained('room_types');
            $table->boolean('is_available')->default(true); // General usability flag[cite: 43].
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
