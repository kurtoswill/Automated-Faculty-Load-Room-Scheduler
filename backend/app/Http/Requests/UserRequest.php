<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'employee_id' => ['nullable', 'string', 'max:20', 'unique:users,employee_id,'.$userId],
            'student_id' => ['nullable', 'string', 'max:20', 'unique:users,student_id,'.$userId],
            'email' => ['required', 'email', 'max:100', 'unique:users,email,'.$userId],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8'],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'dept_id' => ['required', 'exists:departments,id'],
            'role' => ['required', 'in:Admin,Instructor,Student'],
            'is_irregular' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
