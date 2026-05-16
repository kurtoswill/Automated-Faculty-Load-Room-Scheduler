<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Central account table for Admins, Instructors, and Students[cite: 12].
 * - LOGIN: Uses institutional email as the login credential[cite: 19].
 * - ACCOUNT STATE: Deactivated accounts (is_active = FALSE) are blocked from logging in[cite: 28, 29].
 */
return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // id (PK): INT. Auto-incremented[cite: 16].
            $table->string('employee_id', 20)->nullable()->unique(); // NULL for Students[cite: 17].
            $table->string('student_id', 20)->nullable()->unique(); // NULL for Instructors/Admins[cite: 18].
            $table->string('email', 100)->unique(); // Institutional email[cite: 19].
            $table->text('password_hash'); // Hashed via password_hash()[cite: 20].
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            
            $table->foreignId('dept_id')->constrained('departments');
            $table->enum('role', ['Admin', 'Instructor', 'Student']); // Access control[cite: 24].
            
            $table->boolean('is_irregular')->default(false); // TRUE for students with back subjects[cite: 25, 26].
            $table->boolean('is_active')->default(true); // Soft-deactivation logic[cite: 28].
            
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('users');
    }
};