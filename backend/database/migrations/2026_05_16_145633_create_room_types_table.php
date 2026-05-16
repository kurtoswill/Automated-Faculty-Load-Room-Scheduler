<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Classifies rooms (e.g., Lecture, Laboratory, Gymnasium) for filtering[cite: 33, 35].
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 34].
            $table->string('name', 50)->unique(); // Classification name[cite: 35].
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
