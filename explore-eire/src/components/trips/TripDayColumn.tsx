import { TripItem } from "./types";
import { TripAttractionItem } from "./TripAttractionItem";
import { DropZone } from "../dropzone";

interface TripDayColumnProps {
    day: number;
    items: TripItem[];
    allItems: TripItem[];
    setItems: (items: TripItem[]) => void;
    tripId: string;
    onSelect: (item: TripItem) => void;
    onRemove: (item: TripItem) => void;
    refetchTrips: () => Promise<void>;
}

export function TripDayColumn({
    day,
    items,
    allItems,
    setItems,
    tripId,
    onSelect,
    onRemove,
    refetchTrips,
}: TripDayColumnProps) {
    return (
        <div>
            <h3 className="text-sm font-bold text-gray-600 mb-2">Day {day}</h3>
            <DropZone
                day={day}
                items={items}
                allItems={allItems}
                setItems={setItems}
                tripId={tripId}
                onSelect={onSelect}
                onRemove={onRemove}
                refetchTrips={refetchTrips}
            />
        </div>
    );
}
