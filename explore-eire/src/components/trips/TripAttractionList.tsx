"use client";

import { TripAttractionItem } from "./TripAttractionItem";

interface TripAttractionListProps {
    items: any[];
    setItems: (items: any[]) => void;
    onSelect: (item: any) => void;
    onRemove: (item: any) => void;
}

export function TripAttractionList({ items, setItems, onSelect, onRemove }: TripAttractionListProps) {
    const moveItem = (from: number, to: number) => {
        const updated = [...items];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setItems(updated);
    };

    return (
        <div className="flex flex-col space-y-2 overflow-y-auto max-h-[75%] pr-1">
            {items.map((item, index) => (
                <TripAttractionItem
                    key={item.location_id}
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    onSelect={() => onSelect(item)}
                    onRemove={() => onRemove(item)}
                />
            ))}
        </div>
    );
}
