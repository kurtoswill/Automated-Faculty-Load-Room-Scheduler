<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section_id' => [
                'required',
                Rule::exists('sections', 'id')->where('instructor_id', $this->user()->id),
            ],
            'room_id' => [
                'required',
                Rule::exists('rooms', 'id')->where('is_available', true),
            ],
            'instructor_id' => ['nullable', 'exists:users,id'],
            'day_of_week' => ['required', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'],
            'time_start' => ['required', 'date_format:H:i:s'],
            'time_end' => ['required', 'date_format:H:i:s', 'after:time_start'],
        ];
    }
}
