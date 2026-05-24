<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roomId = $this->route('id');

        return [
            'room_number' => ['required', 'string', 'max:20', 'unique:rooms,room_number,'.$roomId],
            'building' => ['required', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1'],
            'type_id' => ['required', 'exists:room_types,id'],
            'is_available' => ['boolean'],
        ];
    }
}
