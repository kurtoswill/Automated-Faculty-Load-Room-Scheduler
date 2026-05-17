<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_code',
        'course_title',
        'units',
        'dept_id',
    ];

    protected $casts = [
        'units' => 'decimal:1',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id');
    }

    public function sections()
    {
        return $this->hasMany(Section::class, 'course_id');
    }
}
