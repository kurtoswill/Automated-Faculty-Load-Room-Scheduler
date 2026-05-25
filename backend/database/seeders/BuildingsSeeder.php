<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BuildingsSeeder extends Seeder
{
    public function run(): void
    {
        if (!Schema::hasTable('buildings')) {
            return;
        }

        $now = now();

        DB::table('buildings')->where('code', '!=', 'DIT')->delete();

        $rows = [
            ['id' => 1, 'code' => 'DIT', 'name' => 'Department of Information Technology Building'],
        ];

        foreach ($rows as $row) {
            DB::table('buildings')->updateOrInsert(
                ['id' => $row['id']],
                [
                    'code' => $row['code'],
                    'name' => $row['name'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
