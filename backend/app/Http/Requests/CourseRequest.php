<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('id');

        return [
            'course_code' => ['required', 'string', 'max:20', 'unique:courses,course_code,' . $courseId],
            'course_title' => ['required', 'string', 'max:150'],
            'units' => ['required', 'numeric', 'min:0.5'],
            'dept_id' => ['required', 'exists:departments,id'],
        ];
    }
}
