<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('rooms', 'building_id')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->foreignId('building_id')
                    ->nullable()
                    ->after('room_number')
                    ->constrained('buildings')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('rooms', 'building_id')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropConstrainedForeignId('building_id');
            });
        }
    }
};

