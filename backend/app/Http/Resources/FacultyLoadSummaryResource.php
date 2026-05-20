<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FacultyLoadSummaryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'instructor_id' => $this->instructor_id,
            'full_name' => $this->instructor_full_name ?? $this->instructor?->full_name,
            'dept_name' => $this->dept_name ?? $this->instructor?->department?->name,
            'max_units' => $this->max_units,
            'max_classes' => $this->max_classes,
            'current_units' => $this->current_units,
            'current_classes' => $this->current_classes,
            'remaining_units' => $this->remaining_units,
            'remaining_classes' => $this->remaining_classes,
        ];
    }
}
