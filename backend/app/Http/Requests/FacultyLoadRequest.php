<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FacultyLoadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'instructor_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'Instructor'),
            ],
            'max_units' => ['required', 'numeric', 'min:0'],
            'max_classes' => ['required', 'integer', 'min:0'],
        ];
    }
}
