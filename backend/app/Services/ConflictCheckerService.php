<?php

namespace App\Services;

use App\Models\ConfirmedSchedule;
use App\Models\FacultyLoadLimit;
use App\Models\Room;
use App\Models\RoomRequest;
use Illuminate\Database\Eloquent\Relations\Relation;

class ConflictCheckerService
{
    public function isRoomAvailable(int $room_id, string $day, string $time_start, string $time_end, ?int $exclude_request_id = null): bool
    {
        $room = Room::find($room_id);

        if (! $room || ! $room->is_available) {
            return false;
        }

        $conflicts = RoomRequest::where('room_id', $room_id)
            ->where('day_of_week', $day)
            ->whereIn('status', ['Pending', 'Approved'])
            ->when($exclude_request_id, fn ($query, $exclude) => $query->where('id', '<>', $exclude))
            ->where(function ($query) use ($time_start, $time_end) {
                $query->whereBetween('time_start', [$time_start, $time_end])
                    ->orWhereBetween('time_end', [$time_start, $time_end])
                    ->orWhere(function ($query) use ($time_start, $time_end) {
                        $query->where('time_start', '<=', $time_start)
                            ->where('time_end', '>=', $time_end);
                    });
            })
            ->exists();

        return ! $conflicts;
    }

    public function isInstructorAvailable(int $instructor_id, string $day, string $time_start, string $time_end, ?int $exclude_request_id = null): bool
    {
        $conflicts = RoomRequest::where('instructor_id', $instructor_id)
            ->where('day_of_week', $day)
            ->whereIn('status', ['Pending', 'Approved'])
            ->when($exclude_request_id, fn ($query, $exclude) => $query->where('id', '<>', $exclude))
            ->where(function ($query) use ($time_start, $time_end) {
                $query->whereBetween('time_start', [$time_start, $time_end])
                    ->orWhereBetween('time_end', [$time_start, $time_end])
                    ->orWhere(function ($query) use ($time_start, $time_end) {
                        $query->where('time_start', '<=', $time_start)
                            ->where('time_end', '>=', $time_end);
                    });
            })
            ->exists();

        return ! $conflicts;
    }

    public function fitsCapacity(int $room_id, int $expected_students): bool
    {
        $room = Room::find($room_id);

        return $room && $room->capacity >= $expected_students;
    }

    public function isWithinLoadLimit(int $instructor_id, float $course_units): array
    {
        $limit = FacultyLoadLimit::where('instructor_id', $instructor_id)->first();

        if (! $limit) {
            return [
                'ok' => false,
                'message' => 'No faculty load limit has been configured for this instructor.',
                'remaining_units' => 0,
                'remaining_classes' => 0,
            ];
        }

        $current = ConfirmedSchedule::query()
            ->where('instructor_id', $instructor_id)
            ->where('is_active', true)
            ->join('sections', 'confirmed_schedule.section_id', '=', 'sections.id')
            ->join('courses', 'sections.course_id', '=', 'courses.id')
            ->selectRaw('COALESCE(SUM(courses.units), 0) as current_units, COUNT(confirmed_schedule.id) as current_classes')
            ->first();

        $currentUnits = $current->current_units ?? 0;
        $currentClasses = $current->current_classes ?? 0;
        $remainingUnits = max(0, $limit->max_units - $currentUnits);
        $remainingClasses = max(0, $limit->max_classes - $currentClasses);

        return [
            'ok' => ($currentUnits + $course_units) <= $limit->max_units && ($currentClasses + 1) <= $limit->max_classes,
            'remaining_units' => $remainingUnits,
            'remaining_classes' => $remainingClasses,
            'current_units' => $currentUnits,
            'current_classes' => $currentClasses,
            'limit_units' => $limit->max_units,
            'limit_classes' => $limit->max_classes,
        ];
    }
}
