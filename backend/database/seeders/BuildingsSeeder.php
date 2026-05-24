<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BuildingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $rows = [
            'DIT',
            'CAS',
            'Old CEMDS',
            'New CEMDS',
            'CSPEAR',
        ];

        foreach ($rows as $name) {
            DB::table('buildings')->updateOrInsert(
                ['name' => $name],
                ['created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}

