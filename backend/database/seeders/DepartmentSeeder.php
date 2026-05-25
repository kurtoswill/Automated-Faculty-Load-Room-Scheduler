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
        Department::query()->where('code', '!=', 'DIT')->delete();

        Department::upsert([
            ['name' => 'Department of Information Technology', 'code' => 'DIT'],
        ], ['code'], ['name']);
    }
}
