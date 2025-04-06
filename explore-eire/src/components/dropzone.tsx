"use client";
import { useDrop } from "react-dnd";
import { DndTypes } from "@/lib/dndTypes";
import { TripAttractionItem } from "./TripAttractionItem";

interface DropZoneProps {
    day: number;
    items: any[];
    onDrop: (draggedItem: any, newDay: number) => void;
}

export function DropZone({ day, items, onDrop }: DropZoneProps) {
    const [, dropRef] = useDrop({
        accept: DndTypes.TRIP_ITEM,
        drop: (draggedItem) => {
            onDrop(draggedItem, day);
        },
    });

    return (
        <div
            ref={dropRef}
            className="bg-white border rounded-md p-2 min-h-[100px] space-y-2"
        >
            {items.map((item, index) => (
                <TripAttractionItem key={item.location_id} item={item} index={index} day={day} />
            ))}

            {items.length === 0 && (
                <p className="text-gray-400 text-sm italic">Drop attractions here</p>
            )}
        </div>
    );
}
