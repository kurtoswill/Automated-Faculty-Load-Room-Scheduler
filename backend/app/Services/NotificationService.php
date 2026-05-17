<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public function notify(int $user_id, string $type, string $reference_table, int $reference_id, string $message): Notification
    {
        return Notification::create([
            'user_id' => $user_id,
            'type' => $type,
            'reference_table' => $reference_table,
            'reference_id' => $reference_id,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
