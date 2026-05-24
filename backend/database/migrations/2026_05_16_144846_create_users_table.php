<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Central account table for Admins, Instructors, and Students.
 * - LOGIN: Uses institutional email as the login credential.
 * - ACCOUNT STATE: Deactivated accounts (is_active = FALSE) are blocked from logging in.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // id (PK): INT. Auto-incremented.
            $table->string('employee_id', 20)->nullable()->unique(); // NULL for Students.
            $table->string('student_id', 20)->nullable()->unique(); // NULL for Instructors/Admins.
            $table->string('email', 100)->unique(); // Institutional email.
            $table->text('password_hash'); // Hashed via password_hash().
            $table->string('first_name', 50);
            $table->string('last_name', 50);

            $table->foreignId('dept_id')->constrained('departments');
            $table->enum('role', ['Admin', 'Instructor', 'Student']); // Access control.

            $table->boolean('is_irregular')->default(false); // Student schedule flag.
            $table->boolean('is_active')->default(true); // Soft-deactivation logic.

            // This creates both created_at and updated_at columns to fix the QueryException
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
