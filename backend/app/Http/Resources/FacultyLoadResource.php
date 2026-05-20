<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FacultyLoadResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'instructor_id' => $this->instructor_id ?? null,
            'instructor_name' => $this->instructor_name ?? null,
            'total_load' => $this->total_load ?? 0,
            'credit_hours' => $this->credit_hours ?? 0,
            'load_utilization' => $this->load_utilization ?? 0,
            'active_assignments' => $this->active_assignments ?? 0,
            'pending_assignments' => $this->pending_assignments ?? 0,
        ];
    }
}
