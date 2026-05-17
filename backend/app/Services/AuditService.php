<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public function log(int $actor_id, string $action, string $target_table, int $target_id, string $details): AuditLog
    {
        return AuditLog::create([
            'actor_id' => $actor_id,
            'action' => $action,
            'target_table' => $target_table,
            'target_id' => $target_id,
            'details' => $details,
        ]);
    }
}
