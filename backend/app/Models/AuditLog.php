<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_log';

    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'action',
        'target_table',
        'target_id',
        'details',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
