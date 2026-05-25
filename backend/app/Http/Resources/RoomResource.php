<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'building_id' => $this->building_id,
            'building' => $this->building,
            'capacity' => $this->capacity,
            'is_available' => $this->is_available,
            'type' => $this->whenLoaded('type', fn () => new RoomTypeResource($this->type)),
            'created_at' => $this->created_at,
        ];
    }
}
