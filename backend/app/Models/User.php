<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'employee_id',
        'student_id',
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'dept_id',
        'role',
        'is_irregular',
        'is_active',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'is_irregular' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id');
    }

    public function facultyLoadLimit()
    {
        return $this->hasOne(FacultyLoadLimit::class, 'instructor_id');
    }

    public function sections()
    {
        return $this->hasMany(Section::class, 'instructor_id');
    }

    public function roomRequests()
    {
        return $this->hasMany(RoomRequest::class, 'instructor_id');
    }

    public function studentSections()
    {
        return $this->hasMany(StudentSection::class, 'student_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
