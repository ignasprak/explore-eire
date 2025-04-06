"use client";

import { useDraggable } from "@dnd-kit/core";

interface Props {
    item: {
        location_id: string;
        attractions?: {
            Name: string;
            Address: string;
            Url?: string;
        };
    };
}

export default function DraggableItem({ item }: Props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.location_id,
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="p-2 bg-white border rounded shadow cursor-move space-y-1"
        >
            <h4 className="font-semibold">{item.attractions?.Name || item.location_id}</h4>
            <p className="text-sm text-gray-600">{item.attractions?.Address}</p>
            {item.attractions?.Url && (
                <a
                    href={item.attractions.Url}
                    className="text-sm text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    Visit Website
                </a>
            )}
        </div>
    );
}
