<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $departmentId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:100', 'unique:departments,name,'.$departmentId],
            'code' => ['required', 'string', 'max:10', 'unique:departments,code,'.$departmentId],
        ];
    }
}
