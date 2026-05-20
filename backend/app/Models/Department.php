<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    public $timestamps = false;

    public function users()
    {
        return $this->hasMany(User::class, 'dept_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'dept_id');
    }
}
