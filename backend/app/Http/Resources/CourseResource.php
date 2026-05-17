<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'course_code' => $this->course_code,
            'course_title' => $this->course_title,
            'units' => $this->units,
            'dept_id' => $this->dept_id,
        ];
    }
}
