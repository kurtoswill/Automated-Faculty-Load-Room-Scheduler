<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'student_id' => $this->student_id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'dept_id' => $this->dept_id,
            'department' => $this->whenLoaded('department', fn () => new DepartmentResource($this->department)),
            'role' => $this->role,
            'is_irregular' => $this->is_irregular,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
