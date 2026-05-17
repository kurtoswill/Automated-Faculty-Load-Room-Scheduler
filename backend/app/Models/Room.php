<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'building',
        'capacity',
        'type_id',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function type()
    {
        return $this->belongsTo(RoomType::class, 'type_id');
    }

    public function requests()
    {
        return $this->hasMany(RoomRequest::class, 'room_id');
    }

    public function confirmedSchedules()
    {
        return $this->hasMany(ConfirmedSchedule::class, 'room_id');
    }
}
