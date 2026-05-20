<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Agent Context:
 * - PURPOSE: Transactional alerts generated during room request workflows[cite: 156].
 * - INTERFACE: Powers the /notifications page for all user roles[cite: 154].
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); // id (PK): INT[cite: 159].
            $table->foreignId('user_id')->constrained('users'); // Recipient[cite: 160].
            $table->enum('type', [
                'Request_Submitted',
                'Request_Approved',
                'Request_Rejected',
                'Request_Cancelled',
                'Booking_Released',
                'Load_Limit_Updated',
                'Room_Status_Changed'
            ]);
            $table->string('reference_table', 50);
            $table->integer('reference_id'); // Used for frontend deep-linking[cite: 164].
            $table->text('message'); // Rendered message body[cite: 166].
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
