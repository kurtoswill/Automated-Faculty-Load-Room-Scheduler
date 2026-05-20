<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Department::upsert([
            ['name' => 'Department of Computer Science', 'code' => 'DCS'],
            ['name' => 'Department of Information Technology', 'code' => 'DIT'],
            ['name' => 'Department of Mechanical Engineering', 'code' => 'DME'],
        ], ['code'], ['name']);
    }
}
