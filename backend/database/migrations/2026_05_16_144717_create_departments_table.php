<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Categorizes all users by their academic department[cite: 7].
 * - SCOPE: Used for profile display, filtering, and faculty load reports[cite: 7].
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id(); // id (PK): INT. Auto-incremented[cite: 8].
            $table->string('name', 100)->unique(); // Full department name[cite: 9, 10].
            $table->string('code', 10)->unique(); // Short display code (e.g., DCS)[cite: 10].
            $table->timestamps(); // Standard tracking
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
