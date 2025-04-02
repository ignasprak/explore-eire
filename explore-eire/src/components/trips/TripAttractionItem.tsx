"use client";

import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemType = "ATTRACTION";

interface TripAttractionItemProps {
    item: any;
    index: number;
    moveItem: (from: number, to: number) => void;
    onSelect: () => void;
    onRemove: () => void;
}

export function TripAttractionItem({ item, index, moveItem, onSelect, onRemove }: TripAttractionItemProps) {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: ItemType,
        hover(draggedItem: { index: number }, monitor) {
            if (!ref.current) return;
            const dragIndex = draggedItem.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveItem(dragIndex, hoverIndex);
            draggedItem.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className="p-3 border rounded bg-gray-100 flex justify-between items-center cursor-pointer"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div onClick={onSelect}>
                <h4 className="font-semibold">{item.attractions?.Name}</h4>
                <p className="text-sm">{item.attractions?.Address}</p>
                {item.attractions?.Url && (
                    <a
                        href={item.attractions.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                    >
                        Visit Website
                    </a>
                )}
            </div>
            <button onClick={onRemove} className="text-gray-500 hover:text-red-500 transition">
                <i className="ri-close-line text-xl"></i>
            </button>
        </div>
    );
}
