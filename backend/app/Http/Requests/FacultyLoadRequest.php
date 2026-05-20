<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FacultyLoadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'instructor_id' => ['required', 'exists:users,id'],
            'max_units' => ['required', 'numeric', 'min:0'],
            'max_classes' => ['required', 'integer', 'min:0'],
            'updated_by' => ['required', 'exists:users,id'],
        ];
    }
}
