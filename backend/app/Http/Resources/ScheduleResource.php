<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'schedule_id' => $this->id,
            'room_number' => $this->room?->room_number,
            'building' => $this->room?->building,
            'room_type' => $this->room?->type?->name,
            'course_code' => $this->section?->course?->course_code,
            'course_title' => $this->section?->course?->course_title,
            'section_name' => $this->section->section_name,
            'semester' => $this->semester,
            'year_level' => $this->section->year_level,
            'instructor_full_name' => $this->instructor?->full_name,
            'dept_name' => $this->instructor?->department?->name,
            'day_of_week' => $this->day_of_week,
            'time_start' => $this->time_start,
            'time_end' => $this->time_end,
            'is_active' => $this->is_active,
            'confirmed_at' => $this->confirmed_at,
        ];
    }
}
