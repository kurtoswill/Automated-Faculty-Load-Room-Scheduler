<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfirmedSchedule extends Model
{
    use HasFactory;

    protected $table = 'confirmed_schedule';

    protected $fillable = [
        'request_id',
        'section_id',
        'room_id',
        'instructor_id',
        'day_of_week',
        'time_start',
        'time_end',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public $timestamps = false;

    public function request()
    {
        return $this->belongsTo(RoomRequest::class, 'request_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
