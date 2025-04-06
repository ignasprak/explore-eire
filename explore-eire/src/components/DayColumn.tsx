import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AttractionCard } from "./AttractionCard";
import { TripItem } from "@/types/TripItem";

interface Props {
    day: number;
    items: TripItem[];
}

export function DayColumn({ day, items }: Props) {
    return (
        <div className="w-full border p-3 bg-gray-50 rounded mb-6">
            <h3 className="text-md font-semibold mb-3">Day {day}</h3>

            <SortableContext
                items={items.map(i => i.location_id)}
                strategy={verticalListSortingStrategy}
            >
                {items.map(item => (
                    <AttractionCard key={item.location_id} item={item} />
                ))}
            </SortableContext>
        </div>
    );
}
