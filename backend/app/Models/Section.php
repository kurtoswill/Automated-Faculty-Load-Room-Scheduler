<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'instructor_id',
        'section_name',
        'semester',
        'year_level',
        'expected_students',
        'day_of_week',
        'time_start',
        'time_end',
        'status',
    ];

    protected $casts = [
        'time_start' => 'datetime:H:i:s',
        'time_end' => 'datetime:H:i:s',
    ];

    public $timestamps = false;

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function studentSections()
    {
        return $this->hasMany(StudentSection::class, 'section_id');
    }

    public function roomRequests()
    {
        return $this->hasMany(RoomRequest::class, 'section_id');
    }

    public function confirmedSchedule()
    {
        return $this->hasOne(ConfirmedSchedule::class, 'section_id');
    }
}
