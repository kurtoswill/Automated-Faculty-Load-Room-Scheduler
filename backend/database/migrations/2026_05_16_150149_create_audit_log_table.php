<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Append-only accountability record of significant actions[cite: 138, 142].
 * - RETENTION: Records are never modified or deleted[cite: 139, 140].
 */
return new class extends Migration {
    public function up(): void {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 144].
            $table->foreignId('actor_id')->constrained('users'); // Action performer[cite: 145].
            $table->string('action', 100); // e.g., APPROVE_REQUEST[cite: 146].
            $table->string('target_table', 50); // e.g., Rooms[cite: 148].
            $table->integer('target_id'); // PK of affected record[cite: 149].
            $table->text('details'); // Human-readable change log[cite: 150].
            $table->timestamp('performed_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('audit_log');
    }
};