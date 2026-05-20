<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacultyLoadLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'max_units',
        'max_classes',
        'updated_by',
    ];

    public $timestamps = false;

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
