<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'section' => new SectionResource($this->whenLoaded('section')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'instructor' => new UserResource($this->whenLoaded('instructor')),
            'day_of_week' => $this->day_of_week,
            'time_start' => $this->time_start,
            'time_end' => $this->time_end,
            'status' => $this->status,
            'admin_remarks' => $this->admin_remarks,
            'submitted_at' => $this->submitted_at,
            'reviewed_at' => $this->reviewed_at,
            'reviewed_by' => $this->whenLoaded('reviewer', fn () => new UserResource($this->reviewer)),
        ];
    }
}
