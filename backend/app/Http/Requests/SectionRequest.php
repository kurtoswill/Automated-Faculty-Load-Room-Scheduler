<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'exists:courses,id'],
            'instructor_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'Instructor'),
            ],
            'section_name' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'string', 'max:20'],
            'year_level' => ['required', 'integer', 'between:1,5'],
            'expected_students' => ['required', 'integer', 'min:1'],
            'day_of_week' => ['required', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'],
            'time_start' => ['required', 'date_format:H:i:s'],
            'time_end' => ['required', 'date_format:H:i:s', 'after:time_start'],
            'status' => ['required', 'in:Draft,Pending,Confirmed,Cancelled'],
        ];
    }
}
