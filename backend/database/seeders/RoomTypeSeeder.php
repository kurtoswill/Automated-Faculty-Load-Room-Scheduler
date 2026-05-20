<?php

namespace Database\Seeders;

use App\Models\RoomType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach (['Lecture', 'Laboratory', 'Seminar', 'AVR', 'Gymnasium'] as $name) {
            RoomType::firstOrCreate(['name' => $name]);
        }
    }
}
