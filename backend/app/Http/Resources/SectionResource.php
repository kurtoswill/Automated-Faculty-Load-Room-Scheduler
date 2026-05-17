<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'course' => new CourseResource($this->whenLoaded('course')),
            'instructor' => new UserResource($this->whenLoaded('instructor')),
            'section_name' => $this->section_name,
            'semester' => $this->semester,
            'year_level' => $this->year_level,
            'expected_students' => $this->expected_students,
            'day_of_week' => $this->day_of_week,
            'time_start' => $this->time_start,
            'time_end' => $this->time_end,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
